import {
  ModulePlaceholder,
  moduleMetadata,
} from "@/components/ModulePlaceholder";

export const metadata = moduleMetadata(
  "לקוחות",
  "ניהול לקוחות, אנשי קשר והיסטוריית פעילות.",
);

export default function CustomersPage() {
  return (
    <ModulePlaceholder
      title="לקוחות ואנשי קשר"
      description="כאן יוצגו רשימת לקוחות, חיפוש, כרטיס לקוח וקישור לאירועים והצעות מחיר."
    />
  );
}
