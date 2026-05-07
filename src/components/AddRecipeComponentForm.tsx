"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Ingredient } from "@prisma/client";
import { addRecipeComponent } from "@/app/menu/recipe-actions";
import { fieldError } from "@/lib/forms";
import { SALE_UNITS } from "@/lib/constants";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "מוסיף…" : children}</>;
}

type Props = {
  recipeId: string;
  menuItemId: string;
  ingredients: Pick<Ingredient, "id" | "name" | "type" | "unit">[];
};

export function AddRecipeComponentForm({
  recipeId,
  menuItemId,
  ingredients,
}: Props) {
  const [state, formAction] = useActionState(addRecipeComponent, null);

  if (ingredients.length === 0) {
    return (
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-200">
        אין חומרי גלם פעילים.{" "}
        <Link href="/menu/ingredients/new" className="font-bold underline">
          צרו חומר גלם
        </Link>{" "}
        לפני הוספה למתכון.
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-3 rounded-2xl border border-dashed border-slate-300 p-4 sm:grid-cols-2 lg:grid-cols-6">
      <input type="hidden" name="recipeId" value={recipeId} />
      <input type="hidden" name="menuItemId" value={menuItemId} />

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
        <label className="mb-1 block text-xs font-semibold" htmlFor="ingredientId">
          חומר גלם *
        </label>
        <select
          id="ingredientId"
          name="ingredientId"
          required
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
        >
          {ingredients.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} ({i.type}) · יח׳ ברירה {i.unit}
            </option>
          ))}
        </select>
        {fieldError(state, "ingredientId") ? (
          <p className="mt-1 text-xs text-red-600">{fieldError(state, "ingredientId")}</p>
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
          placeholder="לפי כמות בסיס המנה"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
        />
        {fieldError(state, "quantity") ? (
          <p className="mt-1 text-xs text-red-600">{fieldError(state, "quantity")}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold" htmlFor="unit">
          יחידה במתכון *
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
        <label className="mb-1 block text-xs font-semibold" htmlFor="wastePercent">
          פחת %
        </label>
        <input
          id="wastePercent"
          name="wastePercent"
          inputMode="decimal"
          placeholder="0"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
        />
        {fieldError(state, "wastePercent") ? (
          <p className="mt-1 text-xs text-red-600">{fieldError(state, "wastePercent")}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold" htmlFor="notes">
          הערה
        </label>
        <input
          id="notes"
          name="notes"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>
      <div className="flex items-end sm:col-span-2 lg:col-span-6">
        <button
          type="submit"
          className="w-full rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300 sm:w-auto"
        >
          <SubmitLabel>הוסף לעץ המוצר</SubmitLabel>
        </button>
      </div>
    </form>
  );
}
