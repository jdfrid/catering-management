import Link from "next/link";
import { moduleMetadata } from "@/components/ModulePlaceholder";

export const metadata = moduleMetadata(
  "רכש",
  "ספקים והזמנות רכש מקושרות לאירוע.",
);

export default function PurchasingHubPage() {
  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold">רכש</h1>
          <p className="mt-2 text-slate-600">
            ניהול ספקים והזמנות רכש — כולל קישור אופציונלי לאירוע.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/purchasing/suppliers"
            className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200 transition hover:ring-amber-300"
          >
            <h2 className="text-xl font-bold">ספקים</h2>
            <p className="mt-2 text-sm text-slate-600">
              רשימת ספקים, יצירה ועריכת פרטי קשר.
            </p>
          </Link>
          <Link
            href="/purchasing/orders"
            className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200 transition hover:ring-amber-300"
          >
            <h2 className="text-xl font-bold">הזמנות רכש</h2>
            <p className="mt-2 text-sm text-slate-600">
              טיוטות ושורות הזמנה, סטטוס ואספקה.
            </p>
          </Link>
        </div>

        <nav className="flex flex-wrap gap-3 border-t border-slate-200 pt-6 text-sm font-semibold text-slate-700">
          <Link href="/events" className="hover:text-amber-900 hover:underline">
            אירועים
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/quotes" className="hover:text-amber-900 hover:underline">
            הצעות מחיר
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/kitchen" className="hover:text-amber-900 hover:underline">
            משימות מטבח
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/finance" className="hover:text-amber-900 hover:underline">
            כספים
          </Link>
        </nav>
      </div>
    </main>
  );
}
