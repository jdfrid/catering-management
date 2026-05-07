"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/forms";
import { errState, okState } from "@/lib/forms";
import { SALE_UNITS } from "@/lib/constants";
import { toDecimalMoney } from "@/lib/money";

const units = [...SALE_UNITS] as [string, ...string[]];

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function parseOptionalDate(s: string | undefined): Date | null | undefined {
  if (s === undefined) return undefined;
  const t = s.trim();
  if (t === "") return null;
  const d = new Date(`${t}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const priceSchema = z.object({
  supplierId: z.string().min(1, "בחר ספק"),
  ingredientId: z.string().min(1, "בחר חומר גלם"),
  price: z.string().min(1, "מחיר חובה"),
  priceUnit: z.enum(units),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  notes: z.string().optional(),
});

export async function upsertSupplierPrice(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = priceSchema.safeParse({
    supplierId: String(formData.get("supplierId") ?? ""),
    ingredientId: String(formData.get("ingredientId") ?? ""),
    price: String(formData.get("price") ?? ""),
    priceUnit: String(formData.get("priceUnit") ?? ""),
    validFrom: optionalStr(formData.get("validFrom")),
    validTo: optionalStr(formData.get("validTo")),
    notes: optionalStr(formData.get("notes")),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const sup = await prisma.supplier.findUnique({
    where: { id: parsed.data.supplierId },
  });
  if (!sup?.active) return errState({ supplierId: "ספק לא נמצא או לא פעיל" });

  const ing = await prisma.ingredient.findUnique({
    where: { id: parsed.data.ingredientId },
  });
  if (!ing?.active)
    return errState({ ingredientId: "חומר גלם לא נמצא או לא פעיל" });

  const validFrom = parseOptionalDate(parsed.data.validFrom);
  const validTo = parseOptionalDate(parsed.data.validTo);
  if (validFrom && validTo && validFrom > validTo) {
    return errState({ validTo: "תאריך סיום לפני תחילה" });
  }

  await prisma.supplierPrice.upsert({
    where: {
      supplierId_ingredientId_priceUnit: {
        supplierId: parsed.data.supplierId,
        ingredientId: parsed.data.ingredientId,
        priceUnit: parsed.data.priceUnit,
      },
    },
    create: {
      supplierId: parsed.data.supplierId,
      ingredientId: parsed.data.ingredientId,
      price: toDecimalMoney(parsed.data.price),
      priceUnit: parsed.data.priceUnit,
      validFrom: validFrom ?? null,
      validTo: validTo ?? null,
      notes: trimOrNull(parsed.data.notes),
    },
    update: {
      price: toDecimalMoney(parsed.data.price),
      validFrom: validFrom ?? null,
      validTo: validTo ?? null,
      notes: trimOrNull(parsed.data.notes),
    },
  });

  revalidatePath("/purchasing/prices");
  revalidatePath("/menu");
  revalidatePath("/menu/ingredients");
  revalidatePath(`/purchasing/suppliers/${parsed.data.supplierId}`);
  revalidatePath(`/menu/ingredients/${parsed.data.ingredientId}`);
  await globMenuItemsWithIngredient(parsed.data.ingredientId);
  return okState("נשמר");
}

async function globMenuItemsWithIngredient(ingredientId: string) {
  const comps = await prisma.recipeComponent.findMany({
    where: { ingredientId },
    select: { recipe: { select: { menuItemId: true } } },
  });
  const ids = [...new Set(comps.map((c) => c.recipe.menuItemId))];
  for (const id of ids) {
    revalidatePath(`/menu/${id}`);
  }
}

const updateSchema = priceSchema.extend({
  id: z.string().min(1),
});

export async function updateSupplierPrice(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updateSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    supplierId: String(formData.get("supplierId") ?? ""),
    ingredientId: String(formData.get("ingredientId") ?? ""),
    price: String(formData.get("price") ?? ""),
    priceUnit: String(formData.get("priceUnit") ?? ""),
    validFrom: optionalStr(formData.get("validFrom")),
    validTo: optionalStr(formData.get("validTo")),
    notes: optionalStr(formData.get("notes")),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const existing = await prisma.supplierPrice.findUnique({
    where: { id: parsed.data.id },
  });
  if (!existing) return errState({ _form: "רשומה לא נמצאה" });

  const keyChanged =
    existing.supplierId !== parsed.data.supplierId ||
    existing.ingredientId !== parsed.data.ingredientId ||
    existing.priceUnit !== parsed.data.priceUnit;

  if (keyChanged) {
    const clash = await prisma.supplierPrice.findUnique({
      where: {
        supplierId_ingredientId_priceUnit: {
          supplierId: parsed.data.supplierId,
          ingredientId: parsed.data.ingredientId,
          priceUnit: parsed.data.priceUnit,
        },
      },
    });
    if (clash && clash.id !== parsed.data.id) {
      return errState({
        _form:
          "כבר קיים מחיר לאותו ספק·חומר·יחידה — מחקו או ערכו את הרשומה הקיימת",
      });
    }
  }

  const sup = await prisma.supplier.findUnique({
    where: { id: parsed.data.supplierId },
  });
  if (!sup?.active) return errState({ supplierId: "ספק לא נמצא או לא פעיל" });

  const ing = await prisma.ingredient.findUnique({
    where: { id: parsed.data.ingredientId },
  });
  if (!ing?.active)
    return errState({ ingredientId: "חומר גלם לא נמצא או לא פעיל" });

  const validFrom = parseOptionalDate(parsed.data.validFrom);
  const validTo = parseOptionalDate(parsed.data.validTo);
  if (validFrom && validTo && validFrom > validTo) {
    return errState({ validTo: "תאריך סיום לפני תחילה" });
  }

  if (keyChanged) {
    await prisma.supplierPrice.delete({ where: { id: parsed.data.id } });
    await prisma.supplierPrice.create({
      data: {
        supplierId: parsed.data.supplierId,
        ingredientId: parsed.data.ingredientId,
        price: toDecimalMoney(parsed.data.price),
        priceUnit: parsed.data.priceUnit,
        validFrom: validFrom ?? null,
        validTo: validTo ?? null,
        notes: trimOrNull(parsed.data.notes),
      },
    });
  } else {
    await prisma.supplierPrice.update({
      where: { id: parsed.data.id },
      data: {
        price: toDecimalMoney(parsed.data.price),
        validFrom: validFrom ?? null,
        validTo: validTo ?? null,
        notes: trimOrNull(parsed.data.notes),
      },
    });
  }

  revalidatePath("/purchasing/prices");
  revalidatePath(`/purchasing/prices/${parsed.data.id}`);
  revalidatePath(`/purchasing/suppliers/${parsed.data.supplierId}`);
  revalidatePath(`/menu/ingredients/${parsed.data.ingredientId}`);
  await globMenuItemsWithIngredient(parsed.data.ingredientId);
  return okState("נשמר");
}

export async function deleteSupplierPrice(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const row = await prisma.supplierPrice.findUnique({ where: { id } });
  if (!row) return;
  const ingId = row.ingredientId;
  const supId = row.supplierId;
  await prisma.supplierPrice.delete({ where: { id } });
  revalidatePath("/purchasing/prices");
  revalidatePath(`/purchasing/suppliers/${supId}`);
  revalidatePath(`/menu/ingredients/${ingId}`);
  await globMenuItemsWithIngredient(ingId);
  redirect("/purchasing/prices");
}

function optionalStr(v: FormDataEntryValue | null): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v);
}

function trimOrNull(s: string | undefined): string | null {
  const t = s?.trim() ?? "";
  return t === "" ? null : t;
}
