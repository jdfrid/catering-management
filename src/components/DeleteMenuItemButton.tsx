"use client";

import { deleteMenuItem } from "@/app/menu/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function DeleteMenuItemButton({ menuItemId }: { menuItemId: string }) {
  return (
    <form
      action={deleteMenuItem}
      onSubmit={(e) => {
        if (!confirm("למחוק מנה? לא ניתן אם הופיעה בהצעות מחיר.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={menuItemId} />
      <SubmitButton
        className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-6 font-bold text-red-900 hover:bg-red-100 disabled:opacity-60"
        pendingLabel="מוחק…"
      >
        מחיקת מנה
      </SubmitButton>
    </form>
  );
}
