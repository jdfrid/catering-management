import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SupplierPriceForm } from "@/components/SupplierPriceForm";
import { moduleMetadata } from "@/components/ModulePlaceholder";

export const metadata = moduleMetadata(
  "מחיר ספק חדש",
  "הוספת מחיר רכש לפי ספק, חומר גלם ויחידה.",
);

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ supplierId?: string; ingredientId?: string }>;
};

export default async function NewSupplierPricePage({ searchParams }: Props) {
  const { supplierId, ingredientId } = await searchParams;

  const [suppliers, ingredients] = await Promise.all([
    prisma.supplier.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.ingredient.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">מחיר ספק חדש</h1>
          <Link
            href="/purchasing/prices"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            חזרה למחירון
          </Link>
        </div>

        {suppliers.length === 0 || ingredients.length === 0 ? (
          <p className="rounded-[2rem] bg-amber-50 p-6 text-sm text-amber-950 ring-1 ring-amber-200">
            יש להגדיר ספקים וחומרי גלם פעילים לפני הוספת מחירון.
          </p>
        ) : (
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <SupplierPriceForm
              suppliers={suppliers}
              ingredients={ingredients}
              defaultSupplierId={supplierId}
              defaultIngredientId={ingredientId}
            />
          </div>
        )}
      </div>
    </main>
  );
}
