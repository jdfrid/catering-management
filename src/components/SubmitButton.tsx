"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel,
  className,
  disabled,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={
        className ??
        "inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
      }
    >
      {pending ? (pendingLabel ?? "שומר…") : children}
    </button>
  );
}
