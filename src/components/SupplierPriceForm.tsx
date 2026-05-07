"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { SupplierPrice } from "@prisma/client";
import {
  upsertSupplierPrice,
  updateSupplierPrice,
} from "@/app/purchasing/prices/actions";
import { fieldError } from "@/lib/forms";
import { SALE_UNITS } from "@/lib/constants";
import { toDateInputValue } from "@/lib/date-input";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "שומר…" : children}</>;
}

type SelectRow = { id: string; name: string };

type Props = {
  suppliers: SelectRow[];
  ingredients: SelectRow[];
  priceRow?: SupplierPrice;
  defaultSupplierId?: string;
  defaultIngredientId?: string;
  cancelHref?: string;
};

export function SupplierPriceForm({
  suppliers,
  ingredients,
  priceRow,
  defaultSupplierId,
  defaultIngredientId,
  cancelHref = "/purchasing/prices",
}: Props) {
  const isEditMode = Boolean(priceRow?.id);
  const action = isEditMode ? updateSupplierPrice : upsertSupplierPrice;
  const [state, formAction] = useActionState(action, null);

  const supplierDefault =
    priceRow?.supplierId ?? defaultSupplierId ?? suppliers[0]?.id ?? "";
  const ingredientDefault =
    priceRow?.ingredientId ?? defaultIngredientId ?? ingredients[0]?.id ?? "";

  return (
    <form action={formAction} className="space-y-6">
      {isEditMode ? (
        <input type="hidden" name="id" value={priceRow!.id} />
      ) : null}

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
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="supplierId"
          >
            ספק *
          </label>
          <select
            id="supplierId"
            name="supplierId"
            required
            defaultValue={supplierDefault}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {suppliers.map((s) => (
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
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="ingredientId"
          >
            חומר גלם *
          </label>
          <select
            id="ingredientId"
            name="ingredientId"
            required
            defaultValue={ingredientDefault}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {ingredients.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          {fieldError(state, "ingredientId") ? (
            <p className="mt-1 text-sm text-red-600">
              {fieldError(state, "ingredientId")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="price">
            מחיר ליחידה (₪) *
          </label>
          <input
            id="price"
            name="price"
            inputMode="decimal"
            required
            defaultValue={priceRow?.price != null ? priceRow.price.toString() : ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
            dir="ltr"
          />
          {fieldError(state, "price") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "price")}</p>
          ) : null}
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="priceUnit"
          >
            יחידת מחירון *
          </label>
          <select
            id="priceUnit"
            name="priceUnit"
            required
            defaultValue={priceRow?.priceUnit ?? SALE_UNITS[0]}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {SALE_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            חייבת להתאים ליחידה בשורת המתכון (למשל ק״ג אם המתכון בק״ג).
          </p>
          {fieldError(state, "priceUnit") ? (
            <p className="mt-1 text-sm text-red-600">
              {fieldError(state, "priceUnit")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="validFrom"
          >
            תקף מ־
          </label>
          <input
            id="validFrom"
            name="validFrom"
            type="date"
            defaultValue={toDateInputValue(priceRow?.validFrom ?? undefined)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="validTo">
            תקף עד
          </label>
          <input
            id="validTo"
            name="validTo"
            type="date"
            defaultValue={toDateInputValue(priceRow?.validTo ?? undefined)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "validTo") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "validTo")}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="notes">
          הערות
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={priceRow?.notes ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {fieldError(state, "_form") ? (
        <p className="text-sm text-red-600">{fieldError(state, "_form")}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
        >
          <SubmitLabel>{isEditMode ? "עדכון" : "שמירה"}</SubmitLabel>
        </button>
        <Link
          href={cancelHref}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-6 font-semibold hover:bg-white"
        >
          ביטול
        </Link>
      </div>
    </form>
  );
}
