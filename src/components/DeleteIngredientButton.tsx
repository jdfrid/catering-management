"use client";

import { deleteIngredient } from "@/app/menu/ingredients/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function DeleteIngredientButton({ id }: { id: string }) {
  return (
    <form
      action={deleteIngredient}
      onSubmit={(e) => {
        if (!confirm("למחוק חומר גלם?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton
        className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-6 font-bold text-red-900 hover:bg-red-100"
        pendingLabel="מוחק…"
      >
        מחיקה
      </SubmitButton>
    </form>
  );
}
