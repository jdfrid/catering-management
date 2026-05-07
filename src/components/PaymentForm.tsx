"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Customer } from "@prisma/client";
import { createPayment } from "@/app/finance/actions";
import { fieldError } from "@/lib/forms";
import { PAYMENT_METHODS } from "@/lib/constants";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "רושם…" : children}</>;
}

type EventOption = {
  id: string;
  name: string | null;
  type: string;
  date: Date;
  customerId: string;
};

type Props = {
  customers: Pick<Customer, "id" | "name">[];
  events: EventOption[];
  /** מהקישור /finance?customerId=… */
  defaultCustomerId?: string;
  /** מהקישור /finance?eventId=… */
  defaultEventId?: string;
};

function resolveInitialCustomerId(
  customers: Pick<Customer, "id" | "name">[],
  defaultCustomerId?: string,
) {
  if (defaultCustomerId && customers.some((c) => c.id === defaultCustomerId)) {
    return defaultCustomerId;
  }
  return customers[0]?.id ?? "";
}

function resolveInitialEventId(
  events: EventOption[],
  customerId: string,
  defaultEventId?: string,
) {
  if (!defaultEventId) return "";
  const ev = events.find((e) => e.id === defaultEventId);
  if (ev && ev.customerId === customerId) return defaultEventId;
  return "";
}

function formatLocalDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function PaymentForm({
  customers,
  events,
  defaultCustomerId,
  defaultEventId,
}: Props) {
  const [state, formAction] = useActionState(createPayment, null);
  const [customerId, setCustomerId] = useState(() =>
    resolveInitialCustomerId(customers, defaultCustomerId),
  );
  const [eventId, setEventId] = useState(() =>
    resolveInitialEventId(
      events,
      resolveInitialCustomerId(customers, defaultCustomerId),
      defaultEventId,
    ),
  );

  const filteredEvents = useMemo(
    () => events.filter((e) => e.customerId === customerId),
    [events, customerId],
  );

  const today = formatLocalDate(new Date());

  return (
    <form action={formAction} className="space-y-5">
      {state?.message && !state.ok ? (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
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
          value={customerId}
          onChange={(e) => {
            const next = e.target.value;
            setCustomerId(next);
            setEventId((prev) => {
              const stillOk = events.some(
                (ev) => ev.id === prev && ev.customerId === next,
              );
              return stillOk ? prev : "";
            });
          }}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {fieldError(state, "customerId") ? (
          <p className="mt-1 text-sm text-red-600">
            {fieldError(state, "customerId")}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="eventId">
          אירוע (אופציונלי)
        </label>
        <select
          id="eventId"
          name="eventId"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="">ללא אירוע</option>
          {filteredEvents.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name ?? ev.type} · {formatLocalDate(new Date(ev.date))}
            </option>
          ))}
        </select>
        {fieldError(state, "eventId") ? (
          <p className="mt-1 text-sm text-red-600">{fieldError(state, "eventId")}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="amount">
            סכום ₪ *
          </label>
          <input
            id="amount"
            name="amount"
            required
            inputMode="decimal"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "amount") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "amount")}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="method">
            אמצעי תשלום
          </label>
          <select
            id="method"
            name="method"
            defaultValue=""
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">—</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {fieldError(state, "method") ? (
            <p className="mt-1 text-sm text-red-600">{fieldError(state, "method")}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="paidAtDate">
            תאריך תשלום *
          </label>
          <input
            id="paidAtDate"
            name="paidAtDate"
            type="date"
            required
            defaultValue={today}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
          {fieldError(state, "paidAtDate") ? (
            <p className="mt-1 text-sm text-red-600">
              {fieldError(state, "paidAtDate")}
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="paidAtTime">
            שעה
          </label>
          <input
            id="paidAtTime"
            name="paidAtTime"
            type="time"
            defaultValue="12:00"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="notes">
          הערות
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
      >
        <SubmitLabel>רישום תשלום</SubmitLabel>
      </button>
    </form>
  );
}
