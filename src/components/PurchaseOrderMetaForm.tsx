"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { PurchaseOrderStatus } from "@prisma/client";
import { updatePurchaseOrderMeta } from "@/app/purchasing/orders/actions";
import {
  PURCHASE_ORDER_STATUS_LABELS,
} from "@/lib/constants";
import { fieldError } from "@/lib/forms";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "שומר…" : children}</>;
}

type Props = {
  purchaseOrderId: string;
  status: PurchaseOrderStatus;
  requestedDeliveryDate: Date | null;
  notes: string | null;
};

function formatLocalDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const statuses = Object.values(PurchaseOrderStatus);

export function PurchaseOrderMetaForm({
  purchaseOrderId,
  status,
  requestedDeliveryDate,
  notes,
}: Props) {
  const [state, formAction] = useActionState(updatePurchaseOrderMeta, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={purchaseOrderId} />

      {state?.message && !state.ok ? (
        <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">
          {state.message}
        </p>
      ) : null}
      {state?.ok && state.message ? (
        <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900 ring-1 ring-emerald-200">
          {state.message}
        </p>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="status">
          סטטוס
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {PURCHASE_ORDER_STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
        {fieldError(state, "status") ? (
          <p className="mt-1 text-sm text-red-600">{fieldError(state, "status")}</p>
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
          defaultValue={
            requestedDeliveryDate
              ? formatLocalDate(new Date(requestedDeliveryDate))
              : ""
          }
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
          defaultValue={notes ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
      >
        <SubmitLabel>שמירת פרטי הזמנה</SubmitLabel>
      </button>
    </form>
  );
}
