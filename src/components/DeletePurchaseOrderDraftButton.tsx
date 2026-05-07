"use client";

import { deletePurchaseOrderDraft } from "@/app/purchasing/orders/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function DeletePurchaseOrderDraftButton({
  purchaseOrderId,
}: {
  purchaseOrderId: string;
}) {
  return (
    <form
      action={deletePurchaseOrderDraft}
      onSubmit={(e) => {
        if (!confirm("למחוק טיוטת הזמנה?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={purchaseOrderId} />
      <SubmitButton
        className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-6 font-bold text-red-900 hover:bg-red-100 disabled:opacity-60"
        pendingLabel="מוחק…"
      >
        מחיקת טיוטה
      </SubmitButton>
    </form>
  );
}
