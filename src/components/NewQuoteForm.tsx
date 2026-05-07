"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Customer, Event } from "@prisma/client";
import { createQuote } from "@/app/quotes/actions";
import { fieldError } from "@/lib/forms";

function SubmitLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "יוצר…" : children}</>;
}

type Ev = Event & { customer: Customer };

export function NewQuoteForm({
  events,
  defaultEventId,
}: {
  events: Ev[];
  defaultEventId?: string;
}) {
  const [state, formAction] = useActionState(createQuote, null);

  if (events.length === 0) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center ring-1 ring-slate-200">
        <p className="text-slate-700">אין אירועים — צור לקוח ואירוע לפני הצעה.</p>
        <Link href="/events/new" className="mt-4 inline-block font-bold text-amber-900 underline">
          צור אירוע
        </Link>
      </div>
    );
  }

  const defaultId =
    defaultEventId && events.some((e) => e.id === defaultEventId)
      ? defaultEventId
      : events[0].id;

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && !state.ok ? (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">{state.message}</p>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-semibold" htmlFor="eventId">
          אירוע *
        </label>
        <select
          id="eventId"
          name="eventId"
          required
          defaultValue={defaultId}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.customer.name} — {e.name || e.type} —{" "}
              {new Date(e.date).toLocaleDateString("he-IL")} ({e.guestCount} סועדים)
            </option>
          ))}
        </select>
        {fieldError(state, "eventId") ? (
          <p className="mt-1 text-sm text-red-600">{fieldError(state, "eventId")}</p>
        ) : null}
      </div>

      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        <SubmitLabel>יצירת הצעת מחיר</SubmitLabel>
      </button>
    </form>
  );
}
