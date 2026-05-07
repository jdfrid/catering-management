"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Quote } from "@prisma/client";
import { QuoteStatus } from "@prisma/client";
import { updateQuoteMeta } from "@/app/quotes/actions";
import { fieldError } from "@/lib/forms";
import { QUOTE_STATUS_LABELS } from "@/lib/constants";

function formatLocalDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "שומר…" : children}</>;
}

const statuses = Object.values(QuoteStatus);

export function QuoteMetaForm({ quote }: { quote: Quote }) {
  const readOnly = quote.status === QuoteStatus.APPROVED;
  const [state, formAction] = useActionState(updateQuoteMeta, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={quote.id} />

      {readOnly ? (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-200">
          הצעה מאושרת — אין עריכה כדי לשמור על נעילה (MVP). צור גרסה חדשה בהמשך.
        </p>
      ) : null}

      {state?.message && !state.ok ? (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">{state.message}</p>
      ) : null}
      {state?.ok && state.message ? (
        <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">{state.message}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="status">
            סטטוס הצעה
          </label>
          <select
            id="status"
            name="status"
            disabled={readOnly}
            defaultValue={quote.status}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none disabled:bg-slate-100"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {QUOTE_STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="validUntil">
            תוקף הצעה
          </label>
          <input
            id="validUntil"
            name="validUntil"
            type="date"
            disabled={readOnly}
            defaultValue={quote.validUntil ? formatLocalDate(quote.validUntil) : ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none disabled:bg-slate-100"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="discount">
            הנחה (₪ לפני מע״מ)
          </label>
          <input
            id="discount"
            name="discount"
            type="text"
            inputMode="decimal"
            dir="ltr"
            disabled={readOnly}
            defaultValue={Number(quote.discount).toString()}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-base outline-none disabled:bg-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="internalCost">
            עלות פנימית משוערת (₪ לפני מע״מ)
          </label>
          <input
            id="internalCost"
            name="internalCost"
            type="text"
            inputMode="decimal"
            dir="ltr"
            disabled={readOnly}
            defaultValue={Number(quote.internalCost).toString()}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-base outline-none disabled:bg-slate-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            יוזנה ידנית עד שעץ המוצר יחשב אוטומטית.
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="paymentTerms">
          תנאי תשלום
        </label>
        <input
          id="paymentTerms"
          name="paymentTerms"
          disabled={readOnly}
          defaultValue={quote.paymentTerms ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none disabled:bg-slate-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="customerNotes">
          הערות ללקוח
        </label>
        <textarea
          id="customerNotes"
          name="customerNotes"
          rows={3}
          disabled={readOnly}
          defaultValue={quote.customerNotes ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none disabled:bg-slate-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="internalNotes">
          הערות פנימיות
        </label>
        <textarea
          id="internalNotes"
          name="internalNotes"
          rows={3}
          disabled={readOnly}
          defaultValue={quote.internalNotes ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none disabled:bg-slate-100"
        />
      </div>

      {fieldError(state, "_form") ? (
        <p className="text-sm text-red-600">{fieldError(state, "_form")}</p>
      ) : null}

      {!readOnly ? (
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          <SubmitLabel>שמירת פרטי הצעה</SubmitLabel>
        </button>
      ) : null}
    </form>
  );
}
