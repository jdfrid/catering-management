import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { IngredientForm } from "@/components/IngredientForm";
import { DeleteIngredientButton } from "@/components/DeleteIngredientButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deleteBlocked?: string }>;
};

export default async function IngredientDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { deleteBlocked } = await searchParams;

  const [ingredient, suppliers, useCount, supplierPrices] = await Promise.all([
    prisma.ingredient.findUnique({ where: { id } }),
    prisma.supplier.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.recipeComponent.count({ where: { ingredientId: id } }),
    prisma.supplierPrice.findMany({
      where: { ingredientId: id },
      orderBy: { supplier: { name: "asc" } },
      include: { supplier: { select: { id: true, name: true, active: true } } },
    }),
  ]);

  if (!ingredient) notFound();

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">{ingredient.name}</h1>
          <Link
            href="/menu/ingredients"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            חזרה
          </Link>
        </div>

        {deleteBlocked ? (
          <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            לא ניתן למחוק חומר שמופיע במתכונים ({useCount} שורות). הסירו אותו
            מהמתכונים תחילה.
          </p>
        ) : null}

        <p className="text-sm text-slate-600">
          מופיע ב־<strong>{useCount}</strong> שורות מתכון.
        </p>

        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <IngredientForm ingredient={ingredient} suppliers={suppliers} />
        </div>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">מחירי ספקים</h2>
            <Link
              href={`/purchasing/prices/new?ingredientId=${ingredient.id}`}
              className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              הוספת מחיר
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-right text-sm">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="px-2 py-2 font-semibold">ספק</th>
                  <th className="px-2 py-2 font-semibold">מחיר</th>
                  <th className="px-2 py-2 font-semibold">יחידה</th>
                  <th className="px-2 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {supplierPrices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-6 text-slate-500">
                      אין מחירים במחירון.
                    </td>
                  </tr>
                ) : (
                  supplierPrices.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="px-2 py-2">
                        {p.supplier.name}
                        {!p.supplier.active ? (
                          <span className="mr-1 text-xs text-slate-500">
                            (לא פעיל)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-2 py-2 font-mono" dir="ltr">
                        ₪{Number(p.price).toFixed(2)}
                      </td>
                      <td className="px-2 py-2">{p.priceUnit}</td>
                      <td className="px-2 py-2">
                        <Link
                          href={`/purchasing/prices/${p.id}`}
                          className="font-semibold text-amber-900 hover:underline"
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
        </section>

        {useCount === 0 ? (
          <div className="rounded-[2rem] border border-red-100 bg-red-50/50 p-6">
            <DeleteIngredientButton id={ingredient.id} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
