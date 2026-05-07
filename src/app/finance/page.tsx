import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { moduleMetadata } from "@/components/ModulePlaceholder";
import { PaymentForm } from "@/components/PaymentForm";
import { decimalToNumber } from "@/lib/money";

export const metadata = moduleMetadata(
  "כספים",
  "תיעוד תשלומים מול לקוח ואירוע.",
);

export const dynamic = "force-dynamic";

function formatWhen(d: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(d));
}

type PageProps = {
  searchParams: Promise<{ customerId?: string; eventId?: string }>;
};

export default async function FinancePage({ searchParams }: PageProps) {
  const { customerId: qCustomerId, eventId: qEventId } = await searchParams;

  const [payments, customers, events] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      take: 150,
      include: {
        customer: true,
        event: true,
      },
    }),
    prisma.customer.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.event.findMany({
      orderBy: { date: "desc" },
      take: 500,
      select: {
        id: true,
        name: true,
        type: true,
        date: true,
        customerId: true,
      },
    }),
  ]);

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">כספים</h1>
            <p className="mt-1 text-slate-600">
              רישום תשלומים וצפייה בתנועות האחרונות.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-xl font-bold">תשלומים אחרונים</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-right text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 font-semibold">מועד</th>
                    <th className="px-3 py-2 font-semibold">לקוח</th>
                    <th className="px-3 py-2 font-semibold">אירוע</th>
                    <th className="px-3 py-2 font-semibold">סכום</th>
                    <th className="px-3 py-2 font-semibold">אמצעי</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatWhen(p.paidAt)}
                      </td>
                      <td className="px-3 py-2">{p.customer.name}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {p.event ? p.event.name ?? p.event.type : "—"}
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        ₪{decimalToNumber(p.amount).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {p.method ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {payments.length === 0 ? (
              <p className="mt-4 text-center text-slate-500">אין תשלומים עדיין.</p>
            ) : null}
          </section>

          <aside className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-xl font-bold">תשלום חדש</h2>
            {customers.length === 0 ? (
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
                <p>יש ליצור לקוח לפני רישום תשלום.</p>
                <Link
                  href="/customers/new"
                  className="mt-2 inline-block font-bold underline"
                >
                  ליצירת לקוח
                </Link>
              </div>
            ) : (
              <PaymentForm
                customers={customers}
                events={events}
                defaultCustomerId={qCustomerId}
                defaultEventId={qEventId}
              />
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
