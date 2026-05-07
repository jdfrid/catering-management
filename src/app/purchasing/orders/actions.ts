"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  Prisma,
  PurchaseOrderStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/forms";
import { errState, okState } from "@/lib/forms";
import { toDecimal, toDecimalMoney } from "@/lib/money";
import { recalculatePurchaseOrderEstimatedTotal } from "@/lib/purchase-order-totals";

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const poStatusEnum = z.nativeEnum(PurchaseOrderStatus);

const createPoSchema = z.object({
  supplierId: z.string().min(1, "בחר ספק"),
  eventId: z.string().optional(),
  requestedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function createPurchaseOrder(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createPoSchema.safeParse({
    supplierId: String(formData.get("supplierId") ?? ""),
    eventId: optionalStr(formData.get("eventId")),
    requestedDeliveryDate: optionalStr(formData.get("requestedDeliveryDate")),
    notes: optionalStr(formData.get("notes")),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const sup = await prisma.supplier.findUnique({
    where: { id: parsed.data.supplierId },
  });
  if (!sup) return errState({ supplierId: "ספק לא נמצא" });

  const eventId =
    parsed.data.eventId?.trim() === "" ? undefined : parsed.data.eventId;

  if (eventId) {
    const ev = await prisma.event.findUnique({ where: { id: eventId } });
    if (!ev) return errState({ eventId: "אירוע לא נמצא" });
  }

  const reqDate = parseOptionalDate(parsed.data.requestedDeliveryDate);

  const po = await prisma.purchaseOrder.create({
    data: {
      supplierId: parsed.data.supplierId,
      eventId: eventId ?? null,
      status: PurchaseOrderStatus.DRAFT,
      requestedDeliveryDate: reqDate,
      notes: trimOrNull(parsed.data.notes),
    } as Prisma.PurchaseOrderUncheckedCreateInput,
  });

  revalidatePath("/purchasing");
  revalidatePath("/purchasing/orders");
  redirect(`/purchasing/orders/${po.id}`);
}

const updatePoMetaSchema = z.object({
  id: z.string().min(1),
  status: poStatusEnum,
  requestedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function updatePurchaseOrderMeta(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updatePoMetaSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
    requestedDeliveryDate: optionalStr(formData.get("requestedDeliveryDate")),
    notes: optionalStr(formData.get("notes")),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const reqDate = parseOptionalDate(parsed.data.requestedDeliveryDate);

  await prisma.purchaseOrder.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      requestedDeliveryDate: reqDate,
      notes: trimOrNull(parsed.data.notes),
    },
  });

  revalidatePath("/purchasing/orders");
  revalidatePath(`/purchasing/orders/${parsed.data.id}`);
  return okState("נשמר");
}

const lineSchema = z.object({
  purchaseOrderId: z.string().min(1),
  ingredientName: z.string().min(1, "תיאור חומר חובה"),
  quantity: z.string().min(1, "כמות חובה"),
  unit: z.string().min(1, "יחידה חובה"),
  estimatedPrice: z.string().min(1, "מחיר משוער חובה"),
});

export async function addPurchaseOrderLine(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = lineSchema.safeParse({
    purchaseOrderId: String(formData.get("purchaseOrderId") ?? ""),
    ingredientName: String(formData.get("ingredientName") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    estimatedPrice: String(formData.get("estimatedPrice") ?? ""),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: parsed.data.purchaseOrderId },
  });
  if (!po) return errState({ _form: "הזמנה לא נמצאה" });
  if (po.status !== PurchaseOrderStatus.DRAFT) {
    return errState({ _form: "ניתן לערוך שורות רק בטיוטה" });
  }

  await prisma.purchaseOrderItem.create({
    data: {
      purchaseOrderId: parsed.data.purchaseOrderId,
      ingredientName: parsed.data.ingredientName.trim(),
      quantity: toDecimal(parsed.data.quantity),
      unit: parsed.data.unit.trim(),
      estimatedPrice: toDecimalMoney(parsed.data.estimatedPrice),
    },
  });

  await recalculatePurchaseOrderEstimatedTotal(parsed.data.purchaseOrderId);

  revalidatePath(`/purchasing/orders/${parsed.data.purchaseOrderId}`);
  revalidatePath("/purchasing/orders");
  return okState("שורה נוספה");
}

export async function removePurchaseOrderLine(
  formData: FormData,
): Promise<ActionState> {
  const itemId = String(formData.get("itemId") ?? "");
  const purchaseOrderId = String(formData.get("purchaseOrderId") ?? "");
  if (!itemId || !purchaseOrderId) {
    return errState({ _form: "חסר מזהה" });
  }

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
  });
  if (!po) return errState({ _form: "הזמנה לא נמצאה" });
  if (po.status !== PurchaseOrderStatus.DRAFT) {
    return errState({ _form: "ניתן לערוך שורות רק בטיוטה" });
  }

  await prisma.purchaseOrderItem.deleteMany({
    where: { id: itemId, purchaseOrderId },
  });

  await recalculatePurchaseOrderEstimatedTotal(purchaseOrderId);

  revalidatePath(`/purchasing/orders/${purchaseOrderId}`);
  revalidatePath("/purchasing/orders");
  return okState("הוסר");
}

export async function deletePurchaseOrderDraft(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const po = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!po || po.status !== PurchaseOrderStatus.DRAFT) {
    redirect(`/purchasing/orders/${id}?deleteBlocked=1`);
  }
  await prisma.purchaseOrder.delete({ where: { id } });
  revalidatePath("/purchasing/orders");
  redirect("/purchasing/orders");
}

function optionalStr(v: FormDataEntryValue | null): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v);
}

function trimOrNull(s: string | undefined): string | null {
  const t = s?.trim() ?? "";
  return t === "" ? null : t;
}

function parseOptionalDate(
  s: string | undefined,
): Date | null | undefined {
  if (s === undefined) return undefined;
  const t = s.trim();
  if (t === "") return null;
  const d = new Date(`${t}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}
