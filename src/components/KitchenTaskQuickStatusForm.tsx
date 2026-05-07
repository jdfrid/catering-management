"use client";

import { TaskStatus } from "@prisma/client";
import { updateKitchenTaskQuickStatus } from "@/app/kitchen/actions";
import { TASK_STATUS_LABELS } from "@/lib/constants";
import { SubmitButton } from "@/components/SubmitButton";

const statuses = Object.values(TaskStatus);

export function KitchenTaskQuickStatusForm({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: TaskStatus;
}) {
  return (
    <form
      action={updateKitchenTaskQuickStatus}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="id" value={taskId} />
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-xl border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {TASK_STATUS_LABELS[s] ?? s}
          </option>
        ))}
      </select>
      <SubmitButton
        className="rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300"
        pendingLabel="…"
      >
        עדכן
      </SubmitButton>
    </form>
  );
}
