import type { ImportEntity, ImportResult } from "@/lib/csv-import";

export type CsvImportActionState = {
  ok: boolean;
  message: string;
  result: ImportResult | null;
};

export const IMPORT_ENTITIES: {
  value: ImportEntity;
  label: string;
  hint: string;
}[] = [
  {
    value: "customers",
    label: "לקוחות",
    hint: "שם, סוג, טלפון, אימייל, כתובת, ח.פ, הערות, פעיל",
  },
  {
    value: "customer_contacts",
    label: "אנשי קשר ללקוח",
    hint: "שם לקוח, טלפון לקוח, שם איש קשר, תפקיד, טלפון, אימייל",
  },
  {
    value: "suppliers",
    label: "ספקים",
    hint: "שם, קטגוריה, איש קשר, טלפון, אימייל, ימי אספקה, מינ׳ם הזמנה, פעיל",
  },
  {
    value: "ingredients",
    label: "חומרי גלם",
    hint: "שם, סוג, יחידה, ספק מועדף (שם), פעיל",
  },
  {
    value: "menu_items",
    label: "מנות (תפריט)",
    hint: "שם, קטגוריה, יחידת מכירה, כמות בסיס, מחיר מומלץ, דקות הכנה/בישול, הוראות, פעיל",
  },
  {
    value: "supplier_prices",
    label: "מחירון ספקים",
    hint: "שם ספק, שם חומר גלם, מחיר, יחידת מחיר, תקף מ, תקף עד, הערות",
  },
  {
    value: "recipe_components",
    label: "שורות מתכון (עץ מוצר)",
    hint: "שם מנה, שם חומר גלם, כמות, יחידה, פחת, הערות",
  },
  {
    value: "events",
    label: "אירועים",
    hint: "שם לקוח, טלפון לקוח, שם אירוע, סוג, תאריך, מספר מוזמנים, רמת שירות, כתובת, סטטוס…",
  },
];

export function isImportEntity(v: string): v is ImportEntity {
  return IMPORT_ENTITIES.some((x) => x.value === v);
}
