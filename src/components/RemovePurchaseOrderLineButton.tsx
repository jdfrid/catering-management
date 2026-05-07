"use client";

import { removePurchaseOrderLine } from "@/app/purchasing/orders/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function RemovePurchaseOrderLineButton({
  itemId,
  purchaseOrderId,
}: {
  itemId: string;
  purchaseOrderId: string;
}) {
  return (
    <form
      action={async (formData) => {
        await removePurchaseOrderLine(formData);
      }}
      className="inline"
    >
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="purchaseOrderId" value={purchaseOrderId} />
      <SubmitButton
        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-red-50 hover:border-red-200"
        pendingLabel="…"
      >
        הסר
      </SubmitButton>
    </form>
  );
}
