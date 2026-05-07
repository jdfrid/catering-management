import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CustomersListPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { events: true, quotes: true } } },
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">לקוחות</h1>
            <p className="mt-1 text-slate-600">
              ניהול לקוחות, אנשי קשר והמשך לאירועים והצעות.
            </p>
          </div>
          <Link
            href="/customers/new"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
          >
            + לקוח חדש
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full min-w-[640px] border-collapse text-right">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
                <th className="p-4 font-semibold">שם</th>
                <th className="p-4 font-semibold">סוג</th>
                <th className="p-4 font-semibold">טלפון</th>
                <th className="p-4 font-semibold">סטטוס</th>
                <th className="p-4 font-semibold">אירועים</th>
                <th className="p-4 font-semibold">הצעות</th>
                <th className="p-4 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    אין לקוחות עדיין.{" "}
                    <Link className="font-semibold text-amber-800 underline" href="/customers/new">
                      צור לקוח ראשון
                    </Link>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-amber-50/40">
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4 text-slate-700">{c.type}</td>
                    <td className="p-4 font-mono text-sm" dir="ltr">
                      {c.phone}
                    </td>
                    <td className="p-4">
                      {c.active ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                          פעיל
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                          לא פעיל
                        </span>
                      )}
                    </td>
                    <td className="p-4">{c._count.events}</td>
                    <td className="p-4">{c._count.quotes}</td>
                    <td className="p-4">
                      <Link
                        href={`/customers/${c.id}`}
                        className="font-bold text-amber-900 underline-offset-2 hover:underline"
                      >
                        פתיחה
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
