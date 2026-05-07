"use client";

import { QuoteStatus } from "@prisma/client";
import { deleteQuoteDraft } from "@/app/quotes/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function DeleteQuoteDraftButton({
  quoteId,
  status,
}: {
  quoteId: string;
  status: QuoteStatus;
}) {
  if (status !== QuoteStatus.DRAFT) return null;
  return (
    <form
      action={deleteQuoteDraft}
      onSubmit={(e) => {
        if (!confirm("למחוק הצעת טיוטה לצמיתות?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={quoteId} />
      <SubmitButton
        className="rounded-2xl border border-red-300 bg-red-50 px-5 py-2 text-sm font-bold text-red-900 hover:bg-red-100"
        pendingLabel="מוחק…"
      >
        מחיקת טיוטה
      </SubmitButton>
    </form>
  );
}
