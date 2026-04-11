import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSwimmerStats } from "@/lib/db/profiles";
import { getPersonalBests } from "@/lib/db/competitions";
import { getScheduledSessions } from "@/lib/db/schedule";
import { getStreakDays, getRecentSessions } from "@/lib/db/training";
import { GreetingCard } from "@/features/dashboard/greeting-card";
import { DashboardCalendarSection } from "@/features/dashboard/calendar-section";
import { AIInsightsCard } from "@/features/dashboard/ai-insights-card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }
function addWeeks(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n * 7); return r; }

function SwimmerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="4" r="2.2" fill="#374151" />
      <path d="M18 7 L11 11 L7 9.5 L3 12" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 11 L9 15" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2 17 Q5 15 8 17 Q11 19 14 17 Q17 15 20 17 Q23 19 25 17" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now  = new Date();
  const from = isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const to   = isoDate(addWeeks(now, 8));

  const [stats, pbs, streak, scheduledSessions, recentSessions] = await Promise.all([
    getSwimmerStats(user.id),
    getPersonalBests(user.id),
    getStreakDays(user.id),
    getScheduledSessions(user.id, from, to),
    getRecentSessions(user.id, 14),
  ]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "שחיין";
  const hour      = now.getHours();
  const greeting  = hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : "ערב טוב";

  return (
    <div className="max-w-xl mx-auto">

      {/* ── Greeting (dark background inherited from layout) ── */}
      <div className="px-4 pt-4 pb-10">
        <GreetingCard
          firstName={firstName}
          greeting={greeting}
          streak={streak}
          lastPb={pbs[0] ?? null}
          weeklyDone={stats?.sessions_this_week ?? 0}
          weeklyGoal={6}
        />
      </div>

      {/* ── Light section: overlaps greeting with soft rounded top ── */}
      <div
        className="-mt-6 rounded-[28px] px-4 pt-5 pb-8 space-y-5"
        style={{
          background: "#F8FAFC",
          boxShadow: "0 -8px 28px rgba(0,0,0,0.10), 0 -2px 6px rgba(0,0,0,0.05)",
        }}
      >
        {/* Calendar header */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SwimmerIcon />
          </div>
          <h2 className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-gray-900">יומן אימונים</h2>
          <Link
            href="/dashboard/calendar"
            className="text-xs text-blue-500 font-medium hover:text-blue-600 transition-colors"
          >
            הצג הכל ←
          </Link>
        </div>

        {/* Calendar cards */}
        <DashboardCalendarSection
          scheduledSessions={scheduledSessions}
          recentSessions={recentSessions}
        />

        {/* AI insights — secondary, below calendar */}
        <AIInsightsCard stats={stats} pbs={pbs} />

      </div>

    </div>
  );
}
