import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuItemForm } from "@/components/MenuItemForm";
import { DeleteMenuItemButton } from "@/components/DeleteMenuItemButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deleteBlocked?: string }>;
};

export default async function MenuItemDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { deleteBlocked } = await searchParams;

  const menuItem = await prisma.menuItem.findUnique({ where: { id } });
  if (!menuItem) notFound();

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">עריכת מנה: {menuItem.name}</h1>
          <Link href="/menu" className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white">
            חזרה
          </Link>
        </div>

        {deleteBlocked ? (
          <p className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            לא ניתן למחוק מנה שמופיעה בהצעות מחיר קיימות.
          </p>
        ) : null}

        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <MenuItemForm menuItem={menuItem} />
          <div className="mt-10 border-t border-slate-200 pt-8">
            <h3 className="mb-3 text-sm font-semibold text-slate-500">מסוכן</h3>
            <DeleteMenuItemButton menuItemId={menuItem.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
