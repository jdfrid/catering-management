import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuppliersListPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { purchaseOrders: true } } },
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">ספקים</h1>
            <p className="mt-1 text-slate-600">רשימת ספקים פעילים ולא פעילים.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/purchasing"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-50"
            >
              רכש
            </Link>
            <Link
              href="/purchasing/suppliers/new"
              className="rounded-2xl bg-slate-950 px-4 py-2 font-bold text-white hover:bg-slate-800"
            >
              ספק חדש
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full min-w-[600px] text-right text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold">שם</th>
                <th className="px-4 py-3 font-semibold">קטגוריה</th>
                <th className="px-4 py-3 font-semibold">טלפון</th>
                <th className="px-4 py-3 font-semibold">הזמנות</th>
                <th className="px-4 py-3 font-semibold">סטטוס</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-amber-50/40">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.category}</td>
                  <td className="px-4 py-3 text-slate-600">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3">{s._count.purchaseOrders}</td>
                  <td className="px-4 py-3">
                    {s.active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        פעיל
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        לא פעיל
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/purchasing/suppliers/${s.id}`}
                      className="font-semibold text-amber-800 hover:underline"
                    >
                      פתיחה
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {suppliers.length === 0 ? (
            <p className="p-8 text-center text-slate-500">אין ספקים עדיין.</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
