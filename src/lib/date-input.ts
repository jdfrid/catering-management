/** ערך ל־input type="date" (YYYY-MM-DD) מזמן שמור ב־DB */
export function toDateInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
