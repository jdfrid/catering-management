"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { MenuItem } from "@prisma/client";
import { createMenuItem, updateMenuItem } from "@/app/menu/actions";
import { fieldError } from "@/lib/forms";
import { MENU_CATEGORIES, SALE_UNITS } from "@/lib/constants";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "שומר…" : children}</>;
}

type Props = { menuItem?: MenuItem };

export function MenuItemForm({ menuItem }: Props) {
  const isEdit = Boolean(menuItem);
  const action = isEdit ? updateMenuItem : createMenuItem;
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={menuItem!.id} /> : null}

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
            שם מנה *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={menuItem?.name ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
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
            defaultValue={menuItem?.category ?? MENU_CATEGORIES[0]}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {MENU_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="saleUnit">
            יחידת מכירה *
          </label>
          <select
            id="saleUnit"
            name="saleUnit"
            required
            defaultValue={menuItem?.saleUnit ?? "מנה"}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {SALE_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="baseRecipeQuantity">
            כמות בסיס למתכון *
          </label>
          <input
            id="baseRecipeQuantity"
            name="baseRecipeQuantity"
            type="number"
            step="0.001"
            min="0.001"
            required
            defaultValue={
              menuItem ? Number(menuItem.baseRecipeQuantity) : 10
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "baseRecipeQuantity") ? (
            <p className="mt-1 text-sm text-red-600">
              {fieldError(state, "baseRecipeQuantity")}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="suggestedPrice">
          מחיר מכירה מומלץ ללקוח (₪)
        </label>
        <input
          id="suggestedPrice"
          name="suggestedPrice"
          type="text"
          inputMode="decimal"
          dir="ltr"
          placeholder="לדוגמה 45"
          defaultValue={
            menuItem?.suggestedPrice != null
              ? String(menuItem.suggestedPrice)
              : ""
          }
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="prepMinutes">
            זמן הכנה (דקות)
          </label>
          <input
            id="prepMinutes"
            name="prepMinutes"
            type="number"
            min={0}
            defaultValue={menuItem?.prepMinutes ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="cookMinutes">
            זמן בישול (דקות)
          </label>
          <input
            id="cookMinutes"
            name="cookMinutes"
            type="number"
            min={0}
            defaultValue={menuItem?.cookMinutes ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="complexity">
          רמת מורכבות
        </label>
        <input
          id="complexity"
          name="complexity"
          placeholder="נמוכה / בינונית / גבוהה"
          defaultValue={menuItem?.complexity ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="instructions">
          הוראות הכנה
        </label>
        <textarea
          id="instructions"
          name="instructions"
          rows={4}
          defaultValue={menuItem?.instructions ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {isEdit ? (
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="active"
            value="true"
            defaultChecked={menuItem!.active}
            className="size-4 rounded border-slate-300"
          />
          מוצג בקטלוג / פעיל
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
          <SubmitLabel>{isEdit ? "עדכון מנה" : "שמירת מנה"}</SubmitLabel>
        </button>
        <Link
          href="/menu"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-6 font-semibold text-slate-800 hover:bg-slate-100"
        >
          ביטול
        </Link>
      </div>
    </form>
  );
}
