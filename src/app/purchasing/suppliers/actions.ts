"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/forms";
import { errState, okState } from "@/lib/forms";
import { SUPPLIER_CATEGORIES } from "@/lib/constants";
import { toDecimalMoney } from "@/lib/money";

const categoryEnum = z.enum(SUPPLIER_CATEGORIES);

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const supplierSchema = z.object({
  name: z.string().min(1, "שם חובה"),
  category: categoryEnum,
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  deliveryDays: z.string().optional(),
  minOrderAmount: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

export async function createSupplier(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = supplierSchema.omit({ active: true }).safeParse({
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? ""),
    contactName: optionalStr(formData.get("contactName")),
    phone: optionalStr(formData.get("phone")),
    email: optionalStr(formData.get("email")),
    deliveryDays: optionalStr(formData.get("deliveryDays")),
    minOrderAmount: optionalStr(formData.get("minOrderAmount")),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const e = parsed.data.email?.trim() ?? "";
  if (e && !z.string().email().safeParse(e).success) {
    return errState({ email: "אימייל לא תקין" });
  }

  await prisma.supplier.create({
    data: {
      name: parsed.data.name.trim(),
      category: parsed.data.category,
      contactName: trimOrNull(parsed.data.contactName),
      phone: trimOrNull(parsed.data.phone),
      email: e ? e : null,
      deliveryDays: trimOrNull(parsed.data.deliveryDays),
      minOrderAmount:
        parsed.data.minOrderAmount?.trim() === ""
          ? null
          : toDecimalMoney(parsed.data.minOrderAmount),
    },
  });

  revalidatePath("/purchasing");
  revalidatePath("/purchasing/suppliers");
  redirect("/purchasing/suppliers");
}

export async function updateSupplier(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = supplierSchema
    .extend({ id: z.string().min(1) })
    .safeParse({
      id: String(formData.get("id") ?? ""),
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? ""),
      contactName: optionalStr(formData.get("contactName")),
      phone: optionalStr(formData.get("phone")),
      email: optionalStr(formData.get("email")),
      deliveryDays: optionalStr(formData.get("deliveryDays")),
      minOrderAmount: optionalStr(formData.get("minOrderAmount")),
      active: formData.get("active") === "on",
    });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const e = parsed.data.email?.trim() ?? "";
  if (e && !z.string().email().safeParse(e).success) {
    return errState({ email: "אימייל לא תקין" });
  }

  await prisma.supplier.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name.trim(),
      category: parsed.data.category,
      contactName: trimOrNull(parsed.data.contactName),
      phone: trimOrNull(parsed.data.phone),
      email: e ? e : null,
      deliveryDays: trimOrNull(parsed.data.deliveryDays),
      minOrderAmount:
        parsed.data.minOrderAmount?.trim() === ""
          ? null
          : toDecimalMoney(parsed.data.minOrderAmount),
      active: parsed.data.active ?? true,
    },
  });

  revalidatePath("/purchasing");
  revalidatePath("/purchasing/suppliers");
  revalidatePath(`/purchasing/suppliers/${parsed.data.id}`);
  return okState("נשמר");
}

export async function deleteSupplier(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const count = await prisma.purchaseOrder.count({ where: { supplierId: id } });
  if (count > 0) {
    redirect(`/purchasing/suppliers/${id}?deleteBlocked=1`);
  }
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/purchasing/suppliers");
  redirect("/purchasing/suppliers");
}

function optionalStr(v: FormDataEntryValue | null): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v);
}

function trimOrNull(s: string | undefined): string | null {
  const t = s?.trim() ?? "";
  return t === "" ? null : t;
}
