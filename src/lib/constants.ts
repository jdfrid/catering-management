/** אפיון: סוג לקוח */
export const CUSTOMER_TYPES = ["פרטי", "עסקי", "מוסדי"] as const;

/** אפיון: סוג אירוע (ניתן להרחבה) */
export const EVENT_TYPES = [
  "פרטי",
  "עסקי",
  "מוסדי",
  "שבת",
  "חג",
  "בר/בת מצווה",
  "אחר",
] as const;

/** אפיון: רמת שירות */
export const SERVICE_LEVELS = [
  "שירות מלא",
  "הגשה",
  "משלוח",
  "איסוף עצמי",
] as const;

/** קטגוריות מנה לדוגמה */
export const MENU_CATEGORIES = [
  "פתיחה",
  "סלטים",
  "דגים",
  "עיקריות",
  "תוספות",
  "קינוחים",
  "שתייה",
  "מגשי אירוח",
  "נלווה",
] as const;

export const SALE_UNITS = ["מנה", "מגש", "ק״ג", "ליטר", "יחידה"] as const;

export const KITCHEN_DEPARTMENTS = [
  "הכנה מוקדמת",
  "חיתוך",
  "בישול",
  "הרכבה",
  "אריזה",
  "בקרת איכות",
  "שילוח",
  "ניקיון",
] as const;

/** מע״מ לחישוב הצעה (ניתן להעביר ל-env בהמשך) */
export const DEFAULT_VAT_RATE = 0.18;

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "טיוטה",
  SENT: "נשלחה",
  NEGOTIATION: "במו״מ",
  APPROVED: "אושרה",
  REJECTED: "נדחתה",
  CANCELLED: "בוטלה",
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  NEW: "חדש",
  QUOTING: "בהצעת מחיר",
  WAITING_FOR_CUSTOMER: "ממתין לאישור לקוח",
  APPROVED: "מאושר",
  PURCHASING: "ברכש",
  PREPARING: "בהכנות",
  READY_FOR_DELIVERY: "מוכן לשילוח",
  DELIVERED: "יצא ללקוח",
  COMPLETED: "בוצע",
  CLOSED: "נסגר",
  CANCELLED: "בוטל",
};

export const SUPPLIER_CATEGORIES = [
  "יבשים",
  "קירור",
  "ירקות ופירות",
  "שירותים",
  "חד פעמי",
  "אחר",
] as const;

export const PURCHASE_ORDER_STATUS_LABELS: Record<string, string> = {
  DRAFT: "טיוטה",
  SENT: "נשלחה לספק",
  CONFIRMED: "אושרה",
  PARTIALLY_RECEIVED: "חלקית התקבלה",
  RECEIVED: "התקבלה במלואה",
  CANCELLED: "בוטלה",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  OPEN: "פתוחה",
  IN_PROGRESS: "בביצוע",
  WAITING: "ממתינה",
  DONE: "הושלמה",
  ISSUE: "תקלה",
  CANCELLED: "בוטלה",
};

/** אמצעי תשלום לדוגמה */
export const PAYMENT_METHODS = [
  "העברה בנקאית",
  "אשראי",
  "צ׳ק",
  "מזומן",
  "Bit",
  "אחר",
] as const;
