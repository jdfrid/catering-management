"use client";

import { deleteKitchenTask } from "@/app/kitchen/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function DeleteKitchenTaskButton({ taskId }: { taskId: string }) {
  return (
    <form
      action={deleteKitchenTask}
      onSubmit={(e) => {
        if (!confirm("למחוק משימה?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={taskId} />
      <SubmitButton
        className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-6 font-bold text-red-900 hover:bg-red-100 disabled:opacity-60"
        pendingLabel="מוחק…"
      >
        מחיקת משימה
      </SubmitButton>
    </form>
  );
}
