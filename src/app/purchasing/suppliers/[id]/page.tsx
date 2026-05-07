import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SupplierForm } from "@/components/SupplierForm";
import { DeleteSupplierButton } from "@/components/DeleteSupplierButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deleteBlocked?: string }>;
};

export default async function SupplierDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { deleteBlocked } = await searchParams;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      _count: { select: { purchaseOrders: true } },
      prices: {
        orderBy: { ingredient: { name: "asc" } },
        include: { ingredient: { select: { id: true, name: true } } },
      },
    },
  });
  if (!supplier) notFound();

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{supplier.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {supplier._count.purchaseOrders} הזמנות רכש
            </p>
          </div>
          <Link
            href="/purchasing/suppliers"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            חזרה לרשימה
          </Link>
        </div>

        {deleteBlocked ? (
          <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            לא ניתן למחוק ספק שיש לו הזמנות רכש. ניתן לסמן כלא פעיל.
          </p>
        ) : null}

        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <SupplierForm supplier={supplier} />
        </div>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">מחירון</h2>
            <Link
              href={`/purchasing/prices/new?supplierId=${supplier.id}`}
              className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              הוספת מחיר
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-right text-sm">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="px-2 py-2 font-semibold">חומר גלם</th>
                  <th className="px-2 py-2 font-semibold">מחיר</th>
                  <th className="px-2 py-2 font-semibold">יחידה</th>
                  <th className="px-2 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {supplier.prices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-6 text-slate-500">
                      אין מחירים — הוסיפו ממחירון הרכש.
                    </td>
                  </tr>
                ) : (
                  supplier.prices.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="px-2 py-2">{p.ingredient.name}</td>
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

        {supplier._count.purchaseOrders === 0 ? (
          <div className="rounded-[2rem] border border-red-100 bg-red-50/50 p-6">
            <DeleteSupplierButton supplierId={supplier.id} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
