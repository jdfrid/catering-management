"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Event, Supplier } from "@prisma/client";
import { createPurchaseOrder } from "@/app/purchasing/orders/actions";
import { fieldError } from "@/lib/forms";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "יוצר…" : children}</>;
}

type Props = {
  suppliers: Pick<Supplier, "id" | "name" | "active">[];
  events: (Pick<Event, "id" | "name" | "type" | "date"> & {
    customer: { name: string };
  })[];
  defaultSupplierId?: string;
  defaultEventId?: string;
};

function formatLocalDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function NewPurchaseOrderForm({
  suppliers,
  events,
  defaultSupplierId,
  defaultEventId,
}: Props) {
  const [state, formAction] = useActionState(createPurchaseOrder, null);
  const activeSuppliers = suppliers.filter((s) => s.active);

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && !state.ok ? (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
          {state.message}
        </p>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="supplierId">
          ספק *
        </label>
        <select
          id="supplierId"
          name="supplierId"
          required
          defaultValue={
            defaultSupplierId && activeSuppliers.some((s) => s.id === defaultSupplierId)
              ? defaultSupplierId
              : activeSuppliers[0]?.id ?? ""
          }
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        >
          {activeSuppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {fieldError(state, "supplierId") ? (
          <p className="mt-1 text-sm text-red-600">
            {fieldError(state, "supplierId")}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="eventId">
          קישור לאירוע (אופציונלי)
        </label>
        <select
          id="eventId"
          name="eventId"
          defaultValue={defaultEventId ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="">ללא אירוע</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.customer.name} · {ev.name ?? ev.type} ·{" "}
              {formatLocalDate(new Date(ev.date))}
            </option>
          ))}
        </select>
        {fieldError(state, "eventId") ? (
          <p className="mt-1 text-sm text-red-600">{fieldError(state, "eventId")}</p>
        ) : null}
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-semibold"
          htmlFor="requestedDeliveryDate"
        >
          תאריך אספקה מבוקש
        </label>
        <input
          id="requestedDeliveryDate"
          name="requestedDeliveryDate"
          type="date"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="notes">
          הערות
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
        >
          <SubmitLabel>צור הזמנת רכש</SubmitLabel>
        </button>
        <Link
          href="/purchasing/orders"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-6 font-semibold hover:bg-white"
        >
          ביטול
        </Link>
      </div>
    </form>
  );
}
