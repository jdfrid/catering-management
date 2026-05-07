"use client";

import { removeQuoteLine } from "@/app/quotes/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function RemoveQuoteLineButton({
  quoteId,
  itemId,
  disabled,
}: {
  quoteId: string;
  itemId: string;
  disabled?: boolean;
}) {
  return (
    <form
      action={removeQuoteLine}
      onSubmit={(e) => {
        if (!confirm("להסיר שורה מההצעה?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="quoteId" value={quoteId} />
      <input type="hidden" name="itemId" value={itemId} />
      <SubmitButton
        disabled={disabled}
        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-900 hover:bg-red-100 disabled:opacity-50"
        pendingLabel="…"
      >
        הסרה
      </SubmitButton>
    </form>
  );
}
