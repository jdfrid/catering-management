import { QuoteStatus, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { KITCHEN_DEPARTMENTS } from "@/lib/constants";
import { decimalToNumber } from "@/lib/money";

/** מזהה משימות שנוצרו אוטומטית מההזמנה — נמחקות לפני יצירה מחדש באישור מחודש (גרסה עתידית). */
export const KITCHEN_AUTO_ORDER_NOTES_PREFIX = "[אוטו-הזמנה]";

function workDateAtNoon(eventDate: Date): Date {
  const d = new Date(eventDate);
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    12,
    0,
    0,
    0,
  );
}

/**
 * לאחר אישור הצעה: מוחק משימות מטבח אוטומטיות קודמות לאותו אירוע ויוצר משימה
 * לכל מנה (מאוגד לפי menuItemId עם סכימת כמויות).
 */
export async function syncKitchenTasksForApprovedQuote(
  quoteId: string,
): Promise<void> {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      event: true,
      items: { include: { menuItem: true } },
    },
  });

  if (!quote || quote.status !== QuoteStatus.APPROVED) return;

  type Agg = {
    menuItem: (typeof quote.items)[0]["menuItem"];
    quantity: number;
  };
  const byMenu = new Map<string, Agg>();

  for (const line of quote.items) {
    const id = line.menuItemId;
    const q = decimalToNumber(line.quantity);
    const prev = byMenu.get(id);
    if (prev) prev.quantity += q;
    else
      byMenu.set(id, {
        menuItem: line.menuItem,
        quantity: q,
      });
  }

  await prisma.$transaction(async (tx) => {
    await tx.kitchenTask.deleteMany({
      where: {
        eventId: quote.eventId,
        notes: { startsWith: KITCHEN_AUTO_ORDER_NOTES_PREFIX },
      },
    });

    const workDate = workDateAtNoon(quote.event.date);

    for (const { menuItem: mi, quantity: qty } of byMenu.values()) {
      if (!mi.active) continue;
      const durationRaw = (mi.prepMinutes ?? 0) + (mi.cookMinutes ?? 0);
      const durationMinutes = durationRaw > 0 ? durationRaw : null;

      await tx.kitchenTask.create({
        data: {
          eventId: quote.eventId,
          menuItemId: mi.id,
          name: `הכנת ${mi.name}`,
          department: KITCHEN_DEPARTMENTS[0],
          workDate,
          durationMinutes,
          status: TaskStatus.OPEN,
          notes: `${KITCHEN_AUTO_ORDER_NOTES_PREFIX} הצעה #${quote.quoteNumber} · כמות: ${qty} ${mi.saleUnit}`,
        },
      });
    }
  });
}
