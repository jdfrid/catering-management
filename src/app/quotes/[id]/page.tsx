import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { QuoteMetaForm } from "@/components/QuoteMetaForm";
import { AddQuoteLineForm } from "@/components/AddQuoteLineForm";
import { RemoveQuoteLineButton } from "@/components/RemoveQuoteLineButton";
import { DeleteQuoteDraftButton } from "@/components/DeleteQuoteDraftButton";
import { DEFAULT_VAT_RATE } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locked?: string; deleteBlocked?: string }>;
};

export default async function QuoteDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { locked, deleteBlocked } = await searchParams;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      event: true,
      items: { include: { menuItem: true }, orderBy: { id: "asc" } },
    },
  });

  if (!quote) notFound();

  const menuItems = await prisma.menuItem.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const lineReadOnly = quote.status === QuoteStatus.APPROVED;

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">הצעת מחיר #{quote.quoteNumber}</h1>
            <p className="mt-1 text-slate-600">
              {quote.customer.name} · {quote.event.name || quote.event.type} ·{" "}
              {new Date(quote.event.date).toLocaleString("he-IL")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/events/${quote.eventId}`}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white"
            >
              לאירוע
            </Link>
            <Link
              href={`/purchasing/orders/new?eventId=${quote.eventId}`}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white"
            >
              רכש
            </Link>
            <Link
              href={`/kitchen/new?eventId=${quote.eventId}`}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white"
            >
              מטבח
            </Link>
            <Link
              href={`/finance?customerId=${quote.customerId}&eventId=${quote.eventId}`}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white"
            >
              תשלום
            </Link>
            <Link href="/quotes" className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white">
              לכל ההצעות
            </Link>
          </div>
        </div>

        {locked ? (
          <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-900">לא ניתן לשנות הצעה מאושרת.</p>
        ) : null}
        {deleteBlocked ? (
          <p className="mb-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
            ניתן למחוק רק טיוטות.
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-xl font-bold">פרטי הצעה ותנאים</h2>
              <QuoteMetaForm quote={quote} />
            </section>

            <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-xl font-bold">שורות הצעה</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-right text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th className="p-3 font-semibold">מנה</th>
                      <th className="p-3 font-semibold">כמות</th>
                      <th className="p-3 font-semibold">מחיר יחידה</th>
                      <th className="p-3 font-semibold">סה״כ שורה</th>
                      <th className="p-3 font-semibold" />
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-slate-500">
                          אין שורות — הוסף מנות מהקטלוג.
                        </td>
                      </tr>
                    ) : (
                      quote.items.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100">
                          <td className="p-3 font-medium">{row.menuItem.name}</td>
                          <td className="p-3 font-mono" dir="ltr">
                            {Number(row.quantity)}
                          </td>
                          <td className="p-3 font-mono" dir="ltr">
                            ₪{Number(row.unitPrice).toFixed(2)}
                          </td>
                          <td className="p-3 font-mono font-semibold" dir="ltr">
                            ₪{Number(row.totalPrice).toFixed(2)}
                          </td>
                          <td className="p-3">
                            <RemoveQuoteLineButton
                              quoteId={quote.id}
                              itemId={row.id}
                              disabled={lineReadOnly}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <AddQuoteLineForm
                quoteId={quote.id}
                menuItems={menuItems}
                disabled={lineReadOnly}
              />
            </section>

            <div className="flex flex-wrap gap-3">
              <DeleteQuoteDraftButton quoteId={quote.id} status={quote.status} />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] bg-slate-900 p-6 text-white">
              <h2 className="text-lg font-bold">סיכום</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">סיכום לפני מע״מ</dt>
                  <dd className="font-mono" dir="ltr">
                    ₪{Number(quote.subtotal).toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-400">
                    מע״מ ({Math.round(DEFAULT_VAT_RATE * 100)}%)
                  </dt>
                  <dd className="font-mono" dir="ltr">
                    ₪{Number(quote.vat).toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-white/15 pt-3 text-base font-bold">
                  <dt>לתשלום</dt>
                  <dd className="font-mono text-amber-300" dir="ltr">
                    ₪{Number(quote.total).toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 text-emerald-300">
                  <dt>רווח לפני מע״מ</dt>
                  <dd className="font-mono" dir="ltr">
                    ₪{Number(quote.expectedProfit).toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 text-sm text-slate-400">
                  <dt>% רווח</dt>
                  <dd className="font-mono" dir="ltr">
                    {Number(quote.profitPercent).toFixed(1)}%
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-slate-500">
                הסיכומים מתעדכנים אוטומטית בעת שינוי שורות, הנחה או עלות
                פנימית.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200">
              <h3 className="font-bold">מנהלים</h3>
              <p className="mt-2 text-sm text-slate-600">
                עלות פנימית ורווחיות מוצגות כאן לכל משתמש (התחברות והרשאות
                יתווספו בהמשך).
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
