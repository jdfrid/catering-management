import {
  dashboardMetrics,
  kitchenTasks,
  managerOnlyFields,
  mvpModules,
  quotePipeline,
} from "@/lib/catering-data";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f2ea] text-slate-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold text-amber-300">
                CateringOS MVP
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                מערכת ניהול קייטרינג מקצה לקצה
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-200">
                בסיס ראשוני לניהול לקוחות, אירועים, עץ מוצר, הצעות מחיר,
                רכש, משימות מטבח ותשלומים. המערכת מתוכננת בעברית, RTL,
                PostgreSQL ופריסה ב-Render.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm text-slate-300">כלל הרשאה מרכזי</p>
              <p className="mt-2 text-2xl font-bold">
                רווחיות ועלויות: מנהלים בלבד
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map((metric) => (
            <article
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              key={metric.label}
            >
              <p className="text-sm font-medium text-slate-500">
                {metric.label}
              </p>
              <p className="mt-3 text-4xl font-bold">{metric.value}</p>
              <p className="mt-3 text-sm text-slate-600">{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">צנרת הצעות ואירועים</h2>
                <p className="mt-1 text-sm text-slate-500">
                  תצוגת עבודה ראשונית למכירות ולניהול.
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
                MVP
              </span>
            </div>
            <div className="space-y-3">
              {quotePipeline.map((item) => (
                <div
                  className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1fr_auto]"
                  key={item.title}
                >
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.status} · אחראי: {item.owner}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-slate-900">
                    {item.amount}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold">מודולי MVP</h2>
            <div className="mt-5 grid gap-3">
              {mvpModules.map((module) => (
                <div
                  className="rounded-2xl bg-slate-50 px-4 py-3 font-medium"
                  key={module}
                >
                  {module}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-sm">
            <h2 className="text-2xl font-bold">שדות מוסתרים ממי שאינו מנהל</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              החישובים יבוצעו בצד שרת, אבל התצוגה תהיה מוגבלת לפי תפקיד.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {managerOnlyFields.map((field) => (
                <span
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"
                  key={field}
                >
                  {field}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5">
              <h2 className="text-2xl font-bold">מסך מטבח לטאבלט</h2>
              <p className="mt-1 text-sm text-slate-500">
                כרטיסי משימה גדולים ועדכון סטטוס מהיר.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {kitchenTasks.map((task) => (
                <div
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  key={task.name}
                >
                  <p className="text-sm font-semibold text-amber-700">
                    {task.time} · {task.department}
                  </p>
                  <h3 className="mt-3 text-xl font-bold">{task.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{task.event}</p>
                  <button className="mt-5 min-h-12 w-full rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white">
                    {task.status}
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
