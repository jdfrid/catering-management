import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { moduleMetadata } from "@/components/ModulePlaceholder";
import { toDateInputValue } from "@/lib/date-input";

export const metadata = moduleMetadata(
  "מחירון ספקים",
  "מחירי רכש לפי ספק וחומר גלם — לפי יחידה ותוקף.",
);

export const dynamic = "force-dynamic";

function validityLabel(
  validFrom: Date | null,
  validTo: Date | null,
): { text: string; ok: boolean } {
  const now = new Date();
  if (validFrom && now < new Date(validFrom.getFullYear(), validFrom.getMonth(), validFrom.getDate())) {
    return { text: "טרם נכנס לתוקף", ok: false };
  }
  if (validTo) {
    const end = new Date(validTo);
    end.setHours(23, 59, 59, 999);
    if (now > end) return { text: "פג תוקף", ok: false };
  }
  return { text: "תקף", ok: true };
}

export default async function SupplierPricesListPage() {
  const rows = await prisma.supplierPrice.findMany({
    orderBy: [
      { supplier: { name: "asc" } },
      { ingredient: { name: "asc" } },
      { priceUnit: "asc" },
    ],
    include: {
      supplier: { select: { id: true, name: true, active: true } },
      ingredient: { select: { id: true, name: true } },
    },
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">מחירון ספקים</h1>
            <p className="mt-1 text-slate-600">
              מחירי רכש — יחידת המחירון חייבת להתאים לשורות המתכון.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/purchasing"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-50"
            >
              רכש
            </Link>
            <Link
              href="/purchasing/prices/new"
              className="rounded-2xl bg-slate-950 px-4 py-2 font-bold text-white hover:bg-slate-800"
            >
              מחיר חדש
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full min-w-[800px] text-right text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold">ספק</th>
                <th className="px-4 py-3 font-semibold">חומר גלם</th>
                <th className="px-4 py-3 font-semibold">מחיר</th>
                <th className="px-4 py-3 font-semibold">יחידה</th>
                <th className="px-4 py-3 font-semibold">תוקף</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    אין רשומות —{" "}
                    <Link href="/purchasing/prices/new" className="font-semibold text-amber-900 underline">
                      הוסיפו מחיר
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const v = validityLabel(r.validFrom, r.validTo);
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-amber-50/40"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium">{r.supplier.name}</span>
                        {!r.supplier.active ? (
                          <span className="mr-2 text-xs text-slate-500">
                            (לא פעיל)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{r.ingredient.name}</td>
                      <td className="px-4 py-3 font-mono" dir="ltr">
                        ₪{Number(r.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{r.priceUnit}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            v.ok
                              ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                              : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900"
                          }
                        >
                          {v.text}
                        </span>
                        <div className="mt-1 text-xs text-slate-500">
                          {r.validFrom
                            ? `מ־${toDateInputValue(r.validFrom)}`
                            : "ללא תחילה"}
                          {" · "}
                          {r.validTo
                            ? `עד ${toDateInputValue(r.validTo)}`
                            : "ללא סיום"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/purchasing/prices/${r.id}`}
                          className="font-semibold text-amber-900 hover:underline"
                        >
                          עריכה
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
