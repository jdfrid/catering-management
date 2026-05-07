"use client";

import { deleteSupplier } from "@/app/purchasing/suppliers/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function DeleteSupplierButton({ supplierId }: { supplierId: string }) {
  return (
    <form
      action={deleteSupplier}
      onSubmit={(e) => {
        if (!confirm("למחוק ספק?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={supplierId} />
      <SubmitButton
        className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-6 font-bold text-red-900 hover:bg-red-100 disabled:opacity-60"
        pendingLabel="מוחק…"
      >
        מחיקת ספק
      </SubmitButton>
    </form>
  );
}
