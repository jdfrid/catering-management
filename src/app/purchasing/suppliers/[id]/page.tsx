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
    include: { _count: { select: { purchaseOrders: true } } },
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

        {supplier._count.purchaseOrders === 0 ? (
          <div className="rounded-[2rem] border border-red-100 bg-red-50/50 p-6">
            <DeleteSupplierButton supplierId={supplier.id} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
