import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSwimmerStats } from "@/lib/db/profiles";
import { getPersonalBests } from "@/lib/db/competitions";
import { getScheduledSessions } from "@/lib/db/schedule";
import { getStreakDays, getRecentSessions } from "@/lib/db/training";
import { GreetingCard } from "@/features/dashboard/greeting-card";
import { DashboardCalendarSection } from "@/features/dashboard/calendar-section";
import { AIInsightsCard } from "@/features/dashboard/ai-insights-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }
function addWeeks(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n * 7); return r; }

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

      {/* ── Training calendar section (client — handles day selection) ── */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">יומן אימונים</h2>
        <DashboardCalendarSection
          scheduledSessions={scheduledSessions}
          recentSessions={recentSessions}
        />
      </div>

      {/* ── AI insights ── */}
      <AIInsightsCard stats={stats} pbs={pbs} />

    </div>
  );
}
