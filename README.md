# מערכת ניהול קייטרינג

פרויקט חדש ונקי ל-MVP של מערכת ניהול קייטרינג: לקוחות, אירועים, תפריטים, עץ מוצר, הצעות מחיר, רכש בסיסי, משימות מטבח ותשלומים בסיסיים.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Render deployment blueprint

## פיתוח מקומי

```powershell
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run dev
```

פתחו את [http://localhost:3000](http://localhost:3000).

## MVP

- הרשאות בסיסיות לפי תפקידים.
- עלויות פנימיות ורווחיות למנהלים בלבד.
- עץ מוצר ומתכונים עם גרסאות ו-snapshots להצעות.
- הצעות מחיר עם PDF ומייל בהמשך.
- רכש בסיסי ומשימות מטבח מותאמות טאבלט.
- תשלומים בסיסיים ללא אינטגרציית חשבוניות בשלב הראשון.

## פריסה ל-Render

הקובץ `render.yaml` מגדיר שירות Web ו-PostgreSQL מנוהל. ב-Render:

1. חברו GitHub repository חדש.
2. בחרו Blueprint deploy על בסיס `render.yaml`.
3. הגדירו `EMAIL_FROM` וערכי סביבה חסרים.
4. הריצו מיגרציות במסד הנתונים כחלק מתהליך העלייה לייצור.

## פקודות חשובות

```powershell
npm run lint
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
```

## לא ב-MVP

- אינטגרציה לשירות חשבוניות ישראלי.
- ייבוא Excel.
- WhatsApp/SMS.
- מלאי מתקדם לפי אצווה ותפוגה.
