"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Ingredient, Supplier } from "@prisma/client";
import {
  createIngredient,
  updateIngredient,
} from "@/app/menu/ingredients/actions";
import { fieldError } from "@/lib/forms";
import { INGREDIENT_TYPES, SALE_UNITS } from "@/lib/constants";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "שומר…" : children}</>;
}

type Props = {
  ingredient?: Ingredient;
  suppliers: Pick<Supplier, "id" | "name">[];
};

export function IngredientForm({ ingredient, suppliers }: Props) {
  const isEdit = Boolean(ingredient);
  const action = isEdit ? updateIngredient : createIngredient;
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={ingredient!.id} /> : null}

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
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-semibold" htmlFor="name">
            שם חומר גלם *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={ingredient?.name ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "name") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "name")}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="type">
            סוג *
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={ingredient?.type ?? INGREDIENT_TYPES[0]}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {INGREDIENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="unit">
            יחידת עבודה *
          </label>
          <select
            id="unit"
            name="unit"
            required
            defaultValue={ingredient?.unit ?? SALE_UNITS[2]}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {SALE_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-semibold"
          htmlFor="preferredSupplierId"
        >
          ספק מועדף (אופציונלי)
        </label>
        <select
          id="preferredSupplierId"
          name="preferredSupplierId"
          defaultValue={ingredient?.preferredSupplierId ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="">—</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {fieldError(state, "preferredSupplierId") ? (
          <p className="mt-1 text-sm text-red-600">
            {fieldError(state, "preferredSupplierId")}
          </p>
        ) : null}
      </div>

      {isEdit ? (
        <div className="flex items-center gap-3">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={ingredient!.active}
            className="h-5 w-5 rounded border-slate-400"
          />
          <label htmlFor="active" className="text-sm font-semibold">
            חומר פעיל (מופיע בבחירה למתכונים)
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
        >
          <SubmitLabel>{isEdit ? "עדכון" : "יצירה"}</SubmitLabel>
        </button>
        <Link
          href="/menu/ingredients"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-6 font-semibold hover:bg-white"
        >
          ביטול
        </Link>
      </div>
    </form>
  );
}
