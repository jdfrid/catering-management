"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addPurchaseOrderLine } from "@/app/purchasing/orders/actions";
import { fieldError } from "@/lib/forms";
import { SALE_UNITS } from "@/lib/constants";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "מוסיף…" : children}</>;
}

export function AddPurchaseOrderLineForm({
  purchaseOrderId,
}: {
  purchaseOrderId: string;
}) {
  const [state, formAction] = useActionState(addPurchaseOrderLine, null);

  return (
    <form action={formAction} className="grid gap-3 rounded-2xl border border-dashed border-slate-300 p-4 sm:grid-cols-2 lg:grid-cols-6">
      <input type="hidden" name="purchaseOrderId" value={purchaseOrderId} />

      {state?.message && !state.ok ? (
        <p className="sm:col-span-2 lg:col-span-6 rounded-xl bg-red-50 p-2 text-sm text-red-800">
          {state.message}
        </p>
      ) : null}
      {state?.ok && state.message ? (
        <p className="sm:col-span-2 lg:col-span-6 rounded-xl bg-emerald-50 p-2 text-sm text-emerald-900">
          {state.message}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-semibold" htmlFor="ingredientName">
          תיאור *
        </label>
        <input
          id="ingredientName"
          name="ingredientName"
          required
          placeholder="לדוגמה: חלב 3%"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
        />
        {fieldError(state, "ingredientName") ? (
          <p className="mt-1 text-xs text-red-600">
            {fieldError(state, "ingredientName")}
          </p>
        ) : null}
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold" htmlFor="quantity">
          כמות *
        </label>
        <input
          id="quantity"
          name="quantity"
          required
          inputMode="decimal"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
        />
        {fieldError(state, "quantity") ? (
          <p className="mt-1 text-xs text-red-600">{fieldError(state, "quantity")}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold" htmlFor="unit">
          יחידה *
        </label>
        <select
          id="unit"
          name="unit"
          required
          defaultValue={SALE_UNITS[2]}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
        >
          {SALE_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold" htmlFor="estimatedPrice">
          סכום ₪ *
        </label>
        <input
          id="estimatedPrice"
          name="estimatedPrice"
          required
          inputMode="decimal"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
        />
        {fieldError(state, "estimatedPrice") ? (
          <p className="mt-1 text-xs text-red-600">
            {fieldError(state, "estimatedPrice")}
          </p>
        ) : null}
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300"
        >
          <SubmitLabel>הוסף שורה</SubmitLabel>
        </button>
      </div>
    </form>
  );
}
