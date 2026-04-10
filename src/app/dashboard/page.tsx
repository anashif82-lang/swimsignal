import { redirect } from "next/navigation";
import Link from "next/link";
import { Waves, Trophy, Plus, ArrowRight, Activity, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSwimmerStats, getMyCoach } from "@/lib/db/profiles";
import { getPersonalBests } from "@/lib/db/competitions";
import { getCalendarEvents } from "@/lib/db/calendar";
import { getScheduledSessions } from "@/lib/db/schedule";
import { StatsCard } from "@/features/dashboard/stats-card";
import { ScheduleCalendar } from "@/features/calendar/schedule-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
function isoDate(d: Date) { return d.toISOString().slice(0, 10); }
function addWeeks(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n * 7); return r; }
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  const from  = isoDate(new Date(year, month - 2, 1));
  const to    = isoDate(addWeeks(now, 12));

  const [stats, pbs, coachConnection, calendarData, scheduledSessions] = await Promise.all([
    getSwimmerStats(user.id),
    getPersonalBests(user.id),
    getMyCoach(user.id),
    getCalendarEvents(user.id, year, month),
    getScheduledSessions(user.id, from, to),
  ]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "שחיין";
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "בוקר טוב" :
    hour < 17 ? "צהריים טובים" : "ערב טוב";

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col gap-5 md:gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {greeting}, {firstName}
          </h1>
          <p className="text-navy-400 text-xs md:text-sm mt-0.5">
            {now.toLocaleDateString("he-IL", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/dashboard/training/new" className="hidden md:block">
          <Button variant="signal" className="gap-2">
            <Plus className="h-4 w-4" /> תעד אימון
          </Button>
        </Link>
      </div>

      {/* ── Coach banner ── */}
      {!coachConnection && (
        <div className="card-signal p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">התחבר למאמן שלך</p>
            <p className="text-xs text-navy-400 mt-0.5">קבל אימונים מותאמים אישית ומשוב</p>
          </div>
          <Link href="/dashboard/profile">
            <Button variant="outline" size="sm" className="shrink-0">
              מצא מאמן <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {coachConnection && (
        <div className="card-surface p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-navy-200">
              {(coachConnection.coach?.full_name ?? "C").charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-[10px] text-navy-400 uppercase tracking-wide">המאמן שלך</p>
            <p className="text-sm font-semibold text-white">{coachConnection.coach?.full_name ?? "מאמן"}</p>
          </div>
          <Badge variant="success" className="ms-auto">מחובר</Badge>
        </div>
      )}

      {/* ── Stats (compact) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="השבוע"  value={stats?.sessions_this_week  ?? 0} sub="אימונים" icon={Activity} accent="signal" />
        <StatsCard label="החודש"  value={stats?.sessions_this_month ?? 0} sub="אימונים" icon={Calendar} />
        <StatsCard label="מרחק"   value={stats ? `${stats.total_distance_km}km` : "0km"} sub="סה״כ" icon={Waves} />
        <StatsCard label="שיאים"  value={stats?.pb_count ?? 0} sub="אישיים" icon={Trophy} accent="success" />
      </div>

      {/* ── Calendar (main focus) ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">יומן אימונים</h2>
          <Link
            href="/dashboard/calendar"
            className="text-xs text-signal-400 hover:text-signal-300 transition-colors flex items-center gap-1"
          >
            מסך מלא <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {/* Fixed height calendar on dashboard */}
        <div className="h-[520px] md:h-[600px]">
          <ScheduleCalendar
            initialSessions={scheduledSessions}
            calendarData={calendarData}
            calendarYear={year}
            calendarMonth={month}
          />
        </div>
      </div>

      {/* ── Personal Bests ── */}
      {pbs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">שיאים אישיים</h2>
            <Link href="/dashboard/competitions" className="text-xs text-signal-400 hover:text-signal-300 transition-colors flex items-center gap-1">
              הכל <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="card-surface p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {pbs.slice(0, 6).map((pb) => (
              <div key={pb.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0 md:odd:border-b">
                <div>
                  <p className="text-xs font-medium text-navy-200">
                    {pb.event_name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-[10px] text-navy-500">{pb.pool_length}</p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-mono font-bold text-signal-400">{pb.time_text}</p>
                  <p className="text-[10px] text-navy-500">{formatDate(pb.achieved_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
