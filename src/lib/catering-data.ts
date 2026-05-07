export type Role = "ADMIN" | "SALES" | "KITCHEN" | "PURCHASING" | "FINANCE";

export type DashboardMetric = {
  label: string;
  value: string;
  note: string;
};

export type PipelineItem = {
  title: string;
  status: string;
  owner: string;
  amount?: string;
};

export type KitchenTask = {
  name: string;
  event: string;
  department: string;
  time: string;
  status: "פתוחה" | "בביצוע" | "ממתינה" | "הושלמה";
};

export const managerOnlyFields = [
  "עלות פנימית",
  "רווח צפוי",
  "אחוז רווח",
  "התראות רווחיות",
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "אירועים השבוע", value: "12", note: "4 מתוכם ממתינים לרכש" },
  { label: "הצעות פתוחות", value: "8", note: "3 דורשות תזכורת לקוח" },
  { label: "משימות מטבח", value: "31", note: "9 לביצוע היום" },
  { label: "יתרות פתוחות", value: "₪42,300", note: "מוצג למנהלים וכספים" },
];

export const quotePipeline: PipelineItem[] = [
  {
    title: "בר מצווה משפחת כהן",
    status: "ממתין לאישור לקוח",
    owner: "מכירות",
    amount: "₪18,900",
  },
  {
    title: "אירוע חברה - 120 סועדים",
    status: "טיוטת הצעה",
    owner: "מנהל קייטרינג",
    amount: "₪32,400",
  },
  {
    title: "שבת חתן משפחת לוי",
    status: "אושרה",
    owner: "רכש",
    amount: "₪24,700",
  },
];

export const kitchenTasks: KitchenTask[] = [
  {
    name: "הכנת מרינדה לסלמון",
    event: "בר מצווה משפחת כהן",
    department: "הכנה מוקדמת",
    time: "09:00",
    status: "פתוחה",
  },
  {
    name: "אריזת מגשי סלטים",
    event: "אירוע חברה",
    department: "אריזה",
    time: "11:30",
    status: "בביצוע",
  },
  {
    name: "בקרת איכות קינוחים",
    event: "שבת חתן משפחת לוי",
    department: "בקרת איכות",
    time: "14:00",
    status: "ממתינה",
  },
];
