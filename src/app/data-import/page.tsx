import Link from "next/link";
import { moduleMetadata } from "@/components/ModulePlaceholder";
import { CsvImportForm } from "@/components/CsvImportForm";
import { IMPORT_ENTITIES } from "@/app/data-import/config";

export const metadata = moduleMetadata(
  "ייבוא CSV",
  "טעינת נתונים מקובץ CSV (מייצוא אקסל) לרשימות המערכת.",
);

export default function DataImportPage() {
  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">ייבוא נתונים מ־CSV</h1>
            <p className="mt-2 text-slate-600">
              שורת כותרות ראשונה חובה. כותרות בעברית או באנגלית (ראו טבלה).
              איקסל: קובץ ← שמירה בשם ← CSV UTF-8 (מומלץ).
            </p>
          </div>
          <Link
            href="/"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            דשבורד
          </Link>
        </div>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-6 text-lg font-bold">העלאת קובץ</h2>
          <CsvImportForm />
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-bold">סדר מומלץ לייבוא</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm text-slate-700">
            <li>לקוחות → אנשי קשר ללקוח (אופציונלי) → אירועים</li>
            <li>ספקים → חומרי גלם → מנות → מחירון ספקים → שורות מתכון</li>
          </ol>
          <p className="mt-4 text-xs text-slate-500">
            שורות מתכון ומחירונים מקשרים לפי <strong>שם מדויק</strong> כפי
            שמופיע במערכת.
          </p>
        </section>

        <section className="overflow-x-auto rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-bold">עמודות לפי סוג</h2>
          <table className="w-full min-w-[520px] text-right text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 font-semibold">רשימה</th>
                <th className="px-3 py-2 font-semibold">שדות (דוגמה)</th>
              </tr>
            </thead>
            <tbody>
              {IMPORT_ENTITIES.map((e) => (
                <tr key={e.value} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-medium">{e.label}</td>
                  <td className="px-3 py-2 text-slate-600">{e.hint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
