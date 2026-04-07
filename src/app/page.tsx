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
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="signal" size="sm">Get started</Button>
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
              Performance platform for competitive swimmers
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
              Signal your{" "}
              <span className="gradient-text">next level</span>
              {" "}swimming
            </h1>

            <p className="text-xl text-navy-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              The premium training journal and analytics platform built for competitive swimmers and their coaches.
              Track every session. Analyze every result. Improve every season.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button variant="signal" size="lg" className="gap-2 min-w-[180px]">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="min-w-[180px]">
                  Sign in
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
              { value: "25m & 50m", label: "Pool analytics" },
              { value: "18+ events", label: "Swim events tracked" },
              { value: "Full RTL", label: "Hebrew-first interface" },
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
                Everything your training needs
              </h2>
              <p className="text-navy-400 max-w-xl mx-auto">
                Built for serious swimmers who want to see progress in the data —
                not just feel it in the water.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: BookOpen,
                  title: "Training Journal",
                  desc: "Log every session with sets, distances, times, and RPE. Weekly view with planned vs actual tracking.",
                  accent: "text-signal-400",
                },
                {
                  icon: BarChart2,
                  title: "Performance Analytics",
                  desc: "Progress graphs, load trends, PB comparison, and seasonal analysis — split by pool length.",
                  accent: "text-success-400",
                },
                {
                  icon: Trophy,
                  title: "Competitions & PBs",
                  desc: "Record competition results, official personal bests, and track goal vs actual times.",
                  accent: "text-warning-400",
                },
                {
                  icon: Users,
                  title: "Coach Dashboard",
                  desc: "Coaches manage swimmers and groups, assign workouts, and monitor performance from one place.",
                  accent: "text-signal-400",
                },
                {
                  icon: Shield,
                  title: "Privacy First",
                  desc: "Your data is private by default. You control what your coach can see and when.",
                  accent: "text-navy-300",
                },
                {
                  icon: Zap,
                  title: "AI Coach (coming soon)",
                  desc: "Data-driven recommendations based on your training load, PB trends, and performance patterns.",
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
              <h3 className="text-xl font-bold text-white mb-3">For Swimmers</h3>
              <ul className="space-y-3">
                {[
                  "Log water and dryland training in seconds",
                  "Track personal bests by pool length",
                  "Visualize weekly and seasonal trends",
                  "Connect with your coach",
                  "Set and monitor performance goals",
                  "Compare yourself to past seasons",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-navy-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-signal-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup?role=swimmer" className="mt-8 inline-flex">
                <Button variant="signal" size="md" className="gap-2">
                  Create swimmer account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* For Coaches */}
            <div className="card-surface p-8">
              <div className="h-[3px] rounded-sm bg-navy-600 mb-6 w-16" />
              <h3 className="text-xl font-bold text-white mb-3">For Coaches</h3>
              <ul className="space-y-3">
                {[
                  "Manage all your swimmers in one dashboard",
                  "Create swimmer groups and structured workouts",
                  "Monitor training load and session compliance",
                  "Assign planned workouts to individuals or groups",
                  "Review competition results and PBs",
                  "Approve swimmer connection requests",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-navy-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-navy-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup?role=coach" className="mt-8 inline-flex">
                <Button variant="outline" size="md" className="gap-2">
                  Create coach account
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
            Ready to level up?
          </h2>
          <p className="text-navy-400 mb-8 max-w-md mx-auto">
            SwimSignal is free to get started. Sign up and set up your profile in under 3 minutes.
          </p>
          <Link href="/auth/signup">
            <Button variant="signal" size="lg" className="gap-2">
              Start tracking today
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
            &copy; {new Date().getFullYear()} SwimSignal. Signal your next level swimming.
          </p>
        </div>
      </footer>
    </div>
  );
}
