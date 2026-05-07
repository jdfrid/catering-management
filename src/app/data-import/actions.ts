"use server";

import { revalidatePath } from "next/cache";
import { runCsvImport } from "@/lib/csv-import";
import {
  type CsvImportActionState,
  isImportEntity,
} from "@/app/data-import/config";

function revalidateImportedPaths() {
  revalidatePath("/customers");
  revalidatePath("/menu");
  revalidatePath("/menu/ingredients");
  revalidatePath("/purchasing/suppliers");
  revalidatePath("/purchasing/prices");
  revalidatePath("/events");
  revalidatePath("/quotes");
  revalidatePath("/data-import");
}

export async function importCsvAction(
  _prev: CsvImportActionState | null,
  formData: FormData,
): Promise<CsvImportActionState> {
  const entityRaw = String(formData.get("entity") ?? "");
  const file = formData.get("file");

  if (!isImportEntity(entityRaw)) {
    return {
      ok: false,
      message: "נא לבחור סוג רשימה",
      result: null,
    };
  }

  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      message: "נא לבחור קובץ (CSV מייצוא אקסל)",
      result: null,
    };
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return {
      ok: false,
      message: "לא ניתן לקרוא את הקובץ",
      result: null,
    };
  }

  const result = await runCsvImport(entityRaw, text);
  revalidateImportedPaths();

  const hasRows = result.inserted + result.updated > 0;
  const msgParts: string[] = [];
  if (result.inserted) msgParts.push(`נוספו ${result.inserted}`);
  if (result.updated) msgParts.push(`עודכנו ${result.updated}`);
  if (result.skipped) msgParts.push(`דולגו ${result.skipped}`);
  const summary =
    msgParts.length > 0 ? msgParts.join(" · ") : "לא עודכנו שורות";

  const ok = result.errors.length === 0 && hasRows;
  const message =
    result.errors.length > 0
      ? `${summary}. יש ${result.errors.length} שגיאות (מוצגות להלן).`
      : hasRows
        ? `${summary}.`
        : "לא בוצעו שינויים — בדקו פורמט וכותרות עמודות.";

  return {
    ok,
    message,
    result,
  };
}
