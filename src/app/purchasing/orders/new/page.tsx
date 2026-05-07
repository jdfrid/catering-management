import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewPurchaseOrderForm } from "@/components/NewPurchaseOrderForm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ supplierId?: string; eventId?: string }>;
};

export default async function NewPurchaseOrderPage({ searchParams }: Props) {
  const { supplierId, eventId } = await searchParams;

  const [suppliers, events] = await Promise.all([
    prisma.supplier.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, active: true },
    }),
    prisma.event.findMany({
      orderBy: { date: "desc" },
      take: 400,
      include: { customer: { select: { name: true } } },
    }),
  ]);

  const activeSuppliers = suppliers.filter((s) => s.active);

  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">הזמנת רכש חדשה</h1>
          <Link
            href="/purchasing/orders"
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold hover:bg-white"
          >
            חזרה
          </Link>
        </div>

        {activeSuppliers.length === 0 ? (
          <div className="rounded-[2rem] bg-amber-50 p-6 text-amber-950 ring-1 ring-amber-200">
            <p className="font-semibold">יש ליצור ספק פעיל לפני הזמנת רכש.</p>
            <Link
              href="/purchasing/suppliers/new"
              className="mt-3 inline-block font-bold text-amber-900 underline"
            >
              ליצירת ספק
            </Link>
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <NewPurchaseOrderForm
              suppliers={suppliers}
              events={events}
              defaultSupplierId={supplierId}
              defaultEventId={eventId}
            />
          </div>
        )}
      </div>
    </main>
  );
}
