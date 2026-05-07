import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuItemForm } from "@/components/MenuItemForm";
import { DeleteMenuItemButton } from "@/components/DeleteMenuItemButton";
import { AddRecipeComponentForm } from "@/components/AddRecipeComponentForm";
import { RemoveRecipeComponentButton } from "@/components/RemoveRecipeComponentButton";
import { decimalToNumber } from "@/lib/money";

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

  let recipe = await prisma.recipe.findFirst({
    where: { menuItemId: id, active: true },
    orderBy: { version: "desc" },
    include: {
      components: {
        orderBy: { id: "asc" },
        include: { ingredient: true },
      },
    },
  });

  if (!recipe) {
    recipe = await prisma.recipe.create({
      data: {
        menuItemId: id,
        version: 1,
        active: true,
        baseQuantity: menuItem.baseRecipeQuantity,
      },
      include: {
        components: {
          orderBy: { id: "asc" },
          include: { ingredient: true },
        },
      },
    });
  }

  const ingredients = await prisma.ingredient.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, type: true, unit: true },
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">עריכת מנה: {menuItem.name}</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/menu/ingredients"
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white"
            >
              חומרי גלם
            </Link>
            <Link
              href="/menu"
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-white"
            >
              חזרה
            </Link>
          </div>
        </div>

        {deleteBlocked ? (
          <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            לא ניתן למחוק מנה שמופיעה בהצעות מחיר קיימות.
          </p>
        ) : null}

        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-6 text-xl font-bold">פרטי מנה</h2>
          <MenuItemForm menuItem={menuItem} />
          <div className="mt-10 border-t border-slate-200 pt-8">
            <h3 className="mb-3 text-sm font-semibold text-slate-500">מסוכן</h3>
            <DeleteMenuItemButton menuItemId={menuItem.id} />
          </div>
        </div>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold">עץ מוצר — פירוק למתכון</h2>
          <p className="mt-2 text-sm text-slate-600">
            הכמויות כאן מחושבות לֿ<strong>כמות בסיס</strong> של המנה (
            <span dir="ltr">{decimalToNumber(menuItem.baseRecipeQuantity)}</span>{" "}
            {menuItem.saleUnit}). עדכון כמות הבסיס בפרטי המנה מסנכרן גם את בסיס
            המתכון.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            מתכון פעיל גרסה {recipe.version} · בסיס מתכון:{" "}
            <span dir="ltr">{decimalToNumber(recipe.baseQuantity)}</span>
          </p>

          <div className="mt-6">
            <AddRecipeComponentForm
              recipeId={recipe.id}
              menuItemId={menuItem.id}
              ingredients={ingredients}
            />
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="px-2 py-2 font-semibold">רכיב</th>
                  <th className="px-2 py-2 font-semibold">כמות</th>
                  <th className="px-2 py-2 font-semibold">יחידה</th>
                  <th className="px-2 py-2 font-semibold">פחת %</th>
                  <th className="px-2 py-2 font-semibold">הערה</th>
                  <th className="px-2 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {recipe.components.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-2 py-2">
                      {row.ingredient.name}
                      <span className="mr-1 text-xs text-slate-500">
                        ({row.ingredient.type})
                      </span>
                    </td>
                    <td className="px-2 py-2" dir="ltr">
                      {decimalToNumber(row.quantity)}
                    </td>
                    <td className="px-2 py-2">{row.unit}</td>
                    <td className="px-2 py-2" dir="ltr">
                      {decimalToNumber(row.wastePercent)}
                    </td>
                    <td className="px-2 py-2 text-slate-600">{row.notes ?? "—"}</td>
                    <td className="px-2 py-2">
                      <RemoveRecipeComponentButton
                        componentId={row.id}
                        menuItemId={menuItem.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recipe.components.length === 0 ? (
              <p className="mt-4 text-center text-slate-500">
                אין עדיין רכיבים במתכון. הוסיפו חומרי גלם מהרשימה.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
