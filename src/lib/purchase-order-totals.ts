import { prisma } from "@/lib/prisma";

/** סכום הערכת עלות לפי שורות הזמנה */
export async function recalculatePurchaseOrderEstimatedTotal(
  purchaseOrderId: string,
) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
    include: { items: true },
  });
  if (!po) return;
  const sum = po.items.reduce(
    (acc, row) => acc + row.estimatedPrice.toNumber(),
    0,
  );
  await prisma.purchaseOrder.update({
    where: { id: purchaseOrderId },
    data: { estimatedTotal: sum },
  });
}
