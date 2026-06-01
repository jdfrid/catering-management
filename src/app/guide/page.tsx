import Link from "next/link";
import Image from "next/image";
import { moduleMetadata } from "@/components/ModulePlaceholder";

export const metadata = moduleMetadata(
  "מדריך משתמש",
  "הוראות שימוש במערכת CateringOS — לקוחות, אירועים, תפריט, הצעות, רכש, מטבח וייבוא.",
);

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200"
    >
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <div className="mt-6 space-y-4 text-base leading-8 text-slate-700">
        {children}
      </div>
    </section>
  );
}

function Shot({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <Image
        src={src}
        alt={alt}
        width={1280}
        height={720}
        className="h-auto w-full"
      />
      <figcaption className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
        {caption}
      </figcaption>
    </figure>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-2 pr-6">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ol>
  );
}

export default function UserGuidePage() {
  return (
    <main className="min-h-[60vh] bg-[#f7f2ea] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-[2rem] bg-slate-950 p-8 text-white">
          <p className="text-sm font-semibold text-amber-300">CateringOS</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">מדריך משתמש</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            הוראות ברורות לניהול קייטרинг מקצה לקצה — בעברית, מימין לשמאל.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300"
          >
            חזרה לדשבורד
          </Link>
        </header>

        <nav className="sticky top-20 z-40 rounded-2xl bg-white/95 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            תוכן עניינים
          </p>
          <ul className="flex flex-wrap gap-2 text-sm font-semibold">
            {[
              ["#start", "התחלה"],
              ["#nav", "ניווט"],
              ["#flow", "זרימה"],
              ["#customers", "לקוחות"],
              ["#events", "אירועים"],
              ["#menu", "תפריט"],
              ["#quotes", "הצעות"],
              ["#cost", "עלות"],
              ["#purchasing", "רכש"],
              ["#kitchen", "מטבח"],
              ["#finance", "כספים"],
              ["#import", "ייבוא"],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="rounded-xl bg-slate-100 px-3 py-1.5 text-slate-800 hover:bg-amber-100"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Section id="start" title="1. התחלה">
          <p>
            פתחו את כתובת המערכת בדפדפן (מקומית:{" "}
            <code className="rounded bg-slate-100 px-1">http://localhost:3000</code>
            ).
          </p>
          <p>
            אם מופיעה שגיאת טעינה — ודאו ש־PostgreSQL פועל (
            <code className="rounded bg-slate-100 px-1">npm run db:up</code>
            ), הריצו{" "}
            <code className="rounded bg-slate-100 px-1">npx prisma migrate deploy</code>
            , ובדקו ש־<code className="rounded bg-slate-100 px-1">DATABASE_URL</code>{" "}
            מוגדר ב־<code className="rounded bg-slate-100 px-1">.env</code>.
          </p>
          <Shot
            src="/guide/01-dashboard.png"
            alt="דשבורד CateringOS"
            caption="דשבורד — נקודת כניסה עם קיצורי דרך לכל המודולים."
          />
        </Section>

        <Section id="nav" title="2. סרגל ניווט">
          <ul className="list-disc pr-6">
            <li>
              <strong>דשבורד</strong> — מסך הבית
            </li>
            <li>
              <strong>לקוחות</strong> — רשימה ויצירה
            </li>
            <li>
              <strong>אירועים</strong> — תאריך, סועדים, סטטוס
            </li>
            <li>
              <strong>תפריט</strong> — מנות, חומרי גלם, מתכון
            </li>
            <li>
              <strong>הצעות</strong> — הצעות מחיר
            </li>
            <li>
              <strong>רכש</strong> — ספקים, מחירון, הזמנות
            </li>
            <li>
              <strong>מטבח</strong> — משימות הכנה
            </li>
            <li>
              <strong>כספים</strong> — תשלומים
            </li>
            <li>
              <strong>ייבוא</strong> — CSV מאקסל
            </li>
            <li>
              <strong>מדריך</strong> — העמוד הזה (
              <Link href="/guide" className="text-amber-900 underline">
                /guide
              </Link>
              )
            </li>
          </ul>
        </Section>

        <Section id="flow" title="3. זרימת עבודה מומלצת">
          <Steps
            items={[
              "יצירת לקוח (שם + טלפון חובה).",
              "פתיחת אירוע — תאריך, מספר מוזמנים, רמת שירות.",
              "הגדרת תפריט: מנות, חומרי גלם, שורות מתכון, מחירון ספקים.",
              "הצעת מחיר לאירוע + שורות מנות.",
              "שמירה עם סטטוס «אושרה» → משימות מטבח נוצרות אוטומטית.",
              "רכש (הזמנות), ביצוע במטבח, רישום תשלום בכספים.",
            ]}
          />
        </Section>

        <Section id="customers" title="4. לקוחות">
          <Steps
            items={[
              "לקוחות → לקוח חדש.",
              "מלאו שם, טלפון, סוג (פרטי/עסקי/מוסדי), פרטים נוספים.",
              "שמרו — מכרטיס הלקוח: עריכה, אירועים והצעות.",
            ]}
          />
        </Section>

        <Section id="events" title="5. אירועים">
          <Steps
            items={[
              "אירועים → אירוע חדש → בחרו לקוח.",
              "תאריך, שעה, מספר מוזמנים, רמת שירות, כתובת.",
              "בעמוד האירוע: הצעות, משימות מטבח, קישורים לרכש וכספים.",
            ]}
          />
        </Section>

        <Section id="menu" title="6. תפריט ועץ מוצר">
          <p className="font-semibold">חומרי גלם</p>
          <Steps
            items={[
              "תפריט → חומרי גלם → חומר חדש.",
              "יחידות זמינות: מנה, מגש, ק״ג, גרם, ליטר, יחידה.",
            ]}
          />
          <p className="mt-4 font-semibold">מנות ומתכון</p>
          <Steps
            items={[
              "תפריט → מנה חדשה (קטגוריה, יחידת מכירה, כמות בסיס).",
              "בעריכת מנה: הוסיפו רכיבי מתכון — כמות, יחידה (למשל גרם), פחת %.",
              "קטע «עלות משוערת לפי מחירון» — חישוב אוטומטי (סעיף 8).",
            ]}
          />
        </Section>

        <Section id="quotes" title="7. הצעות מחיר">
          <Steps
            items={[
              "הצעות → הצעה חדשה → בחרו אירוע.",
              "הוסיפו שורות: מנה, כמות, מחיר ליחידה.",
              "פרטי הצעה: הנחה, עלות פנימית, תנאי תשלום.",
              "סטטוס «אושרה» + שמירה → אירוע מאושר + משימות מטבח.",
            ]}
          />
        </Section>

        <Section id="cost" title="8. חישוב עלות">
          <p>העלות מחושבת מ:</p>
          <ul className="list-disc pr-6">
            <li>מתכון פעיל + פחת.</li>
            <li>מחירון ספקים (יחידת מחיר = יחידה במתכון).</li>
            <li>ספק מועדף או המחיר הזול ביותר.</li>
          </ul>
          <p>
            מוצג בעמוד המנה ובהצעה (עמודת «הערכת עלות»). מחירון: רכש → מחירון
            ספקים.
          </p>
        </Section>

        <Section id="purchasing" title="9. רכש">
          <Shot
            src="/guide/02-purchasing.png"
            alt="מרכז רכש"
            caption="מרכז רכש — ספקים, מחירון והזמנות."
          />
          <Steps
            items={[
              "ספקים — יצירה ועריכה; מחירון בכרטיס הספק.",
              "מחירון — מחיר לפי ספק + חומר + יחידה.",
              "הזמנות רכש — טיוטה, שורות, סטטוס; קישור לאירוע אופציונלי.",
            ]}
          />
        </Section>

        <Section id="kitchen" title="10. משימות מטבח">
          <p>
            <strong>אוטומטי:</strong> אישור הצעה עם מנות → משימה לכל מנה, תאריך
            עבודה = תאריך האירוע, הערה{" "}
            <code className="rounded bg-slate-100 px-1">[אוטו-הזמנה]</code>.
          </p>
          <Steps
            items={[
              "מטבח — כרטיסי משימות; עדכון סטטוס מהיר.",
              "משימה חדשה — יצירה ידנית.",
              "בעמוד האירוע — רשימת משימות.",
            ]}
          />
        </Section>

        <Section id="finance" title="11. כספים">
          <Steps
            items={[
              "כספים → רישום תשלום: לקוח, סכום, תאריך, אמצעי תשלום.",
              "קישור לאירוע — מהעמוד «פעולות מהירות» באירוע.",
            ]}
          />
        </Section>

        <Section id="import" title="12. ייבוא CSV">
          <Shot
            src="/guide/03-data-import.png"
            alt="ייבוא CSV"
            caption="ייבוא — בחירת סוג רשימה והעלאת קובץ."
          />
          <Steps
            items={[
              "ייבוא בסרגל.",
              "אקסל: שמירה בשם → CSV UTF-8.",
              "בחרו סוג (לקוחות, ספקים, מנות, מחירון, מתכון, אירועים…).",
              "שורה 1 = כותרות. סדר: לקוחות → אירועים; ספקים → חומרים → מנות → מחירון → מתכון.",
            ]}
          />
        </Section>
      </div>
    </main>
  );
}
