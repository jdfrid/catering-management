import {
  ModulePlaceholder,
  moduleMetadata,
} from "@/components/ModulePlaceholder";

export const metadata = moduleMetadata("רכש", "רשימות רכש והזמנות לספקים.");

export default function PurchasingPage() {
  return (
    <ModulePlaceholder
      title="רכש"
      description="כאן יופקו רשימות חומרים מאירוע מאושר, איחוד כמויות והזמנות ספק."
    />
  );
}
