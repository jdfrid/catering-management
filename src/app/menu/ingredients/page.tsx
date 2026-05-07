import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function IngredientsListPage() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: {
      preferredSupplier: { select: { name: true } },
      _count: { select: { recipeComponents: true } },
    },
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">חומרי גלם — עץ מוצר</h1>
            <p className="mt-1 text-slate-600">
              רכיבים שמופיעים בפירוק מנות (מתכונים).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/menu"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-50"
            >
              מנות
            </Link>
            <Link
              href="/menu/ingredients/new"
              className="rounded-2xl bg-slate-950 px-4 py-2 font-bold text-white hover:bg-slate-800"
            >
              + חומר גלם
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-right">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
                <th className="p-4 font-semibold">שם</th>
                <th className="p-4 font-semibold">סוג</th>
                <th className="p-4 font-semibold">יחידה</th>
                <th className="p-4 font-semibold">ספק מועדף</th>
                <th className="p-4 font-semibold">שימוש במתכונים</th>
                <th className="p-4 font-semibold">פעיל</th>
                <th className="p-4 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    אין חומרי גלם.{" "}
                    <Link
                      href="/menu/ingredients/new"
                      className="font-semibold text-amber-800 underline"
                    >
                      צרו ראשון
                    </Link>
                  </td>
                </tr>
              ) : (
                ingredients.map((ing) => (
                  <tr key={ing.id} className="border-b border-slate-100 hover:bg-amber-50/40">
                    <td className="p-4 font-medium">{ing.name}</td>
                    <td className="p-4 text-slate-700">{ing.type}</td>
                    <td className="p-4">{ing.unit}</td>
                    <td className="p-4 text-sm text-slate-600">
                      {ing.preferredSupplier?.name ?? "—"}
                    </td>
                    <td className="p-4">{ing._count.recipeComponents}</td>
                    <td className="p-4">
                      {ing.active ? (
                        <span className="text-xs font-bold text-emerald-700">כן</span>
                      ) : (
                        <span className="text-xs text-slate-500">לא</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/menu/ingredients/${ing.id}`}
                        className="font-bold text-amber-900 underline-offset-2 hover:underline"
                      >
                        עריכה
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
