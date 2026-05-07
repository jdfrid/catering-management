"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/forms";
import { errState, okState } from "@/lib/forms";
import { SALE_UNITS } from "@/lib/constants";
import { toDecimal } from "@/lib/money";

const units = [...SALE_UNITS] as [string, ...string[]];

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const addLineSchema = z.object({
  recipeId: z.string().min(1),
  menuItemId: z.string().min(1),
  ingredientId: z.string().min(1, "בחר חומר גלם"),
  quantity: z.string().min(1, "כמות חובה"),
  unit: z.enum(units),
  wastePercent: z.string().optional(),
  notes: z.string().optional(),
});

export async function addRecipeComponent(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = addLineSchema.safeParse({
    recipeId: String(formData.get("recipeId") ?? ""),
    menuItemId: String(formData.get("menuItemId") ?? ""),
    ingredientId: String(formData.get("ingredientId") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    wastePercent: optionalStr(formData.get("wastePercent")),
    notes: optionalStr(formData.get("notes")),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const recipe = await prisma.recipe.findUnique({
    where: { id: parsed.data.recipeId },
  });
  if (!recipe || recipe.menuItemId !== parsed.data.menuItemId) {
    return errState({ _form: "מתכון לא תואם למנה" });
  }

  const ing = await prisma.ingredient.findUnique({
    where: { id: parsed.data.ingredientId },
  });
  if (!ing || !ing.active) {
    return errState({ ingredientId: "חומר גלם לא נמצא או לא פעיל" });
  }

  let waste = new Prisma.Decimal(0);
  if (parsed.data.wastePercent?.trim()) {
    const w = Number.parseFloat(parsed.data.wastePercent.replace(",", "."));
    if (Number.isNaN(w) || w < 0 || w > 100) {
      return errState({ wastePercent: "אחוז פחת 0–100" });
    }
    waste = new Prisma.Decimal(w.toFixed(2));
  }

  await prisma.recipeComponent.create({
    data: {
      recipeId: parsed.data.recipeId,
      ingredientId: parsed.data.ingredientId,
      quantity: toDecimal(parsed.data.quantity),
      unit: parsed.data.unit,
      wastePercent: waste,
      notes: trimOrNull(parsed.data.notes),
    },
  });

  revalidatePath(`/menu/${parsed.data.menuItemId}`);
  return okState("רכיב נוסף");
}

export async function removeRecipeComponent(formData: FormData): Promise<void> {
  const componentId = String(formData.get("componentId") ?? "");
  const menuItemId = String(formData.get("menuItemId") ?? "");
  if (!componentId || !menuItemId) return;

  const comp = await prisma.recipeComponent.findUnique({
    where: { id: componentId },
    include: { recipe: true },
  });
  if (!comp || comp.recipe.menuItemId !== menuItemId) return;

  await prisma.recipeComponent.delete({ where: { id: componentId } });
  revalidatePath(`/menu/${menuItemId}`);
}

function optionalStr(v: FormDataEntryValue | null): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v);
}

function trimOrNull(s: string | undefined): string | null {
  const t = s?.trim() ?? "";
  return t === "" ? null : t;
}
