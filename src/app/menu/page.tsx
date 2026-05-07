import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MenuListPage() {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">תפריט ומנות</h1>
            <p className="mt-1 text-slate-600">קטלוג מנות לבניית הצעות מחיר.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/menu/ingredients"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 font-semibold text-slate-800 hover:bg-slate-50"
            >
              חומרי גלם · עץ מוצר
            </Link>
            <Link
              href="/menu/new"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
            >
              + מנה חדשה
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full min-w-[680px] border-collapse text-right">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
                <th className="p-4 font-semibold">מנה</th>
                <th className="p-4 font-semibold">קטגוריה</th>
                <th className="p-4 font-semibold">יחידה</th>
                <th className="p-4 font-semibold">מחיר מומלץ</th>
                <th className="p-4 font-semibold">פעיל</th>
                <th className="p-4 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    אין מנות.{" "}
                    <Link href="/menu/new" className="font-semibold text-amber-800 underline">
                      הוסף מנה
                    </Link>
                  </td>
                </tr>
              ) : (
                items.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100 hover:bg-amber-50/40">
                    <td className="p-4 font-medium">{m.name}</td>
                    <td className="p-4 text-slate-700">{m.category}</td>
                    <td className="p-4">{m.saleUnit}</td>
                    <td className="p-4 font-mono text-sm" dir="ltr">
                      {m.suggestedPrice != null
                        ? `₪${Number(m.suggestedPrice).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="p-4">
                      {m.active ? (
                        <span className="text-xs font-bold text-emerald-700">כן</span>
                      ) : (
                        <span className="text-xs text-slate-500">לא</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/menu/${m.id}`}
                        className="font-bold text-amber-900 underline-offset-2 hover:underline"
                      >
                        עריכה
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
