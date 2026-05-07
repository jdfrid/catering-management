"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Customer, Event } from "@prisma/client";
import { EventStatus } from "@prisma/client";
import { createEvent, updateEvent } from "@/app/events/actions";
import { fieldError } from "@/lib/forms";
import {
  EVENT_TYPES,
  SERVICE_LEVELS,
  EVENT_STATUS_LABELS,
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
  customers: Pick<Customer, "id" | "name">[];
  event?: Event;
  defaultCustomerId?: string;
};

const statuses = Object.values(EventStatus);

export function EventForm({ customers, event, defaultCustomerId }: Props) {
  const isEdit = Boolean(event);
  const action = isEdit ? updateEvent : createEvent;
  const [state, formAction] = useActionState(action, null);

  const customerIdDefault =
    event?.customerId ?? defaultCustomerId ?? customers[0]?.id ?? "";

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={event!.id} /> : null}

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
        <label className="mb-1 block text-sm font-semibold" htmlFor="customerId">
          לקוח *
        </label>
        <select
          id="customerId"
          name="customerId"
          required
          defaultValue={customerIdDefault}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {fieldError(state, "customerId") ? (
          <p className="mt-1 text-sm text-red-600">{fieldError(state, "customerId")}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="name">
            שם אירוע
          </label>
          <input
            id="name"
            name="name"
            defaultValue={event?.name ?? ""}
            placeholder="לדוגמה: בר מצווה משפחת כהן"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="type">
            סוג אירוע *
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={event?.type ?? "פרטי"}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="eventDate">
            תאריך אירוע *
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            required
            defaultValue={event ? formatLocalDate(event.date) : ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="eventTime">
            שעת התחלה
          </label>
          <input
            id="eventTime"
            name="eventTime"
            type="time"
            defaultValue={event ? formatLocalTime(event.date) : "12:00"}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="deliveryTime">
            שעת אספקה
          </label>
          <input
            id="deliveryTime"
            name="deliveryTime"
            type="time"
            defaultValue={
              event?.deliveryTime ? formatLocalTime(event.deliveryTime) : ""
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="address">
          כתובת אירוע / שילוח
        </label>
        <input
          id="address"
          name="address"
          defaultValue={event?.address ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="guestCount">
            מספר סועדים *
          </label>
          <input
            id="guestCount"
            name="guestCount"
            type="number"
            min={1}
            required
            defaultValue={event?.guestCount ?? 50}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "guestCount") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "guestCount")}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="serviceLevel">
            רמת שירות *
          </label>
          <select
            id="serviceLevel"
            name="serviceLevel"
            required
            defaultValue={event?.serviceLevel ?? "שירות מלא"}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {SERVICE_LEVELS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="menuType">
            סוג תפריט
          </label>
          <input
            id="menuType"
            name="menuType"
            placeholder="בשרי / חלבי / פרווה"
            defaultValue={event?.menuType ?? ""}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="status">
            סטטוס אירוע
          </label>
          <select
            id="status"
            name="status"
            defaultValue={event?.status ?? EventStatus.NEW}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {EVENT_STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="operationalNotes">
          הערות תפעול
        </label>
        <textarea
          id="operationalNotes"
          name="operationalNotes"
          rows={4}
          defaultValue={event?.operationalNotes ?? ""}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {fieldError(state, "_form") ? (
        <p className="text-sm text-red-600">{fieldError(state, "_form")}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          <SubmitLabel>{isEdit ? "עדכון אירוע" : "יצירת אירוע"}</SubmitLabel>
        </button>
        <Link
          href="/events"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 px-6 font-semibold text-slate-800 hover:bg-slate-100"
        >
          ביטול
        </Link>
      </div>
    </form>
  );
}
