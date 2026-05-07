import {
  ModulePlaceholder,
  moduleMetadata,
} from "@/components/ModulePlaceholder";

export const metadata = moduleMetadata(
  "כספים",
  "תשלומים, יתרות ומסמכים.",
);

export default function FinancePage() {
  return (
    <ModulePlaceholder
      title="כספים"
      description="כאן יתועדו תשלומים, יתרות פתוחות, וקישור למסמכים כספיים בהמשך (אינטגרציה לשירות חיצוני)."
    />
  );
}
