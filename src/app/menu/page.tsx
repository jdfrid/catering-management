import {
  ModulePlaceholder,
  moduleMetadata,
} from "@/components/ModulePlaceholder";

export const metadata = moduleMetadata(
  "תפריט ועץ מוצר",
  "מנות, מתכונים וחישוב עלות.",
);

export default function MenuPage() {
  return (
    <ModulePlaceholder
      title="תפריט ועץ מוצר"
      description="כאן יונהלו מנות, רכיבים, פחת, גרסאות מתכון ועלות מחושבת לפי מחירוני ספקים."
    />
  );
}
