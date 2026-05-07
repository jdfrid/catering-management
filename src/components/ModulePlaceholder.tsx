import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function moduleMetadata(title: string, description: string): Metadata {
  return { title: `${title} | מערכת ניהול קייטרינג`, description };
}

export function ModulePlaceholder({
  title,
  description,
  actions,
}: Props) {
  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-amber-700">מסך MVP</p>
        <h1 className="mt-2 text-3xl font-bold">{title}</h1>
        <p className="mt-4 leading-8 text-slate-600">{description}</p>
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          בשלב זה העמוד מציג מבנה וניווט. נתונים אמיתיים, טפסים והרשאות יתווספו
          בהמשך הפיתוח מול PostgreSQL.
        </p>
        {actions ? (
          <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
        ) : null}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
          >
            חזרה לדשבורד
          </Link>
        </div>
      </div>
    </main>
  );
}
