import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { IngredientForm } from "@/components/IngredientForm";

export const dynamic = "force-dynamic";

export default async function NewIngredientPage() {
  const suppliers = await prisma.supplier.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">חומר גלם חדש</h1>
          <Link
            href="/menu/ingredients"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            חזרה
          </Link>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <IngredientForm suppliers={suppliers} />
        </div>
      </div>
    </main>
  );
}
