import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/EventForm";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ customerId?: string }> };

export default async function NewEventPage({ searchParams }: Props) {
  const { customerId } = await searchParams;
  const customers = await prisma.customer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (customers.length === 0) {
    return (
      <main className="min-h-[50vh] bg-[#f7f2ea] px-4 py-12">
        <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-8 text-center ring-1 ring-slate-200">
          <p className="text-slate-700">יש ליצור לפחות לקוח אחד לפני אירוע.</p>
          <Link
            href="/customers/new"
            className="mt-4 inline-block rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white"
          >
            ליצירת לקוח
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">אירוע חדש</h1>
          <Link
            href="/events"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            חזרה
          </Link>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <EventForm
            customers={customers}
            defaultCustomerId={customerId}
          />
        </div>
      </div>
    </main>
  );
}
