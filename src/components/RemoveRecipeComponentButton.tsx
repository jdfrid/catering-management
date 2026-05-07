"use client";

import { removeRecipeComponent } from "@/app/menu/recipe-actions";
import { SubmitButton } from "@/components/SubmitButton";

export function RemoveRecipeComponentButton({
  componentId,
  menuItemId,
}: {
  componentId: string;
  menuItemId: string;
}) {
  return (
    <form
      action={async (fd) => {
        await removeRecipeComponent(fd);
      }}
      className="inline"
    >
      <input type="hidden" name="componentId" value={componentId} />
      <input type="hidden" name="menuItemId" value={menuItemId} />
      <SubmitButton
        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold hover:bg-red-50"
        pendingLabel="…"
      >
        הסר
      </SubmitButton>
    </form>
  );
}
