import { Waves, Trophy, Medal, Calendar } from "lucide-react";
import type { SwimmerStats } from "@/lib/db/analytics";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className="card-surface rounded-xl p-5 flex items-start gap-4">
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
        ${accent
          ? "bg-signal-400/10 border border-signal-400/20 text-signal-400"
          : "bg-navy-900 border border-surface-border text-navy-400"}
      `}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-navy-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-navy-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

interface Props {
  stats: SwimmerStats;
}

export function StatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Waves className="h-5 w-5" />}
        label="Total Sessions"
        value={stats.totalSessions}
        sub={`${stats.sessionsThisMonth} this month`}
        accent
      />
      <StatCard
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-4" />
        </svg>}
        label="Total Distance"
        value={`${stats.totalDistanceKm} km`}
        sub="all water sessions"
      />
      <StatCard
        icon={<Trophy className="h-5 w-5" />}
        label="Competitions"
        value={stats.totalCompetitions}
        sub="logged"
      />
      <StatCard
        icon={<Medal className="h-5 w-5" />}
        label="Personal Bests"
        value={stats.pbCount}
        sub="official"
        accent={stats.pbCount > 0}
      />
    </div>
  );
}
