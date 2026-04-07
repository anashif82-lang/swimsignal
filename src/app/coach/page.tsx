import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Activity, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPendingConnectionRequests, getCoachSwimmers } from "@/lib/db/profiles";
import { StatsCard } from "@/features/dashboard/stats-card";
import { PendingRequests } from "@/features/coach/pending-requests";
import { SwimmersList } from "@/features/coach/swimmers-list";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Coach Dashboard" };

export default async function CoachDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [pendingRequests, swimmers, profile] = await Promise.all([
    getPendingConnectionRequests(user.id),
    getCoachSwimmers(user.id),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  const firstName = profile.data?.full_name?.split(" ")[0] ?? "Coach";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome, {firstName}
          </h1>
          <p className="text-navy-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatsCard
          label="Active Swimmers"
          value={swimmers.length}
          icon={Users}
          accent="signal"
          className="animate-fade-in"
        />
        <StatsCard
          label="Pending Requests"
          value={pendingRequests.length}
          icon={Activity}
          accent={pendingRequests.length > 0 ? "warning" : "default"}
          className="animate-fade-in"
        />
        <StatsCard
          label="Groups"
          value="0"
          sub="swimmer groups"
          icon={Users}
          className="animate-fade-in"
        />
        <StatsCard
          label="Workouts"
          value="0"
          sub="templates created"
          icon={TrendingUp}
          className="animate-fade-in"
        />
      </div>

      {/* ── Pending connection requests ────────────────────────────────────── */}
      {pendingRequests.length > 0 && (
        <PendingRequests requests={pendingRequests} />
      )}

      {/* ── Swimmers list ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Your Swimmers</h2>
          <Link href="/coach/swimmers" className="text-xs text-signal-400 hover:text-signal-300 transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="card-surface p-4">
          <SwimmersList connections={swimmers.slice(0, 10)} />
        </div>
      </div>
    </div>
  );
}
