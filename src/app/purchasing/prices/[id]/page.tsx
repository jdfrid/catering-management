import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SupplierPriceForm } from "@/components/SupplierPriceForm";
import { DeleteSupplierPriceButton } from "@/components/DeleteSupplierPriceButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditSupplierPricePage({ params }: Props) {
  const { id } = await params;

  const [priceFull, suppliers, ingredients] = await Promise.all([
    prisma.supplierPrice.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true, active: true } },
        ingredient: { select: { id: true, name: true, active: true } },
      },
    }),
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

  if (!priceFull) notFound();

  const { supplier, ingredient, ...priceRow } = priceFull;

  const supplierOptions = suppliers.some((s) => s.id === priceRow.supplierId)
    ? suppliers
    : [
        ...suppliers,
        {
          id: priceRow.supplierId,
          name: `${supplier.name}${supplier.active ? "" : " (לא פעיל)"}`,
        },
      ].sort((a, b) => a.name.localeCompare(b.name, "he"));

  const ingredientOptions = ingredients.some(
    (i) => i.id === priceRow.ingredientId,
  )
    ? ingredients
    : [
        ...ingredients,
        {
          id: priceRow.ingredientId,
          name: `${ingredient.name}${ingredient.active ? "" : " (לא פעיל)"}`,
        },
      ].sort((a, b) => a.name.localeCompare(b.name, "he"));

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">עריכת מחיר ספק</h1>
          <Link
            href="/purchasing/prices"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            חזרה
          </Link>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <SupplierPriceForm
            suppliers={supplierOptions}
            ingredients={ingredientOptions}
            priceRow={priceRow}
          />
          <div className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="mb-3 text-sm font-semibold text-slate-500">מחיקה</h2>
            <DeleteSupplierPriceButton id={priceRow.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
