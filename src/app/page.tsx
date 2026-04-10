import Link from "next/link";
import { ArrowRight, BarChart2, BookOpen, Trophy, Users, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--color-navy-950)" }}>
      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-surface-border bg-navy-950/90 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-signal-400/10 border border-signal-400/30 flex items-center justify-center group-hover:border-signal-400/60 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-signal-400"/>
                <circle cx="16" cy="7" r="2.5" fill="currentColor" className="text-signal-400"/>
              </svg>
            </div>
            <span className="font-bold text-white">SwimSignal</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">כניסה</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="signal" size="sm">הרשמה</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24 sm:py-32 px-6"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% -20%, #0d2040 0%, transparent 60%)",
          }}
        >
          {/* Grid decoration */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(var(--color-signal-400) 1px, transparent 1px), linear-gradient(90deg, var(--color-signal-400) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
            aria-hidden="true"
          />

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-signal-400/10 border border-signal-400/20 px-4 py-1.5 text-sm text-signal-400 font-medium mb-8">
              <Zap className="h-3.5 w-3.5" />
              פלטפורמת ביצועים לשחיינים תחרותיים
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
              קדם את השחייה שלך{" "}
              <span className="gradient-text">לרמה הבאה</span>
            </h1>

            <p className="text-xl text-navy-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              יומן אימונים ופלטפורמת אנליטיקה פרמיום לשחיינים תחרותיים ומאמניהם.
              תעד כל אימון. נתח כל תוצאה. השתפר בכל עונה.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button variant="signal" size="lg" className="gap-2 min-w-[180px]">
                  התחל בחינם
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="min-w-[180px]">
                  כניסה
                </Button>
              </Link>
            </div>

            {/* Signal bar decoration */}
            <div className="mt-16 flex justify-center gap-3">
              {[100, 65, 80, 45, 90, 70, 55].map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full"
                  style={{
                    height: `${h * 0.6}px`,
                    background: `linear-gradient(to top, var(--color-signal-400), var(--color-signal-300))`,
                    opacity: 0.4 + i * 0.05,
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <section className="border-y border-surface-border bg-surface-card/50 py-8">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
            {[
              { value: "25m & 50m", label: "אנליטיקת בריכה" },
              { value: "18+ אירועים", label: "אירועי שחייה במעקב" },
              { value: "RTL מלא", label: "ממשק בעברית" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-navy-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                כל מה שהאימון שלך צריך
              </h2>
              <p className="text-navy-400 max-w-xl mx-auto">
                בנוי לשחיינים רציניים שרוצים לראות את ההתקדמות בנתונים —
                לא רק להרגיש אותה במים.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: BookOpen,
                  title: "יומן אימונים",
                  desc: "תעד כל אימון עם סטים, מרחקים, זמנים ו-RPE. תצוגה שבועית עם מעקב מתוכנן מול בפועל.",
                  accent: "text-signal-400",
                },
                {
                  icon: BarChart2,
                  title: "אנליטיקת ביצועים",
                  desc: "גרפי התקדמות, מגמות עומס, השוואת שיאים אישיים וניתוח עונתי — מפוצל לפי אורך בריכה.",
                  accent: "text-success-400",
                },
                {
                  icon: Trophy,
                  title: "תחרויות ושיאים אישיים",
                  desc: "תעד תוצאות תחרויות, שיאים אישיים רשמיים, ועקוב אחר זמן יעד מול בפועל.",
                  accent: "text-warning-400",
                },
                {
                  icon: Users,
                  title: "לוח מחוונים למאמן",
                  desc: "מאמנים מנהלים שחיינים וקבוצות, מקצים אימונים, ועוקבים אחר ביצועים ממקום אחד.",
                  accent: "text-signal-400",
                },
                {
                  icon: Shield,
                  title: "פרטיות קודמת",
                  desc: "הנתונים שלך פרטיים כברירת מחדל. אתה שולט במה המאמן שלך יכול לראות ומתי.",
                  accent: "text-navy-300",
                },
                {
                  icon: Zap,
                  title: "מאמן AI (בקרוב)",
                  desc: "המלצות מבוססות נתונים על סמך עומס האימונים, מגמות השיאים האישיים ודפוסי הביצועים שלך.",
                  accent: "text-warning-400",
                },
              ].map(({ icon: Icon, title, desc, accent }) => (
                <div key={title} className="card-surface p-6 hover:card-raised transition-all group">
                  <div className={`mb-4 ${accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-navy-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── For Swimmers & Coaches ────────────────────────────────────────── */}
        <section className="py-24 px-6 border-t border-surface-border">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            {/* For Swimmers */}
            <div className="card-signal p-8">
              <div className="signal-bar mb-6 w-16" />
              <h3 className="text-xl font-bold text-white mb-3">לשחיינים</h3>
              <ul className="space-y-3">
                {[
                  "תעד אימוני מים ויבשה תוך שניות",
                  "עקוב אחר שיאים אישיים לפי אורך בריכה",
                  "דמיין מגמות שבועיות ועונתיות",
                  "התחבר למאמן שלך",
                  "הגדר ועקוב אחר יעדי ביצועים",
                  "השווה את עצמך לעונות קודמות",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-navy-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-signal-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup?role=swimmer" className="mt-8 inline-flex">
                <Button variant="signal" size="md" className="gap-2">
                  צור חשבון שחיין
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* For Coaches */}
            <div className="card-surface p-8">
              <div className="h-[3px] rounded-sm bg-navy-600 mb-6 w-16" />
              <h3 className="text-xl font-bold text-white mb-3">למאמנים</h3>
              <ul className="space-y-3">
                {[
                  "נהל את כל השחיינים שלך בלוח מחוונים אחד",
                  "צור קבוצות שחיינים ואימונים מובנים",
                  "עקוב אחר עומס אימונים ועמידה בסשנים",
                  "קצה אימונים מתוכננים לאנשים פרטיים או קבוצות",
                  "סקור תוצאות תחרויות ושיאים אישיים",
                  "אשר בקשות חיבור של שחיינים",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-navy-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-navy-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup?role=coach" className="mt-8 inline-flex">
                <Button variant="outline" size="md" className="gap-2">
                  צור חשבון מאמן
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 text-center border-t border-surface-border"
          style={{ background: "radial-gradient(ellipse 60% 80% at 50% 100%, #0d2040 0%, transparent 60%)" }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            מוכן לעלות רמה?
          </h2>
          <p className="text-navy-400 mb-8 max-w-md mx-auto">
            SwimSignal חינמי לתחילת השימוש. הירשם והגדר את הפרופיל שלך תוך פחות מ-3 דקות.
          </p>
          <Link href="/auth/signup">
            <Button variant="signal" size="lg" className="gap-2">
              התחל לעקוב היום
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-signal-400/10 border border-signal-400/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden="true">
                <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-signal-400"/>
                <circle cx="16" cy="7" r="2.5" fill="currentColor" className="text-signal-400"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">SwimSignal</span>
          </div>
          <p className="text-xs text-navy-500">
            &copy; {new Date().getFullYear()} SwimSignal. קדם את השחייה שלך לרמה הבאה.
          </p>
        </div>
      </footer>
    </div>
  );
}
