import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEFAULT_VAT_RATE } from "@/lib/constants";
import { decimalToNumber } from "@/lib/money";

/**
 * מחדש סכומי הצעה מפריטים: סיכום לפני מע״מ, הנחה, מע״מ, כולל.
 * רווח צפוי: לפני מע״מ − עלות פנימית (שדה קיים בהצעה).
 */
export async function recalculateQuoteTotals(quoteId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { items: true },
  });
  if (!quote) return;

  const subtotalRaw = quote.items.reduce(
    (sum, item) => sum + decimalToNumber(item.totalPrice),
    0,
  );
  const subtotal = Math.round(subtotalRaw * 100) / 100;

  const discount = decimalToNumber(quote.discount);
  const afterDiscount = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

  const vat =
    Math.round(afterDiscount * DEFAULT_VAT_RATE * 100) / 100;
  const total = Math.round((afterDiscount + vat) * 100) / 100;

  const internal = decimalToNumber(quote.internalCost);
  const expectedProfit =
    Math.round((afterDiscount - internal) * 100) / 100;
  const profitPercent =
    afterDiscount > 0
      ? Math.round((expectedProfit / afterDiscount) * 10000) / 100
      : 0;

  const data: Prisma.QuoteUpdateInput = {
    subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
    vat: new Prisma.Decimal(vat.toFixed(2)),
    total: new Prisma.Decimal(total.toFixed(2)),
    expectedProfit: new Prisma.Decimal(expectedProfit.toFixed(2)),
    profitPercent: new Prisma.Decimal(profitPercent.toFixed(2)),
  };

  await prisma.quote.update({
    where: { id: quoteId },
    data,
  });
}
