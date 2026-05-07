import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PURCHASE_ORDER_STATUS_LABELS } from "@/lib/constants";
import { decimalToNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function PurchaseOrdersListPage() {
  const orders = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      supplier: true,
      event: { include: { customer: true } },
    },
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">הזמנות רכש</h1>
            <p className="mt-1 text-slate-600">ממוינות לפי תאריך יצירה.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/purchasing"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-50"
            >
              רכש
            </Link>
            <Link
              href="/purchasing/orders/new"
              className="rounded-2xl bg-slate-950 px-4 py-2 font-bold text-white hover:bg-slate-800"
            >
              הזמנה חדשה
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold">מס׳</th>
                <th className="px-4 py-3 font-semibold">ספק</th>
                <th className="px-4 py-3 font-semibold">אירוע</th>
                <th className="px-4 py-3 font-semibold">סטטוס</th>
                <th className="px-4 py-3 font-semibold">הערכת עלות</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {orders.map((po) => (
                <tr key={po.id} className="border-b border-slate-100 hover:bg-amber-50/40">
                  <td className="px-4 py-3 font-mono font-semibold">
                    #{po.orderNumber}
                  </td>
                  <td className="px-4 py-3">{po.supplier.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {po.event ? (
                      <>
                        {po.event.customer.name}
                        {po.event.name ? ` · ${po.event.name}` : ""}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {PURCHASE_ORDER_STATUS_LABELS[po.status] ?? po.status}
                  </td>
                  <td className="px-4 py-3">
                    ₪{decimalToNumber(po.estimatedTotal).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/purchasing/orders/${po.id}`}
                      className="font-semibold text-amber-800 hover:underline"
                    >
                      פתיחה
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 ? (
            <p className="p-8 text-center text-slate-500">אין הזמנות עדיין.</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
