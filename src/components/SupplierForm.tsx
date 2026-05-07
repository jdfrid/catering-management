"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Supplier } from "@prisma/client";
import {
  createSupplier,
  updateSupplier,
} from "@/app/purchasing/suppliers/actions";
import { fieldError } from "@/lib/forms";
import { SUPPLIER_CATEGORIES } from "@/lib/constants";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "שומר…" : children}</>;
}

type Props = {
  supplier?: Supplier;
};

export function SupplierForm({ supplier }: Props) {
  const isEdit = Boolean(supplier);
  const action = isEdit ? updateSupplier : createSupplier;
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={supplier!.id} /> : null}

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
            שם ספק *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={supplier?.name ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none ring-slate-400 focus:ring-2"
          />
          {fieldError(state, "name") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "name")}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="category">
            קטגוריה *
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={supplier?.category ?? SUPPLIER_CATEGORIES[0]}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {SUPPLIER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {fieldError(state, "category") ? (
            <p className="mt-1 text-sm text-red-600">
              {fieldError(state, "category")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="contactName"
          >
            איש קשר
          </label>
          <input
            id="contactName"
            name="contactName"
            defaultValue={supplier?.contactName ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="phone">
            טלפון
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={supplier?.phone ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="email">
            אימייל
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={supplier?.email ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "email") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "email")}</p>
          ) : null}
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="deliveryDays"
          >
            ימי אספקה
          </label>
          <input
            id="deliveryDays"
            name="deliveryDays"
            defaultValue={supplier?.deliveryDays ?? ""}
            placeholder="לדוגמה: א׳–ה׳"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-semibold"
          htmlFor="minOrderAmount"
        >
          מינ׳ם הזמנה (₪)
        </label>
        <input
          id="minOrderAmount"
          name="minOrderAmount"
          inputMode="decimal"
          defaultValue={
            supplier?.minOrderAmount !== undefined && supplier.minOrderAmount !== null
              ? supplier.minOrderAmount.toString()
              : ""
          }
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
        {fieldError(state, "minOrderAmount") ? (
          <p className="mt-1 text-sm text-red-600">
            {fieldError(state, "minOrderAmount")}
          </p>
        ) : null}
      </div>

      {isEdit ? (
        <div className="flex items-center gap-3">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={supplier!.active}
            className="h-5 w-5 rounded border-slate-400"
          />
          <label htmlFor="active" className="text-sm font-semibold">
            ספק פעיל
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
        >
          <SubmitLabel>{isEdit ? "עדכון" : "יצירת ספק"}</SubmitLabel>
        </button>
        <Link
          href="/purchasing/suppliers"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-6 font-semibold hover:bg-white"
        >
          ביטול
        </Link>
      </div>
    </form>
  );
}
