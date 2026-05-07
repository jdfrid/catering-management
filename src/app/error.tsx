"use client";

import Link from "next/link";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">לא ניתן לטעון את העמוד</h1>
      <p className="text-sm leading-6 text-slate-600">
        ברוב המקרים זה אומר שאין חיבור ל־PostgreSQL: ודאו ש־{" "}
        <code className="rounded bg-slate-100 px-1">DATABASE_URL</code> מוגדר
        (ראו <code className="rounded bg-slate-100 px-1">.env.example</code>
        ), הריצו מקומית{" "}
        <code className="rounded bg-slate-100 px-1">npm run db:up</code> ואז{" "}
        <code className="rounded bg-slate-100 px-1">npx prisma migrate deploy</code>
        . בפרודקשן (Render) חייב להיות בסיס נתונים ומשתנה הסביבה מחובר. פרטי
        טכניים:{" "}
        <span className="font-mono text-red-800">{error.message}</span>
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
        >
          נסו שוב
        </button>
        <Link
          href="/"
          className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-white"
        >
          לדף הבית
        </Link>
      </div>
    </main>
  );
}
