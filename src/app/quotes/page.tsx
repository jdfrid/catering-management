import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QUOTE_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function QuotesListPage() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      event: true,
    },
    take: 150,
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">הצעות מחיר</h1>
            <p className="mt-1 text-slate-600">בנייה, מעקב סטטוס וסיכומים.</p>
          </div>
          <Link
            href="/quotes/new"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
          >
            + הצעה חדשה
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full min-w-[800px] border-collapse text-right">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
                <th className="p-4 font-semibold">מס׳</th>
                <th className="p-4 font-semibold">לקוח</th>
                <th className="p-4 font-semibold">אירוע</th>
                <th className="p-4 font-semibold">סטטוס</th>
                <th className="p-4 font-semibold">סה״כ</th>
                <th className="p-4 font-semibold">רווח משוער</th>
                <th className="p-4 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    אין הצעות.{" "}
                    <Link href="/quotes/new" className="font-semibold text-amber-800 underline">
                      צור הצעה
                    </Link>
                  </td>
                </tr>
              ) : (
                quotes.map((q) => (
                  <tr key={q.id} className="border-b border-slate-100 hover:bg-amber-50/40">
                    <td className="p-4 font-mono font-bold" dir="ltr">
                      #{q.quoteNumber}
                    </td>
                    <td className="p-4">{q.customer.name}</td>
                    <td className="p-4 text-sm">
                      {q.event.name || q.event.type}
                      <span className="mr-1 text-slate-500">
                        ({new Date(q.event.date).toLocaleDateString("he-IL")})
                      </span>
                    </td>
                    <td className="p-4 text-sm">{QUOTE_STATUS_LABELS[q.status] ?? q.status}</td>
                    <td className="p-4 font-mono" dir="ltr">
                      ₪{Number(q.total).toFixed(2)}
                    </td>
                    <td className="p-4 font-mono text-emerald-800" dir="ltr">
                      ₪{Number(q.expectedProfit).toFixed(2)}
                      <span className="mr-1 text-xs text-slate-500">
                        ({Number(q.profitPercent).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <Link
                          href={`/quotes/${q.id}`}
                          className="font-bold text-amber-900 underline-offset-2 hover:underline"
                        >
                          פתיחה
                        </Link>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-600">
                          <Link
                            href={`/events/${q.eventId}`}
                            className="hover:text-amber-900 hover:underline"
                          >
                            אירוע
                          </Link>
                          <span className="text-slate-300">·</span>
                          <Link
                            href={`/purchasing/orders/new?eventId=${q.eventId}`}
                            className="hover:text-amber-900 hover:underline"
                          >
                            רכש
                          </Link>
                          <span className="text-slate-300">·</span>
                          <Link
                            href={`/finance?customerId=${q.customerId}&eventId=${q.eventId}`}
                            className="hover:text-amber-900 hover:underline"
                          >
                            תשלום
                          </Link>
                        </div>
                      </div>
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
