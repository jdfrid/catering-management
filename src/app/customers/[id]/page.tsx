import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "@/components/CustomerForm";
import { DeleteCustomerButton } from "@/components/DeleteCustomerButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deleteBlocked?: string }>;
};

export default async function CustomerDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { deleteBlocked } = await searchParams;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      events: { orderBy: { date: "desc" }, take: 20 },
    },
  });

  if (!customer) notFound();

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">כרטיס לקוח: {customer.name}</h1>
          <Link
            href="/customers"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-white"
          >
            חזרה לרשימה
          </Link>
        </div>

        {deleteBlocked ? (
          <p className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            לא ניתן למחוק לקוח עם אירועים קשורים. מחק או העבר אירועים תחילה.
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-6 text-xl font-bold">עריכת פרטים</h2>
            <CustomerForm customer={customer} />
            <div className="mt-10 border-t border-slate-200 pt-8">
              <h3 className="mb-3 text-sm font-semibold text-slate-500">מסוכן</h3>
              <DeleteCustomerButton customerId={customer.id} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold">אירועים אחרונים</h2>
                <Link
                  href={`/events/new?customerId=${customer.id}`}
                  className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800"
                >
                  + אירוע
                </Link>
              </div>
              {customer.events.length === 0 ? (
                <p className="text-sm text-slate-600">אין אירועים. צור אירוע חדש.</p>
              ) : (
                <ul className="space-y-3">
                  {customer.events.map((ev) => (
                    <li key={ev.id}>
                      <Link
                        href={`/events/${ev.id}`}
                        className="flex flex-col rounded-2xl border border-slate-200 p-4 hover:border-amber-300 hover:bg-amber-50/50"
                      >
                        <span className="font-bold">
                          {ev.name || ev.type} · {ev.type}
                        </span>
                        <span className="text-sm text-slate-600">
                          {new Date(ev.date).toLocaleDateString("he-IL")} ·{" "}
                          {ev.guestCount} סועדים
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[2rem] bg-slate-900 p-6 text-white">
              <h2 className="text-lg font-bold">המשך תהליך</h2>
              <p className="mt-2 text-sm text-slate-300">
                קישורים לשלבים נפוצים: הצעה, רכש, משימת מטבח ותשלום — גם מעמוד אירוע
                ספציפי עם הקשר אוטומטי.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={`/events/new?customerId=${customer.id}`}
                  className="inline-block rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white hover:bg-white/20"
                >
                  + אירוע חדש
                </Link>
                <Link
                  href="/quotes/new"
                  className="inline-block rounded-2xl bg-amber-400 px-5 py-3 text-center text-sm font-bold text-slate-950 hover:bg-amber-300"
                >
                  הצעת מחיר חדשה
                </Link>
                <Link
                  href={`/finance?customerId=${customer.id}`}
                  className="inline-block rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white hover:bg-white/20"
                >
                  רישום תשלום ללקוח
                </Link>
                <Link
                  href="/purchasing"
                  className="inline-block rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white hover:bg-white/20"
                >
                  מודול רכש
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
