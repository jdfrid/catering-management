"use client";

import { deleteSupplierPrice } from "@/app/purchasing/prices/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function DeleteSupplierPriceButton({ id }: { id: string }) {
  return (
    <form
      action={deleteSupplierPrice}
      onSubmit={(e) => {
        if (!confirm("למחוק מחיר ספק?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton
        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-300 bg-red-50 px-4 text-sm font-bold text-red-900 hover:bg-red-100 disabled:opacity-60"
        pendingLabel="מוחק…"
      >
        מחיקה
      </SubmitButton>
    </form>
  );
}
