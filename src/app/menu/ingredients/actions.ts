"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/forms";
import { errState, okState } from "@/lib/forms";
import { INGREDIENT_TYPES, SALE_UNITS } from "@/lib/constants";

const types = [...INGREDIENT_TYPES] as [string, ...string[]];
const units = [...SALE_UNITS] as [string, ...string[]];

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const ingSchema = z.object({
  name: z.string().min(1, "שם חובה"),
  type: z.enum(types),
  unit: z.enum(units),
  preferredSupplierId: z.string().optional(),
});

function optSupplier(v: string | undefined): string | null {
  const t = v?.trim() ?? "";
  if (t === "") return null;
  return t;
}

export async function createIngredient(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ingSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    type: String(formData.get("type") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    preferredSupplierId: optionalStr(formData.get("preferredSupplierId")),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const sid = optSupplier(parsed.data.preferredSupplierId);
  if (sid) {
    const s = await prisma.supplier.findUnique({ where: { id: sid } });
    if (!s) return errState({ preferredSupplierId: "ספק לא נמצא" });
  }

  await prisma.ingredient.create({
    data: {
      name: parsed.data.name.trim(),
      type: parsed.data.type,
      unit: parsed.data.unit,
      preferredSupplierId: sid,
      active: true,
    },
  });

  revalidatePath("/menu/ingredients");
  redirect("/menu/ingredients");
}

export async function updateIngredient(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return errState({ _form: "חסר מזהה" });

  const parsed = ingSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    type: String(formData.get("type") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    preferredSupplierId: optionalStr(formData.get("preferredSupplierId")),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const sid = optSupplier(parsed.data.preferredSupplierId);
  if (sid) {
    const s = await prisma.supplier.findUnique({ where: { id: sid } });
    if (!s) return errState({ preferredSupplierId: "ספק לא נמצא" });
  }

  const active = formData.get("active") === "on";

  await prisma.ingredient.update({
    where: { id },
    data: {
      name: parsed.data.name.trim(),
      type: parsed.data.type,
      unit: parsed.data.unit,
      preferredSupplierId: sid,
      active,
    },
  });

  revalidatePath("/menu/ingredients");
  revalidatePath(`/menu/ingredients/${id}`);
  revalidatePath("/menu");
  return okState("נשמר");
}

export async function deleteIngredient(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const used = await prisma.recipeComponent.count({
    where: { ingredientId: id },
  });
  if (used > 0) {
    redirect(`/menu/ingredients/${id}?deleteBlocked=1`);
  }
  await prisma.ingredient.delete({ where: { id } });
  revalidatePath("/menu/ingredients");
  redirect("/menu/ingredients");
}

function optionalStr(v: FormDataEntryValue | null): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v);
}
