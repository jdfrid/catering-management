import Link from "next/link";
import { MenuItemForm } from "@/components/MenuItemForm";

export default function NewMenuItemPage() {
  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">מנה חדשה</h1>
          <Link
            href="/menu"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            חזרה
          </Link>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <MenuItemForm />
        </div>
      </div>
    </main>
  );
}
