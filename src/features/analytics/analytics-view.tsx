import type { SwimmerStats, EventProgressPoint } from "@/lib/db/analytics";
import { StatsCards } from "./stats-cards";
import { VolumeChart } from "./volume-chart";
import { EventProgressChart } from "./event-progress-chart";

interface WeekPoint {
  week:     string;
  distance: number;
  sessions: number;
}

interface Props {
  stats:       SwimmerStats;
  weeklyVolume: WeekPoint[];
  eventData:   EventProgressPoint[];
}

export function AnalyticsView({ stats, weeklyVolume, eventData }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-navy-400 text-sm mt-0.5">Your performance overview</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VolumeChart data={weeklyVolume} />
        <EventProgressChart data={eventData} />
      </div>
    </div>
  );
}
