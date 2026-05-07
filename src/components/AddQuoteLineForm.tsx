"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { MenuItem } from "@prisma/client";
import { addQuoteLine } from "@/app/quotes/actions";
import { fieldError } from "@/lib/forms";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "מוסיף…" : children}</>;
}

export function AddQuoteLineForm({
  quoteId,
  menuItems,
  disabled,
}: {
  quoteId: string;
  menuItems: MenuItem[];
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(addQuoteLine, null);

  if (menuItems.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        אין מנות בקטלוג.{" "}
        <Link className="font-bold text-amber-900 underline" href="/menu/new">
          הוסף מנה
        </Link>
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-12">
      <input type="hidden" name="quoteId" value={quoteId} />

      {state?.message && !state.ok ? (
        <p className="sm:col-span-12 rounded-2xl bg-red-50 p-3 text-sm text-red-800">{state.message}</p>
      ) : null}
      {state?.ok && state.message ? (
        <p className="sm:col-span-12 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900">
          {state.message}
        </p>
      ) : null}

      <div className="sm:col-span-5">
        <label className="mb-1 block text-sm font-semibold" htmlFor="menuItemId">
          מנה
        </label>
        <select
          id="menuItemId"
          name="menuItemId"
          required
          disabled={disabled}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none disabled:bg-slate-100"
        >
          {menuItems.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} —{" "}
              {m.suggestedPrice != null
                ? `₪${Number(m.suggestedPrice).toFixed(2)}`
                : "ללא מחיר"}
            </option>
          ))}
        </select>
        {fieldError(state, "menuItemId") ? (
          <p className="mt-1 text-sm text-red-600">{fieldError(state, "menuItemId")}</p>
        ) : null}
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-semibold" htmlFor="quantity">
          כמות
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          step="0.001"
          min="0.001"
          required
          disabled={disabled}
          defaultValue={1}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-base outline-none disabled:bg-slate-100"
        />
        {fieldError(state, "quantity") ? (
          <p className="mt-1 text-sm text-red-600">{fieldError(state, "quantity")}</p>
        ) : null}
      </div>
      <div className="sm:col-span-3">
        <label className="mb-1 block text-sm font-semibold" htmlFor="unitPrice">
          מחיר ליחידה (₪)
        </label>
        <input
          id="unitPrice"
          name="unitPrice"
          type="text"
          inputMode="decimal"
          dir="ltr"
          required
          disabled={disabled}
          defaultValue={
            menuItems[0]?.suggestedPrice != null
              ? Number(menuItems[0].suggestedPrice).toFixed(2)
              : ""
          }
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-base outline-none disabled:bg-slate-100"
        />
        {fieldError(state, "unitPrice") ? (
          <p className="mt-1 text-sm text-red-600">{fieldError(state, "unitPrice")}</p>
        ) : null}
      </div>
      <div className="flex items-end sm:col-span-2">
        <button
          type="submit"
          disabled={disabled}
          className="min-h-12 w-full rounded-2xl bg-amber-400 px-4 font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
        >
          <SubmitLabel>הוסף</SubmitLabel>
        </button>
      </div>
    </form>
  );
}
