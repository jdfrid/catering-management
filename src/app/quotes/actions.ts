"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma, QuoteStatus, EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/forms";
import { errState, okState } from "@/lib/forms";
import { recalculateQuoteTotals } from "@/lib/quote-totals";
import { decimalToNumber, toDecimal, toDecimalMoney } from "@/lib/money";
import {
  costPerSaleUnit,
  estimateMenuItemRecipeCost,
} from "@/lib/recipe-cost";

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const createQuoteSchema = z.object({
  eventId: z.string().min(1, "בחר אירוע"),
});

export async function createQuote(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createQuoteSchema.safeParse({
    eventId: String(formData.get("eventId") ?? ""),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const event = await prisma.event.findUnique({
    where: { id: parsed.data.eventId },
  });
  if (!event) return errState({ eventId: "אירוע לא נמצא" });

  const quote = await prisma.$transaction(async (tx) => {
    // DB: quoteNumber SERIAL — Prisma 7 client types incorrectly require it on create.
    const q = await tx.quote.create({
      data: {
        customerId: event.customerId,
        eventId: event.id,
        status: QuoteStatus.DRAFT,
      } as Prisma.QuoteUncheckedCreateInput,
    });

    if (
      event.status === EventStatus.NEW ||
      event.status === EventStatus.QUOTING
    ) {
      await tx.event.update({
        where: { id: event.id },
        data: { status: EventStatus.QUOTING },
      });
    }
    return q;
  });

  revalidatePath("/quotes");
  revalidatePath(`/events/${event.id}`);
  redirect(`/quotes/${quote.id}`);
}

const quoteMetaSchema = z.object({
  id: z.string().min(1),
  discount: z.coerce.number().nonnegative(),
  internalCost: z.coerce.number().nonnegative(),
  paymentTerms: z.string().optional(),
  customerNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  validUntil: z.string().optional(),
  status: z.nativeEnum(QuoteStatus),
});

export async function updateQuoteMeta(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = quoteMetaSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    discount: formData.get("discount"),
    internalCost: formData.get("internalCost"),
    paymentTerms:
      formData.get("paymentTerms") === null
        ? undefined
        : String(formData.get("paymentTerms") ?? ""),
    customerNotes:
      formData.get("customerNotes") === null
        ? undefined
        : String(formData.get("customerNotes") ?? ""),
    internalNotes:
      formData.get("internalNotes") === null
        ? undefined
        : String(formData.get("internalNotes") ?? ""),
    validUntil:
      formData.get("validUntil") === null
        ? undefined
        : String(formData.get("validUntil") ?? ""),
    status: formData.get("status") as QuoteStatus,
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const validUntil =
    parsed.data.validUntil?.trim() && parsed.data.validUntil.length >= 8
      ? new Date(`${parsed.data.validUntil.trim()}T23:59:59`)
      : null;

  const quote = await prisma.quote.findUnique({
    where: { id: parsed.data.id },
    select: { eventId: true, status: true },
  });
  if (!quote) return errState({ _form: "הצעה לא נמצאה" });

  if (quote.status === QuoteStatus.APPROVED) {
    return errState({ _form: "הצעה מאושרת ננעלת — צור גרסה חדשה (בהמשך)" });
  }

  await prisma.$transaction(async (tx) => {
    await tx.quote.update({
      where: { id: parsed.data.id },
      data: {
        discount: toDecimalMoney(String(parsed.data.discount)),
        internalCost: toDecimalMoney(String(parsed.data.internalCost)),
        paymentTerms: parsed.data.paymentTerms?.trim() || null,
        customerNotes: parsed.data.customerNotes?.trim() || null,
        internalNotes: parsed.data.internalNotes?.trim() || null,
        validUntil,
        status: parsed.data.status,
      },
    });

    if (parsed.data.status === QuoteStatus.APPROVED) {
      await tx.event.update({
        where: { id: quote.eventId },
        data: { status: EventStatus.APPROVED },
      });
    } else if (
      parsed.data.status === QuoteStatus.SENT ||
      parsed.data.status === QuoteStatus.NEGOTIATION
    ) {
      await tx.event.update({
        where: { id: quote.eventId },
        data: { status: EventStatus.WAITING_FOR_CUSTOMER },
      });
    }
  });

  await recalculateQuoteTotals(parsed.data.id);
  revalidatePath(`/quotes/${parsed.data.id}`);
  revalidatePath("/quotes");
  revalidatePath(`/events/${quote.eventId}`);
  return okState("פרטי ההצעה נשמרו");
}

const lineSchema = z.object({
  quoteId: z.string().min(1),
  menuItemId: z.string().min(1),
  quantity: z.coerce.number().positive("כמות חייבת להיות חיובית"),
  unitPrice: z.coerce.number().nonnegative("מחיר ליחידה לא שלילי"),
});

export async function addQuoteLine(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = lineSchema.safeParse({
    quoteId: String(formData.get("quoteId") ?? ""),
    menuItemId: String(formData.get("menuItemId") ?? ""),
    quantity: formData.get("quantity"),
    unitPrice: formData.get("unitPrice"),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const quote = await prisma.quote.findUnique({
    where: { id: parsed.data.quoteId },
  });
  if (!quote) return errState({ _form: "הצעה לא נמצאה" });
  if (quote.status === QuoteStatus.APPROVED) {
    return errState({ _form: "לא ניתן לערוך הצעה מאושרת" });
  }

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: parsed.data.menuItemId },
  });
  if (!menuItem) return errState({ menuItemId: "מנה לא נמצאה" });

  const estimate = await estimateMenuItemRecipeCost(menuItem.id);
  if (!estimate) {
    return errState({ _form: "לא ניתן לחשב עלות למנה" });
  }

  const recipeMeta = await prisma.recipe.findFirst({
    where: { menuItemId: menuItem.id, active: true },
    orderBy: { version: "desc" },
    select: { version: true, id: true },
  });

  const qty = toDecimal(String(parsed.data.quantity));
  const unit = toDecimalMoney(String(parsed.data.unitPrice));
  const totalN = decimalToNumber(qty) * decimalToNumber(unit);
  const totalPrice = new Prisma.Decimal(totalN.toFixed(2));

  const unitCost = costPerSaleUnit(estimate.total, menuItem.baseRecipeQuantity);
  const pricingComplete = estimate.missing.length === 0;
  const lineCostEstimate =
    unitCost != null && pricingComplete
      ? new Prisma.Decimal((unitCost * parsed.data.quantity).toFixed(2))
      : null;

  await prisma.quoteItem.create({
    data: {
      quoteId: parsed.data.quoteId,
      menuItemId: parsed.data.menuItemId,
      quantity: qty,
      unitPrice: unit,
      totalPrice,
      costSnapshot: {
        source: "recipe_supplier_prices",
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        baseRecipeQuantity: menuItem.baseRecipeQuantity.toString(),
        saleUnit: menuItem.saleUnit,
        recipeVersion: recipeMeta?.version ?? null,
        recipeTotalForBase: estimate.total.toString(),
        unitCostEstimate: unitCost,
        lineQuantity: parsed.data.quantity,
        lineCostEstimate: lineCostEstimate
          ? lineCostEstimate.toString()
          : null,
        missingPrices: estimate.missing,
        computedAt: new Date().toISOString(),
      },
      recipeSnapshot: {
        version: recipeMeta?.version ?? 0,
        recipeId: recipeMeta?.id ?? null,
        lines: estimate.lines.map((ln) => ({
          ingredientId: ln.ingredientId,
          ingredientName: ln.ingredientName,
          qtyWithWaste: ln.qtyWithWaste,
          unit: ln.unit,
          unitPrice: ln.unitPrice,
          lineCost: ln.lineCost,
          supplierId: ln.supplierId,
          supplierName: ln.supplierName,
          source: ln.source,
        })),
      },
    },
  });

  await recalculateQuoteTotals(parsed.data.quoteId);
  revalidatePath(`/quotes/${parsed.data.quoteId}`);
  revalidatePath("/quotes");
  return okState("השורה נוספה");
}

export async function removeQuoteLine(formData: FormData) {
  const itemId = formData.get("itemId");
  const quoteId = formData.get("quoteId");
  if (typeof itemId !== "string" || typeof quoteId !== "string") return;

  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!quote || quote.status === QuoteStatus.APPROVED) {
    redirect(`/quotes/${quoteId}?locked=1`);
  }

  await prisma.quoteItem.delete({ where: { id: itemId } });
  await recalculateQuoteTotals(quoteId);
  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath("/quotes");
  redirect(`/quotes/${quoteId}`);
}

export async function deleteQuoteDraft(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const q = await prisma.quote.findUnique({ where: { id } });
  if (!q || q.status !== QuoteStatus.DRAFT) {
    redirect(`/quotes/${id}?deleteBlocked=1`);
  }
  const eventId = q.eventId;
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/quotes");
  revalidatePath(`/events/${eventId}`);
  redirect("/quotes");
}
