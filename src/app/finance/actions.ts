"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/forms";
import { errState } from "@/lib/forms";
import { PAYMENT_METHODS } from "@/lib/constants";
import { toDecimalMoney } from "@/lib/money";

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function optionalStr(v: FormDataEntryValue | null): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v);
}

function trimOrNull(s: string | undefined): string | null {
  const t = s?.trim() ?? "";
  return t === "" ? null : t;
}

const paymentSchema = z.object({
  customerId: z.string().min(1, "בחר לקוח"),
  eventId: z.string().optional(),
  amount: z.string().min(1, "סכום חובה"),
  method: z.string().optional(),
  paidAtDate: z.string().min(1, "תאריך חובה"),
  paidAtTime: z.string().optional(),
  notes: z.string().optional(),
});

export async function createPayment(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = paymentSchema.safeParse({
    customerId: String(formData.get("customerId") ?? ""),
    eventId: optionalStr(formData.get("eventId")),
    amount: String(formData.get("amount") ?? ""),
    method: optionalStr(formData.get("method")),
    paidAtDate: String(formData.get("paidAtDate") ?? ""),
    paidAtTime: optionalStr(formData.get("paidAtTime")),
    notes: optionalStr(formData.get("notes")),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const cust = await prisma.customer.findUnique({
    where: { id: parsed.data.customerId },
  });
  if (!cust) return errState({ customerId: "לקוח לא נמצא" });

  const eventId =
    parsed.data.eventId?.trim() === "" ? null : parsed.data.eventId ?? null;
  if (eventId) {
    const ev = await prisma.event.findUnique({ where: { id: eventId } });
    if (!ev) return errState({ eventId: "אירוע לא נמצא" });
    if (ev.customerId !== parsed.data.customerId) {
      return errState({ eventId: "האירוע אינו שייך ללקוח שנבחר" });
    }
  }

  const timePart = parsed.data.paidAtTime?.trim() || "12:00";
  const paidAt = new Date(`${parsed.data.paidAtDate}T${timePart}:00`);
  if (Number.isNaN(paidAt.getTime())) {
    return errState({ paidAtDate: "תאריך/שעה לא תקינים" });
  }

  const methodRaw = parsed.data.method?.trim() ?? "";
  let method: string | null = null;
  if (methodRaw !== "") {
    if (
      !(PAYMENT_METHODS as readonly string[]).includes(methodRaw)
    ) {
      return errState({ method: "בחר אמצעי תשלום" });
    }
    method = methodRaw;
  }

  await prisma.payment.create({
    data: {
      customerId: parsed.data.customerId,
      eventId,
      amount: toDecimalMoney(parsed.data.amount),
      method,
      paidAt,
      notes: trimOrNull(parsed.data.notes),
    },
  });

  revalidatePath("/finance");
  redirect("/finance");
}
