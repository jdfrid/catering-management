"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  createCustomer,
  updateCustomer,
} from "@/app/customers/actions";
import type { Customer } from "@prisma/client";
import { fieldError } from "@/lib/forms";
import { CUSTOMER_TYPES } from "@/lib/constants";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "שומר…" : children}</>;
}

type Props = {
  customer?: Customer;
};

export function CustomerForm({ customer }: Props) {
  const isEdit = Boolean(customer);
  const action = isEdit ? updateCustomer : createCustomer;
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={customer!.id} /> : null}

      {state?.message && !state.ok ? (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
          {state.message}
        </p>
      ) : null}
      {state?.ok && state.message ? (
        <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="name">
            שם לקוח *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={customer?.name ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none ring-slate-400 focus:ring-2"
          />
          {fieldError(state, "name") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "name")}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="type">
            סוג לקוח *
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={customer?.type ?? "פרטי"}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {CUSTOMER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {fieldError(state, "type") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "type")}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="phone">
            טלפון *
          </label>
          <input
            id="phone"
            name="phone"
            required
            dir="ltr"
            defaultValue={customer?.phone ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "phone") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "phone")}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="email">
            דוא״ל
          </label>
          <input
            id="email"
            name="email"
            type="email"
            dir="ltr"
            defaultValue={customer?.email ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "email") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "email")}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="address">
          כתובת
        </label>
        <input
          id="address"
          name="address"
          defaultValue={customer?.address ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="taxId">
          ח.פ / עוסק
        </label>
        <input
          id="taxId"
          name="taxId"
          dir="ltr"
          defaultValue={customer?.taxId ?? ""}
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
          rows={4}
          defaultValue={customer?.notes ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {isEdit ? (
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="active"
            value="true"
            defaultChecked={customer!.active}
            className="size-4 rounded border-slate-300"
          />
          לקוח פעיל
        </label>
      ) : null}

      {fieldError(state, "_form") ? (
        <p className="text-sm text-red-600">{fieldError(state, "_form")}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          <SubmitLabel>{isEdit ? "עדכון לקוח" : "שמירת לקוח חדש"}</SubmitLabel>
        </button>
        <Link
          href="/customers"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-6 font-semibold text-slate-800 hover:bg-slate-100"
        >
          ביטול
        </Link>
      </div>
    </form>
  );
}
