import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { moduleMetadata } from "@/components/ModulePlaceholder";
import { KitchenTaskQuickStatusForm } from "@/components/KitchenTaskQuickStatusForm";
import { TASK_STATUS_LABELS } from "@/lib/constants";

export const metadata = moduleMetadata(
  "משימות מטבח",
  "משימות לפי תאריך ומחלקה.",
);

export const dynamic = "force-dynamic";

function formatLocalDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${m}/${y}`;
}

export default async function KitchenPage() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const tasks = await prisma.kitchenTask.findMany({
    where: { workDate: { gte: start } },
    orderBy: [{ workDate: "asc" }, { department: "asc" }],
    take: 200,
    include: {
      event: { include: { customer: true } },
      menuItem: true,
    },
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">משימות מטבח</h1>
            <p className="mt-1 text-slate-600">
              משימות מהיום ואילך, לפי תאריך עבודה.
            </p>
          </div>
          <Link
            href="/kitchen/new"
            className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800"
          >
            משימה חדשה
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((t) => (
            <article
              key={t.id}
              className="flex flex-col rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {t.department}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  {TASK_STATUS_LABELS[t.status] ?? t.status}
                </span>
              </div>
              <h2 className="text-xl font-bold">{t.name}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {t.event.customer.name}
                {t.event.name ? ` · ${t.event.name}` : ""}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatLocalDate(new Date(t.workDate))}
                {t.menuItem ? ` · ${t.menuItem.name}` : ""}
              </p>
              {t.assignee ? (
                <p className="mt-2 text-sm font-medium">אחראי: {t.assignee}</p>
              ) : null}

              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  עדכון מהיר
                </p>
                <KitchenTaskQuickStatusForm
                  taskId={t.id}
                  currentStatus={t.status}
                />
              </div>

              <Link
                href={`/kitchen/${t.id}`}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 font-semibold hover:bg-slate-50"
              >
                פרטים מלאים
              </Link>
            </article>
          ))}
        </div>

        {tasks.length === 0 ? (
          <p className="rounded-[2rem] bg-white p-10 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
            אין משימות מתוכננות מהיום.{" "}
            <Link href="/kitchen/new" className="font-bold text-amber-800 underline">
              צור משימה
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
