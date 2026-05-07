import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KitchenTaskForm } from "@/components/KitchenTaskForm";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ eventId?: string }> };

export default async function NewKitchenTaskPage({ searchParams }: Props) {
  const { eventId } = await searchParams;

  const [events, menuItems] = await Promise.all([
    prisma.event.findMany({
      orderBy: { date: "desc" },
      take: 400,
      select: {
        id: true,
        name: true,
        type: true,
        date: true,
        customer: { select: { name: true } },
      },
    }),
    prisma.menuItem.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: { id: true, name: true, category: true },
    }),
  ]);

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">משימת מטבח חדשה</h1>
          <Link
            href="/kitchen"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            חזרה
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-[2rem] bg-amber-50 p-6 text-amber-950 ring-1 ring-amber-200">
            <p className="font-semibold">יש ליצור אירוע לפני משימת מטבח.</p>
            <Link href="/events/new" className="mt-3 inline-block font-bold underline">
              ליצירת אירוע
            </Link>
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <KitchenTaskForm
              events={events}
              menuItems={menuItems}
              defaultEventId={eventId}
            />
          </div>
        )}
      </div>
    </main>
  );
}
