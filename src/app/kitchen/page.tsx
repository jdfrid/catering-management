import {
  ModulePlaceholder,
  moduleMetadata,
} from "@/components/ModulePlaceholder";

export const metadata = moduleMetadata(
  "משימות מטבח",
  "עבודת מטבח וטאבלט.",
);

export default function KitchenPage() {
  return (
    <ModulePlaceholder
      title="משימות מטבח"
      description="כאן יוצגו משימות לפי יום ומחלקה, עם עדכון סטטוס מהיר מותאם לטאבלט."
    />
  );
}
