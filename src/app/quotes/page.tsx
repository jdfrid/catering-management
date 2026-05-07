import {
  ModulePlaceholder,
  moduleMetadata,
} from "@/components/ModulePlaceholder";

export const metadata = moduleMetadata(
  "הצעות מחיר",
  "בניית הצעות, רווחיות ו-PDF.",
);

export default function QuotesPage() {
  return (
    <ModulePlaceholder
      title="הצעות מחיר"
      description="כאן תיבנה הצעת מחיר לאישור לקוח, כולל חישוב עלות פנימית ורווחיות (למנהלים בלבד בתצוגה), הפקת PDF ושליחה במייל."
    />
  );
}
