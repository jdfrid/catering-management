# מערכת ניהול קייטרינג

פרויקט MVP לניהול קייטרינג: לקוחות, אירועים, תפריטים, עץ מוצר, הצעות מחיר, רכש בסיסי, משימות מטבח ותשלומים בסיסיים.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + **PostgreSQL**
- `render.yaml` — Web + DB ב-Render

## הרצה מקומית (מומלץ עם Docker)

דורש [Docker Desktop](https://www.docker.com/products/docker-desktop/) מותקן.

```powershell
cd catering-management

# התקנת תלויות
npm install

# מסד Postgres מקומי (פורט 5433 כדי לא להתנגש ב-5432)
npm run db:up

# משתני סביבה — יוצרים .env מהדוגמה (כבר מכוון ל-Docker המקומי)
Copy-Item .env.example .env

# יצירת טבלאות (מיגרציה ראשונה / עדכונים עתידיים)
npm run prisma:generate
npm run prisma:migrate
```

כשהמיגרציה שואלת שם, אפשר להשאיר את ברירת המחדל או לתת למשל `init`.

הרצת השרת:

```powershell
npm run dev
```

פתיחה בדפדפן: [http://localhost:3000](http://localhost:3000)

עצירת המסד:

```powershell
npm run db:down
```

## Render — Web + Postgres חינמי

ב-`render.yaml` מוגדרים:

- שירות Web בתכנית **free** (נרדם אחרי חוסר שימוש)
- Postgres בתכנית **free**

**חשוב:** מסדי Postgres חינמיים ב-Render מוגבלים בזמן (לפי המדיניות שלהם — בדרך כלל תפוגה אחרי תקופה; אפשר לשדרג אחר כך). לפרטים עדכניים: [Render — Free](https://render.com/docs/free).

לאחר חיבור הריפו ל-Blueprint:

1. הגדרו ב-Dashboard את `EMAIL_FROM` (מסומן כ-`sync: false` ב-`render.yaml`).
2. בכל Deploy רץ `preDeployCommand`: `npx prisma migrate deploy` — דורש שתיקיית `prisma/migrations` תהיה ב-commit (קיימת בפרויקט).

## פקודות שימושיות

```powershell
npm run lint
npm run build
npm run prisma:generate
npm run prisma:migrate    # פיתוח — יוצר/מעדכן מיגרציות
npm run prisma:deploy     # ייצור / CI — רק מיגרציות שקיימות בתיקייה
npm run db:logs
```

## מדריך משתמש

**במערכת (עם צילומי מסך):** [`/guide`](http://localhost:3000/guide)  
**הורדת PDF:** [`/guide/madrich-meshutaf.pdf`](http://localhost:3000/guide/madrich-meshutaf.pdf)  
**קובץ Markdown:** [docs/MADRICH-MESHUTAF.md](docs/MADRICH-MESHUTAF.md)

## לא ב-MVP

- אינטגרציה לשירות חשבוניות ישראלי
- ייבוא Excel (יש ייבוא CSV — ראו `/guide`)
- WhatsApp/SMS
- מלאי מתקדם לפי אצווה ותפוגה
