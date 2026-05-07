"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { importCsvAction } from "@/app/data-import/actions";
import {
  IMPORT_ENTITIES,
  type CsvImportActionState,
} from "@/app/data-import/config";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "טוען…" : children}</>;
}

const initial: CsvImportActionState = {
  ok: false,
  message: "",
  result: null,
};

export function CsvImportForm() {
  const [state, formAction] = useActionState(importCsvAction, initial);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="entity" className="mb-1 block text-sm font-semibold">
            סוג הרשימה *
          </label>
          <select
            id="entity"
            name="entity"
            required
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
            defaultValue={IMPORT_ENTITIES[0]?.value}
          >
            {IMPORT_ENTITIES.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="file" className="mb-1 block text-sm font-semibold">
            קובץ CSV *
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base file:me-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-semibold"
          />
          <p className="mt-1 text-xs text-slate-500">
            שמרו מאקסל כ־CSV (UTF-8). ניתן פסיק או נקודה־פסיק כמפריד.
          </p>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
        >
          <SubmitLabel>העלאה וייבוא</SubmitLabel>
        </button>
      </form>

      {state.message ? (
        <div
          className={
            state.ok
              ? "rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200"
              : "rounded-2xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-200"
          }
        >
          {state.message}
        </div>
      ) : null}

      {state.result?.errors && state.result.errors.length > 0 ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm">
          <p className="font-bold text-red-900">שגיאות בשורות</p>
          <ul className="mt-2 max-h-60 list-inside list-disc space-y-1 overflow-y-auto text-red-800">
            {state.result.errors.map((err, i) => (
              <li key={i} dir="ltr">
                שורה {err.line}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
