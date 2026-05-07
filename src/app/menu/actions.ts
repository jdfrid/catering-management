"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/forms";
import { errState, okState } from "@/lib/forms";
import { MENU_CATEGORIES, SALE_UNITS } from "@/lib/constants";
import { toDecimal, toDecimalMoney } from "@/lib/money";

const categories = [...MENU_CATEGORIES] as [string, ...string[]];
const units = [...SALE_UNITS] as [string, ...string[]];

const menuSchema = z.object({
  name: z.string().min(1, "שם מנה חובה"),
  category: z.enum(categories),
  saleUnit: z.enum(units),
  baseRecipeQuantity: z.coerce.number().positive("כמות בסיס חיובית"),
  suggestedPrice: z.string().optional(),
  prepMinutes: z.string().optional(),
  cookMinutes: z.string().optional(),
  complexity: z.string().optional(),
  instructions: z.string().optional(),
});

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function optionalInt(s: string | undefined): number | null {
  if (!s?.trim()) return null;
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

export async function createMenuItem(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = menuSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? ""),
    saleUnit: String(formData.get("saleUnit") ?? ""),
    baseRecipeQuantity: formData.get("baseRecipeQuantity"),
    suggestedPrice:
      formData.get("suggestedPrice") === null
        ? undefined
        : String(formData.get("suggestedPrice") ?? ""),
    prepMinutes:
      formData.get("prepMinutes") === null
        ? undefined
        : String(formData.get("prepMinutes") ?? ""),
    cookMinutes:
      formData.get("cookMinutes") === null
        ? undefined
        : String(formData.get("cookMinutes") ?? ""),
    complexity:
      formData.get("complexity") === null
        ? undefined
        : String(formData.get("complexity") ?? ""),
    instructions:
      formData.get("instructions") === null
        ? undefined
        : String(formData.get("instructions") ?? ""),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const suggestedRaw = parsed.data.suggestedPrice?.trim();
  const suggestedPrice =
    suggestedRaw && suggestedRaw !== ""
      ? toDecimalMoney(suggestedRaw)
      : null;

  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.menuItem.create({
      data: {
        name: parsed.data.name.trim(),
        category: parsed.data.category,
        saleUnit: parsed.data.saleUnit,
        baseRecipeQuantity: toDecimal(String(parsed.data.baseRecipeQuantity)),
        suggestedPrice,
        prepMinutes: optionalInt(parsed.data.prepMinutes),
        cookMinutes: optionalInt(parsed.data.cookMinutes),
        complexity: parsed.data.complexity?.trim() || null,
        instructions: parsed.data.instructions?.trim() || null,
        active: true,
      },
    });
    await tx.recipe.create({
      data: {
        menuItemId: created.id,
        version: 1,
        active: true,
        baseQuantity: toDecimal(String(parsed.data.baseRecipeQuantity)),
      },
    });
    return created;
  });

  revalidatePath("/menu");
  redirect(`/menu/${item.id}`);
}

export async function updateMenuItem(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return errState({ _form: "חסר מזהה מנה" });
  }
  const parsed = menuSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? ""),
    saleUnit: String(formData.get("saleUnit") ?? ""),
    baseRecipeQuantity: formData.get("baseRecipeQuantity"),
    suggestedPrice:
      formData.get("suggestedPrice") === null
        ? undefined
        : String(formData.get("suggestedPrice") ?? ""),
    prepMinutes:
      formData.get("prepMinutes") === null
        ? undefined
        : String(formData.get("prepMinutes") ?? ""),
    cookMinutes:
      formData.get("cookMinutes") === null
        ? undefined
        : String(formData.get("cookMinutes") ?? ""),
    complexity:
      formData.get("complexity") === null
        ? undefined
        : String(formData.get("complexity") ?? ""),
    instructions:
      formData.get("instructions") === null
        ? undefined
        : String(formData.get("instructions") ?? ""),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const suggestedRaw = parsed.data.suggestedPrice?.trim();
  const suggestedPrice =
    suggestedRaw && suggestedRaw !== ""
      ? toDecimalMoney(suggestedRaw)
      : null;

  const active = formData.get("active") === "on" || formData.get("active") === "true";

  await prisma.menuItem.update({
    where: { id },
    data: {
      name: parsed.data.name.trim(),
      category: parsed.data.category,
      saleUnit: parsed.data.saleUnit,
      baseRecipeQuantity: toDecimal(String(parsed.data.baseRecipeQuantity)),
      suggestedPrice,
      prepMinutes: optionalInt(parsed.data.prepMinutes),
      cookMinutes: optionalInt(parsed.data.cookMinutes),
      complexity: parsed.data.complexity?.trim() || null,
      instructions: parsed.data.instructions?.trim() || null,
      active,
    },
  });
  await prisma.recipe.updateMany({
    where: { menuItemId: id, active: true },
    data: {
      baseQuantity: toDecimal(String(parsed.data.baseRecipeQuantity)),
    },
  });
  revalidatePath("/menu");
  revalidatePath(`/menu/${id}`);
  return okState("המנה עודכנה");
}

export async function deleteMenuItem(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const used = await prisma.quoteItem.count({ where: { menuItemId: id } });
  if (used > 0) {
    redirect(`/menu/${id}?deleteBlocked=1`);
  }
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/menu");
  redirect("/menu");
}
