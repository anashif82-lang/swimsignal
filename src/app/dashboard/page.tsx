import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Waves, Dumbbell, Trophy, TrendingUp, Plus, ArrowRight,
  Target, Activity, Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSwimmerStats, getMyCoach } from "@/lib/db/profiles";
import { getRecentSessions } from "@/lib/db/training";
import { getPersonalBests } from "@/lib/db/competitions";
import { StatsCard } from "@/features/dashboard/stats-card";
import { RecentSessions } from "@/features/dashboard/recent-sessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatSwimTime } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [stats, recentSessions, pbs, coachConnection] = await Promise.all([
    getSwimmerStats(user.id),
    getRecentSessions(user.id, 7),
    getPersonalBests(user.id),
    getMyCoach(user.id),
  ]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "Swimmer";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {firstName}
          </h1>
          <p className="text-navy-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <Link href="/dashboard/training/new">
          <Button variant="signal" className="gap-2">
            <Plus className="h-4 w-4" />
            Log Session
          </Button>
        </Link>
      </div>

      {/* ── Coach banner ───────────────────────────────────────────────────── */}
      {!coachConnection && (
        <div className="card-signal p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Connect with your coach</p>
            <p className="text-xs text-navy-400 mt-0.5">
              Link your account to get personalized workouts and feedback
            </p>
          </div>
          <Link href="/dashboard/profile">
            <Button variant="outline" size="sm" className="shrink-0">
              Find coach
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {coachConnection && (
        <div className="card-surface p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-navy-200">
              {(coachConnection.coach?.full_name ?? "C").charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs text-navy-400 font-medium uppercase tracking-wide">Your Coach</p>
            <p className="text-sm font-semibold text-white">
              {coachConnection.coach?.full_name ?? "Coach"}
            </p>
          </div>
          <Badge variant="success" className="ms-auto">Connected</Badge>
        </div>
      )}

      {/* ── Stats grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatsCard
          label="Sessions this week"
          value={stats?.sessions_this_week ?? 0}
          icon={Activity}
          accent="signal"
          className="animate-fade-in"
        />
        <StatsCard
          label="This month"
          value={stats?.sessions_this_month ?? 0}
          sub="sessions"
          icon={Calendar}
          className="animate-fade-in"
        />
        <StatsCard
          label="Total distance"
          value={stats ? `${stats.total_distance_km}km` : "0km"}
          sub="all time"
          icon={Waves}
          accent="default"
          className="animate-fade-in"
        />
        <StatsCard
          label="Personal bests"
          value={stats?.pb_count ?? 0}
          sub="official records"
          icon={Trophy}
          accent="success"
          className="animate-fade-in"
        />
      </div>

      {/* ── Main content grid ──────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent sessions (2/3) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Sessions</h2>
            <Link
              href="/dashboard/training"
              className="text-xs text-signal-400 hover:text-signal-300 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="card-surface">
            <div className="p-4">
              <RecentSessions sessions={recentSessions} />
            </div>
          </div>
        </div>

        {/* Personal Bests sidebar (1/3) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Personal Bests</h2>
            <Link
              href="/dashboard/competitions"
              className="text-xs text-signal-400 hover:text-signal-300 transition-colors flex items-center gap-1"
            >
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="card-surface p-4">
            {pbs.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-8 w-8 text-navy-600 mx-auto mb-2" />
                <p className="text-sm text-navy-400">No PBs recorded yet</p>
                <Link
                  href="/dashboard/competitions"
                  className="text-xs text-signal-400 mt-2 block hover:text-signal-300 transition-colors"
                >
                  Add competition results
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {pbs.slice(0, 8).map((pb) => (
                  <div
                    key={pb.id}
                    className="flex items-center justify-between py-2 border-b border-surface-border last:border-0"
                  >
                    <div>
                      <p className="text-xs font-medium text-navy-200">
                        {pb.event_name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                      <p className="text-[10px] text-navy-500">{pb.pool_length} pool</p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-mono font-bold text-signal-400">
                        {pb.time_text}
                      </p>
                      <p className="text-[10px] text-navy-500">{formatDate(pb.achieved_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
