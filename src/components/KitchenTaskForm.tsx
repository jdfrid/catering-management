"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Event, KitchenTask, MenuItem } from "@prisma/client";
import { TaskStatus } from "@prisma/client";
import {
  createKitchenTask,
  updateKitchenTask,
} from "@/app/kitchen/actions";
import { fieldError } from "@/lib/forms";
import {
  KITCHEN_DEPARTMENTS,
  TASK_STATUS_LABELS,
} from "@/lib/constants";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "שומר…" : children}</>;
}

function formatLocalDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLocalTime(d: Date) {
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

type Props = {
  events: (Pick<Event, "id" | "name" | "type" | "date"> & {
    customer: { name: string };
  })[];
  menuItems: Pick<MenuItem, "id" | "name" | "category">[];
  task?: KitchenTask;
  defaultEventId?: string;
};

const statuses = Object.values(TaskStatus);

export function KitchenTaskForm({
  events,
  menuItems,
  task,
  defaultEventId,
}: Props) {
  const isEdit = Boolean(task);
  const action = isEdit ? updateKitchenTask : createKitchenTask;
  const [state, formAction] = useActionState(action, null);

  const eventIdDefault =
    task?.eventId ?? defaultEventId ?? events[0]?.id ?? "";

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={task!.id} /> : null}

      {state?.message && !state.ok ? (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
          {state.message}
        </p>
      ) : null}
      {state?.ok && state.message ? (
        <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
          {state.message}
        </p>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="eventId">
          אירוע *
        </label>
        <select
          id="eventId"
          name="eventId"
          required
          defaultValue={eventIdDefault}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.customer.name} · {ev.name ?? ev.type} ·{" "}
              {formatLocalDate(new Date(ev.date))}
            </option>
          ))}
        </select>
        {fieldError(state, "eventId") ? (
          <p className="mt-1 text-sm text-red-600">{fieldError(state, "eventId")}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="menuItemId">
          קישור למנה (אופציונלי)
        </label>
        <select
          id="menuItemId"
          name="menuItemId"
          defaultValue={task?.menuItemId ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="">ללא קישור למנה</option>
          {menuItems.map((m) => (
            <option key={m.id} value={m.id}>
              {m.category} · {m.name}
            </option>
          ))}
        </select>
        {fieldError(state, "menuItemId") ? (
          <p className="mt-1 text-sm text-red-600">
            {fieldError(state, "menuItemId")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="name">
            שם משימה *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={task?.name ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "name") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "name")}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="department">
            מחלקה *
          </label>
          <select
            id="department"
            name="department"
            required
            defaultValue={task?.department ?? KITCHEN_DEPARTMENTS[0]}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {KITCHEN_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {fieldError(state, "department") ? (
            <p className="mt-1 text-sm text-red-600">
              {fieldError(state, "department")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="assignee">
            אחראי
          </label>
          <input
            id="assignee"
            name="assignee"
            defaultValue={task?.assignee ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="workDate">
            תאריך עבודה *
          </label>
          <input
            id="workDate"
            name="workDate"
            type="date"
            required
            defaultValue={
              task
                ? formatLocalDate(new Date(task.workDate))
                : formatLocalDate(new Date())
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "workDate") ? (
            <p className="mt-1 text-sm text-red-600">
              {fieldError(state, "workDate")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="startTime">
            שעת התחלה
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={
              task?.startTime ? formatLocalTime(new Date(task.startTime)) : ""
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="durationMinutes"
          >
            משך (דקות)
          </label>
          <input
            id="durationMinutes"
            name="durationMinutes"
            inputMode="numeric"
            defaultValue={
              task?.durationMinutes !== undefined && task.durationMinutes !== null
                ? String(task.durationMinutes)
                : ""
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "durationMinutes") ? (
            <p className="mt-1 text-sm text-red-600">
              {fieldError(state, "durationMinutes")}
            </p>
          ) : null}
        </div>
      </div>

      {isEdit ? (
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="status">
            סטטוס *
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={task!.status}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
          {fieldError(state, "status") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "status")}</p>
          ) : null}
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="notes">
          הערות
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={task?.notes ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
        >
          <SubmitLabel>{isEdit ? "עדכון" : "יצירת משימה"}</SubmitLabel>
        </button>
        <Link
          href="/kitchen"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-6 font-semibold hover:bg-white"
        >
          ביטול
        </Link>
      </div>
    </form>
  );
}
