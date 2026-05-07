"use client";

import { deleteEvent } from "@/app/events/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  return (
    <form
      action={deleteEvent}
      onSubmit={(e) => {
        if (!confirm("למחוק אירוע? לא ניתן אם קיימות הצעות מחיר.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={eventId} />
      <SubmitButton
        className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-6 font-bold text-red-900 hover:bg-red-100 disabled:opacity-60"
        pendingLabel="מוחק…"
      >
        מחיקת אירוע
      </SubmitButton>
    </form>
  );
}
