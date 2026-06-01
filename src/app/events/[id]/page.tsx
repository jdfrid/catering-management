import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/EventForm";
import { DeleteEventButton } from "@/components/DeleteEventButton";
import { QUOTE_STATUS_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deleteBlocked?: string }>;
};

export default async function EventDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { deleteBlocked } = await searchParams;

  const eventDetail = await prisma.event.findUnique({
    where: { id },
    include: {
      customer: true,
      quotes: { orderBy: { createdAt: "desc" } },
      kitchenTasks: {
        orderBy: [{ workDate: "asc" }, { name: "asc" }],
        include: { menuItem: { select: { name: true } } },
      },
    },
  });

  if (!eventDetail) notFound();

  const customers = await prisma.customer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">
            אירוע: {eventDetail.name || eventDetail.type}
          </h1>
          <Link href="/events" className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white">
            חזרה לרשימה
          </Link>
        </div>

        {deleteBlocked ? (
          <p className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            לא ניתן למחוק אירוע שיש לו הצעות מחיר. מחק או בטל הצעות תחילה.
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-6 text-xl font-bold">פרטי אירוע</h2>
            <EventForm customers={customers} event={eventDetail} />
            <div className="mt-10 border-t border-slate-200 pt-8">
              <h3 className="mb-3 text-sm font-semibold text-slate-500">מסוכן</h3>
              <DeleteEventButton eventId={eventDetail.id} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] bg-slate-900 p-6 text-white">
              <h2 className="text-lg font-bold">הצעות מחיר לאירוע</h2>
              <p className="mt-2 text-sm text-slate-300">
                כל אירוע יכול לכלול מספר גרסאות הצעה.
              </p>
              <Link
                href={`/quotes/new?eventId=${eventDetail.id}`}
                className="mt-4 inline-block rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300"
              >
                + הצעה חדשה לאירוע
              </Link>
              <ul className="mt-6 space-y-3">
                {eventDetail.quotes.length === 0 ? (
                  <li className="text-sm text-slate-400">אין הצעות עדיין.</li>
                ) : (
                  eventDetail.quotes.map((q) => (
                    <li key={q.id}>
                      <Link
                        href={`/quotes/${q.id}`}
                        className="block rounded-2xl border border-white/20 bg-white/5 p-4 hover:bg-white/10"
                      >
                        <span className="font-bold">הצעה #{q.quoteNumber}</span>
                        <span className="mr-2 text-sm text-slate-300">
                          {QUOTE_STATUS_LABELS[q.status] ?? q.status}
                        </span>
                        <span className="mt-1 block text-sm text-amber-200">
                          סה״כ: ₪{Number(q.total).toFixed(2)}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="font-bold text-slate-800">לקוח</h2>
              <Link
                href={`/customers/${eventDetail.customerId}`}
                className="mt-2 inline-block font-semibold text-amber-900 underline"
              >
                {eventDetail.customer.name}
              </Link>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold text-slate-800">משימות מטבח</h2>
                <Link
                  href="/kitchen"
                  className="text-sm font-semibold text-amber-900 underline"
                >
                  לכל המשימות
                </Link>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                נוצרות אוטומטית כשהצעה מאושרת ויש בה מנות.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {eventDetail.kitchenTasks.length === 0 ? (
                  <li className="text-slate-500">אין משימות עדיין.</li>
                ) : (
                  eventDetail.kitchenTasks.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/kitchen/${t.id}`}
                        className="block rounded-xl border border-slate-200 px-3 py-2 hover:bg-amber-50/50"
                      >
                        <span className="font-semibold">{t.name}</span>
                        <span className="mr-2 text-xs text-slate-500">
                          {TASK_STATUS_LABELS[t.status] ?? t.status}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-600">
                          {new Date(t.workDate).toLocaleDateString("he-IL")} ·{" "}
                          {t.department}
                          {t.menuItem ? ` · ${t.menuItem.name}` : ""}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="font-bold text-slate-800">פעולות מהירות לאירוע</h2>
              <ul className="mt-4 flex flex-col gap-2 text-sm font-semibold">
                <li>
                  <Link
                    href={`/purchasing/orders/new?eventId=${eventDetail.id}`}
                    className="text-amber-900 underline-offset-2 hover:underline"
                  >
                    הזמנת רכש מקושרת
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/kitchen/new?eventId=${eventDetail.id}`}
                    className="text-amber-900 underline-offset-2 hover:underline"
                  >
                    משימת מטבח חדשה
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/finance?customerId=${eventDetail.customerId}&eventId=${eventDetail.id}`}
                    className="text-amber-900 underline-offset-2 hover:underline"
                  >
                    רישום תשלום
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/purchasing/suppliers`}
                    className="font-normal text-slate-600 underline-offset-2 hover:text-amber-900 hover:underline"
                  >
                    ניהול ספקים
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
