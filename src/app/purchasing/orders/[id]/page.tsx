import Link from "next/link";
import { notFound } from "next/navigation";
import { PurchaseOrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PurchaseOrderMetaForm } from "@/components/PurchaseOrderMetaForm";
import { AddPurchaseOrderLineForm } from "@/components/AddPurchaseOrderLineForm";
import { RemovePurchaseOrderLineButton } from "@/components/RemovePurchaseOrderLineButton";
import { DeletePurchaseOrderDraftButton } from "@/components/DeletePurchaseOrderDraftButton";
import { PURCHASE_ORDER_STATUS_LABELS } from "@/lib/constants";
import { decimalToNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deleteBlocked?: string }>;
};

function formatLocalDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${m}/${y}`;
}

export default async function PurchaseOrderDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { deleteBlocked } = await searchParams;

  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      event: { include: { customer: true } },
      items: { orderBy: { id: "asc" } },
    },
  });
  if (!po) notFound();

  const isDraft = po.status === PurchaseOrderStatus.DRAFT;

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              הזמנת רכש #{po.orderNumber}
            </p>
            <h1 className="text-3xl font-bold">{po.supplier.name}</h1>
            <p className="mt-2 text-slate-600">
              סטטוס: {PURCHASE_ORDER_STATUS_LABELS[po.status] ?? po.status}
            </p>
            {po.event ? (
              <p className="mt-1 text-sm text-slate-600">
                אירוע: {po.event.customer.name}
                {po.event.name ? ` · ${po.event.name}` : ""} ·{" "}
                {formatLocalDate(new Date(po.event.date))}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">ללא אירוע מקושר</p>
            )}
          </div>
          <Link
            href="/purchasing/orders"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-50"
          >
            חזרה לרשימה
          </Link>
        </div>

        {deleteBlocked ? (
          <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            ניתן למחוק רק הזמנות במצב טיוטה.
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-xl font-bold">שורות</h2>
              <p className="text-lg font-bold">
                סה״כ משוער: ₪{decimalToNumber(po.estimatedTotal).toFixed(2)}
              </p>
            </div>

            {isDraft ? <AddPurchaseOrderLineForm purchaseOrderId={po.id} /> : null}

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] text-right text-sm">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="px-2 py-2 font-semibold">תיאור</th>
                    <th className="px-2 py-2 font-semibold">כמות</th>
                    <th className="px-2 py-2 font-semibold">יחידה</th>
                    <th className="px-2 py-2 font-semibold">₪</th>
                    {isDraft ? <th className="px-2 py-2 font-semibold" /> : null}
                  </tr>
                </thead>
                <tbody>
                  {po.items.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="px-2 py-2">{row.ingredientName}</td>
                      <td className="px-2 py-2">{decimalToNumber(row.quantity)}</td>
                      <td className="px-2 py-2">{row.unit}</td>
                      <td className="px-2 py-2">
                        ₪{decimalToNumber(row.estimatedPrice).toFixed(2)}
                      </td>
                      {isDraft ? (
                        <td className="px-2 py-2">
                          <RemovePurchaseOrderLineButton
                            itemId={row.id}
                            purchaseOrderId={po.id}
                          />
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
              {po.items.length === 0 ? (
                <p className="mt-4 text-center text-slate-500">אין שורות בהזמנה.</p>
              ) : null}
            </div>

            {!isDraft ? (
              <p className="mt-4 text-xs text-slate-500">
                שינוי שורות זמין רק בטיוטה. ניתן לשנות סטטוס והערות בכל עת.
              </p>
            ) : null}
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-bold">ניהול</h2>
              <PurchaseOrderMetaForm
                purchaseOrderId={po.id}
                status={po.status}
                requestedDeliveryDate={po.requestedDeliveryDate}
                notes={po.notes}
              />
            </div>
            {isDraft ? (
              <div className="rounded-[2rem] border border-red-100 bg-red-50/50 p-6">
                <DeletePurchaseOrderDraftButton purchaseOrderId={po.id} />
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
