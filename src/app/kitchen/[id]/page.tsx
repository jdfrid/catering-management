import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { KitchenTaskForm } from "@/components/KitchenTaskForm";
import { DeleteKitchenTaskButton } from "@/components/DeleteKitchenTaskButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function KitchenTaskDetailPage({ params }: Props) {
  const { id } = await params;

  const [task, events, menuItems] = await Promise.all([
    prisma.kitchenTask.findUnique({ where: { id } }),
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

  if (!task) notFound();

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">{task.name}</h1>
          <Link
            href="/kitchen"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            חזרה
          </Link>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <KitchenTaskForm task={task} events={events} menuItems={menuItems} />
        </div>

        <div className="rounded-[2rem] border border-red-100 bg-red-50/50 p-6">
          <DeleteKitchenTaskButton taskId={task.id} />
        </div>
      </div>
    </main>
  );
}
