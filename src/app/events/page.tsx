import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EVENT_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EventsListPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: { customer: true },
    take: 100,
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">אירועים</h1>
            <p className="mt-1 text-slate-600">רישום אירועים ומעקב סטטוס.</p>
          </div>
          <Link
            href="/events/new"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
          >
            + אירוע חדש
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-right">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
                <th className="p-4 font-semibold">תאריך</th>
                <th className="p-4 font-semibold">לקוח</th>
                <th className="p-4 font-semibold">אירוע</th>
                <th className="p-4 font-semibold">סועדים</th>
                <th className="p-4 font-semibold">סטטוס</th>
                <th className="p-4 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    אין אירועים.{" "}
                    <Link className="font-semibold text-amber-800 underline" href="/events/new">
                      צור אירוע
                    </Link>
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="border-b border-slate-100 hover:bg-amber-50/40">
                    <td className="p-4 text-sm">
                      {new Date(ev.date).toLocaleString("he-IL", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="p-4 font-medium">{ev.customer.name}</td>
                    <td className="p-4">
                      <span className="font-semibold">{ev.name || ev.type}</span>
                      <span className="mr-2 text-sm text-slate-500">{ev.type}</span>
                    </td>
                    <td className="p-4">{ev.guestCount}</td>
                    <td className="p-4 text-sm">
                      {EVENT_STATUS_LABELS[ev.status] ?? ev.status}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <Link
                          href={`/events/${ev.id}`}
                          className="font-bold text-amber-900 underline-offset-2 hover:underline"
                        >
                          ניהול
                        </Link>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-600">
                          <Link
                            href={`/quotes/new?eventId=${ev.id}`}
                            className="hover:text-amber-900 hover:underline"
                          >
                            הצעה
                          </Link>
                          <span className="text-slate-300">·</span>
                          <Link
                            href={`/purchasing/orders/new?eventId=${ev.id}`}
                            className="hover:text-amber-900 hover:underline"
                          >
                            רכש
                          </Link>
                          <span className="text-slate-300">·</span>
                          <Link
                            href={`/kitchen/new?eventId=${ev.id}`}
                            className="hover:text-amber-900 hover:underline"
                          >
                            מטבח
                          </Link>
                          <span className="text-slate-300">·</span>
                          <Link
                            href={`/finance?customerId=${ev.customerId}&eventId=${ev.id}`}
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
