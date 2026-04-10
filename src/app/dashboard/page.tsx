import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSwimmerStats, getMyCoach } from "@/lib/db/profiles";
import { getPersonalBests } from "@/lib/db/competitions";
import { getCalendarEvents } from "@/lib/db/calendar";
import { getScheduledSessions } from "@/lib/db/schedule";
import { getStreakDays, getRecentSessions } from "@/lib/db/training";
import { GreetingCard } from "@/features/dashboard/greeting-card";
import { WeekStrip } from "@/features/dashboard/week-strip";
import { TodaySessionCard } from "@/features/dashboard/today-session-card";
import { AIInsightsCard } from "@/features/dashboard/ai-insights-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }
function addWeeks(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n * 7); return r; }

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now   = new Date();
  const today = isoDate(now);
  const from  = isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const to    = isoDate(addWeeks(now, 8));

  const [stats, pbs, streak, scheduledSessions, recentSessions] = await Promise.all([
    getSwimmerStats(user.id),
    getPersonalBests(user.id),
    getStreakDays(user.id),
    getScheduledSessions(user.id, from, to),
    getRecentSessions(user.id, 5),
  ]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "שחיין";
  const hour = now.getHours();
  const greeting = hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : "ערב טוב";

  // Today's scheduled session
  const todayScheduled = scheduledSessions.find((s) => s.start_time.slice(0, 10) === today) ?? null;

  // Today's logged session
  const todayLogged = recentSessions.find((s) => s.session_date === today) ?? null;

  return (
    <div className="p-4 space-y-5 max-w-xl mx-auto">

      {/* ── Greeting card ── */}
      <GreetingCard
        firstName={firstName}
        greeting={greeting}
        streak={streak}
        lastPb={pbs[0] ?? null}
        weeklyDone={stats?.sessions_this_week ?? 0}
        weeklyGoal={6}
      />

      {/* ── Training calendar section ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">יומן אימונים</h2>
          <Link
            href="/dashboard/calendar"
            className="text-xs text-signal-400 hover:text-signal-300 transition-colors flex items-center gap-1"
          >
            הצג הכל <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Week strip card */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏊‍♂️</span>
              <p className="text-sm font-bold text-gray-900">יומן אימוני</p>
            </div>
            <Link href="/dashboard/calendar" className="text-xs text-blue-500 flex items-center gap-0.5">
              הצג הכל <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <WeekStrip sessions={scheduledSessions} />
        </div>

        {/* Today's training */}
        <TodaySessionCard scheduled={todayScheduled} logged={todayLogged} />
      </div>

      {/* ── AI insights ── */}
      <AIInsightsCard stats={stats} pbs={pbs} />

    </div>
  );
}
