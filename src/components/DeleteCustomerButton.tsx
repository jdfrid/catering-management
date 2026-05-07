"use client";

import { deleteCustomer } from "@/app/customers/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function DeleteCustomerButton({ customerId }: { customerId: string }) {
  return (
    <form
      action={deleteCustomer}
      onSubmit={(e) => {
        if (!confirm("למחוק לקוח זה? פעולה בלתי הפיכה.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={customerId} />
      <SubmitButton
        className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-6 font-bold text-red-900 hover:bg-red-100 disabled:opacity-60"
        pendingLabel="מוחק…"
      >
        מחיקת לקוח
      </SubmitButton>
    </form>
  );
}
