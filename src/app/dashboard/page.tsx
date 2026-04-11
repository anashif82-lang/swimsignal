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
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="20" cy="5.5" r="2.2" fill="#1e3a5f" />
      {/* Body + arm stroke */}
      <path
        d="M18 8.5 L11 12 L7 10.5 L3 13"
        stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Legs */}
      <path
        d="M11 12 L9 16"
        stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round"
      />
      {/* Water waves */}
      <path
        d="M2 19 Q5 17 8 19 Q11 21 14 19 Q17 17 20 19 Q23 21 25 19"
        stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" fill="none"
      />
      <path
        d="M2 22 Q5 20 8 22 Q11 24 14 22 Q17 20 20 22 Q23 24 25 22"
        stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"
      />
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
    <div className="flex flex-col min-h-screen">

      {/* ── Dark top section ── */}
      <div className="px-4 pt-4 pb-16">
        <div className="max-w-xl mx-auto">
          <GreetingCard
            firstName={firstName}
            greeting={greeting}
            streak={streak}
            lastPb={pbs[0] ?? null}
            weeklyDone={stats?.sessions_this_week ?? 0}
            weeklyGoal={6}
          />
        </div>
      </div>

      {/* ── Floating light card — overlaps dark section ── */}
      <div
        className="flex-1 -mt-10 rounded-t-[36px]"
        style={{
          background: "#F8FAFC",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.18), 0 -4px 16px rgba(0,0,0,0.07)",
        }}
      >
        <div className="max-w-xl mx-auto px-4 pt-6 pb-24 space-y-5">

          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SwimmerIcon />
              <h2 className="text-base font-bold text-gray-900">יומן אימונים</h2>
            </div>
            <Link
              href="/dashboard/calendar"
              className="text-xs text-blue-500 font-medium hover:text-blue-600 transition-colors"
            >
              הצג הכל ←
            </Link>
          </div>

          {/* Calendar section */}
          <DashboardCalendarSection
            scheduledSessions={scheduledSessions}
            recentSessions={recentSessions}
          />

          {/* AI insights */}
          <AIInsightsCard stats={stats} pbs={pbs} />

        </div>
      </div>

    </div>
  );
}
