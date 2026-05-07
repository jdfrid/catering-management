"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/forms";
import { errState, okState } from "@/lib/forms";
import { CUSTOMER_TYPES } from "@/lib/constants";

const customerSchema = z
  .object({
    name: z.string().min(1, "שם חובה"),
    type: z.enum(CUSTOMER_TYPES),
    phone: z.string().min(1, "טלפון חובה"),
    email: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (d) => {
      const e = d.email?.trim() ?? "";
      if (!e) return true;
      return z.string().email().safeParse(e).success;
    },
    { message: "אימייל לא תקין", path: ["email"] },
  );

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createCustomer(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: formData.get("name"),
    type: formData.get("type"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    taxId: formData.get("taxId"),
    notes: formData.get("notes"),
  };
  const parsed = customerSchema.safeParse({
    name: String(raw.name ?? ""),
    type: String(raw.type ?? ""),
    phone: String(raw.phone ?? ""),
    email: raw.email === null || raw.email === undefined ? undefined : String(raw.email),
    address:
      raw.address === null || raw.address === undefined
        ? undefined
        : String(raw.address),
    taxId:
      raw.taxId === null || raw.taxId === undefined
        ? undefined
        : String(raw.taxId),
    notes:
      raw.notes === null || raw.notes === undefined
        ? undefined
        : String(raw.notes),
  });
  if (!parsed.success) {
    return errState(flattenZod(parsed.error));
  }
  await prisma.customer.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      phone: parsed.data.phone,
      email: parsed.data.email?.trim() || null,
      address: parsed.data.address ?? null,
      taxId: parsed.data.taxId ?? null,
      notes: parsed.data.notes ?? null,
    },
  });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return errState({ _form: "חסר מזהה לקוח" });
  }
  const raw = {
    name: formData.get("name"),
    type: formData.get("type"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    taxId: formData.get("taxId"),
    notes: formData.get("notes"),
    active: formData.get("active"),
  };
  const parsed = customerSchema.safeParse({
    name: String(raw.name ?? ""),
    type: String(raw.type ?? ""),
    phone: String(raw.phone ?? ""),
    email: raw.email === null || raw.email === undefined ? undefined : String(raw.email),
    address:
      raw.address === null || raw.address === undefined
        ? undefined
        : String(raw.address),
    taxId:
      raw.taxId === null || raw.taxId === undefined
        ? undefined
        : String(raw.taxId),
    notes:
      raw.notes === null || raw.notes === undefined
        ? undefined
        : String(raw.notes),
  });
  if (!parsed.success) {
    return errState(flattenZod(parsed.error));
  }
  const active = raw.active === "on" || raw.active === "true";
  await prisma.customer.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      phone: parsed.data.phone,
      email: parsed.data.email?.trim() || null,
      address: parsed.data.address ?? null,
      taxId: parsed.data.taxId ?? null,
      notes: parsed.data.notes ?? null,
      active,
    },
  });
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return okState("הפרטים נשמרו בהצלחה");
}

export async function deleteCustomer(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const count = await prisma.event.count({ where: { customerId: id } });
  if (count > 0) {
    redirect(`/customers/${id}?deleteBlocked=1`);
  }
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
  redirect("/customers");
}
