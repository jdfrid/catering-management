import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewQuoteForm } from "@/components/NewQuoteForm";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ eventId?: string }> };

export default async function NewQuotePage({ searchParams }: Props) {
  const { eventId } = await searchParams;

  const events = await prisma.event.findMany({
    include: { customer: true },
    orderBy: { date: "desc" },
    take: 300,
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">הצעת מחיר חדשה</h1>
          <Link
            href="/quotes"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            חזרה
          </Link>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <NewQuoteForm events={events} defaultEventId={eventId} />
        </div>
      </div>
    </main>
  );
}
