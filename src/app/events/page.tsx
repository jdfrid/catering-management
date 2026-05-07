import {
  ModulePlaceholder,
  moduleMetadata,
} from "@/components/ModulePlaceholder";

export const metadata = moduleMetadata(
  "אירועים",
  "ניהול אירועי קייטרינג וסטטוסים.",
);

export default function EventsPage() {
  return (
    <ModulePlaceholder
      title="אירועים"
      description="כאן יוצגו אירועים לפי תאריך, סטטוס, מספר סועדים, והקישור להצעות מחיר ולרכש."
    />
  );
}
