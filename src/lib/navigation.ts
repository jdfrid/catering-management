export type NavItem = {
  href: string;
  label: string;
  short: string;
};

/** קישורי מסכים — יורחבו בהמשך עם נתונים אמיתיים */
export const mainNav: NavItem[] = [
  { href: "/", label: "דשבורד", short: "דשבורד" },
  { href: "/customers", label: "לקוחות", short: "לקוחות" },
  { href: "/events", label: "אירועים", short: "אירועים" },
  { href: "/menu", label: "תפריט ועץ מוצר", short: "תפריט" },
  { href: "/quotes", label: "הצעות מחיר", short: "הצעות" },
  { href: "/purchasing", label: "רכש", short: "רכש" },
  { href: "/kitchen", label: "משימות מטבח", short: "מטבח" },
  { href: "/finance", label: "כספים", short: "כספים" },
];

export const moduleLinks: { href: string; title: string }[] = [
  { href: "/customers", title: "לקוחות ואנשי קשר" },
  { href: "/events", title: "אירועים וסטטוסים" },
  { href: "/menu", title: "מנות, רכיבים ועץ מוצר" },
  { href: "/quotes", title: "חישוב עלויות והצגת רווחיות" },
  { href: "/quotes", title: "הצעות מחיר, PDF ומייל" },
  { href: "/purchasing", title: "רכש בסיסי לפי אירוע" },
  { href: "/kitchen", title: "משימות מטבח לטאבלט" },
  { href: "/finance", title: "תשלומים ודוחות בסיסיים" },
];
