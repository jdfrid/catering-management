"use server";

import { revalidatePath } from "next/cache";
import {
  runCsvImport,
  type ImportEntity,
  type ImportResult,
} from "@/lib/csv-import";

export type CsvImportActionState = {
  ok: boolean;
  message: string;
  result: ImportResult | null;
};

export const IMPORT_ENTITIES: {
  value: ImportEntity;
  label: string;
  hint: string;
}[] = [
  {
    value: "customers",
    label: "לקוחות",
    hint: "שם, סוג, טלפון, אימייל, כתובת, ח.פ, הערות, פעיל",
  },
  {
    value: "customer_contacts",
    label: "אנשי קשר ללקוח",
    hint: "שם לקוח, טלפון לקוח, שם איש קשר, תפקיד, טלפון, אימייל",
  },
  {
    value: "suppliers",
    label: "ספקים",
    hint: "שם, קטגוריה, איש קשר, טלפון, אימייל, ימי אספקה, מינ׳ם הזמנה, פעיל",
  },
  {
    value: "ingredients",
    label: "חומרי גלם",
    hint: "שם, סוג, יחידה, ספק מועדף (שם), פעיל",
  },
  {
    value: "menu_items",
    label: "מנות (תפריט)",
    hint: "שם, קטגוריה, יחידת מכירה, כמות בסיס, מחיר מומלץ, דקות הכנה/בישול, הוראות, פעיל",
  },
  {
    value: "supplier_prices",
    label: "מחירון ספקים",
    hint: "שם ספק, שם חומר גלם, מחיר, יחידת מחיר, תקף מ, תקף עד, הערות",
  },
  {
    value: "recipe_components",
    label: "שורות מתכון (עץ מוצר)",
    hint: "שם מנה, שם חומר גלם, כמות, יחידה, פחת, הערות",
  },
  {
    value: "events",
    label: "אירועים",
    hint: "שם לקוח, טלפון לקוח, שם אירוע, סוג, תאריך, מספר מוזמנים, רמת שירות, כתובת, סטטוס…",
  },
];

function isImportEntity(v: string): v is ImportEntity {
  return IMPORT_ENTITIES.some((x) => x.value === v);
}

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
