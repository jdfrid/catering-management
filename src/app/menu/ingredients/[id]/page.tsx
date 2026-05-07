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

  const [ingredient, suppliers, useCount] = await Promise.all([
    prisma.ingredient.findUnique({ where: { id } }),
    prisma.supplier.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.recipeComponent.count({ where: { ingredientId: id } }),
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

        {useCount === 0 ? (
          <div className="rounded-[2rem] border border-red-100 bg-red-50/50 p-6">
            <DeleteIngredientButton id={ingredient.id} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
