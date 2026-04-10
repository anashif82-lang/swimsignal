"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeekPoint {
  week:     string;
  distance: number;
  sessions: number;
}

interface Props {
  data: WeekPoint[];
}

function formatWeekLabel(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)}k`;
  return String(m);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const { distance, sessions } = payload[0].payload as WeekPoint;
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-xs shadow-raised">
      <p className="text-navy-300 mb-1 font-medium">שבוע של {formatWeekLabel(label)}</p>
      <p className="text-white font-mono">{distance.toLocaleString()} מ'</p>
      <p className="text-navy-400">{sessions} {sessions === 1 ? "אימון" : "אימונים"}</p>
    </div>
  );
}

export function VolumeChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="card-surface rounded-xl p-6">
        <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wide mb-4">
          נפח שבועי
        </h3>
        <div className="h-44 flex items-center justify-center text-navy-500 text-sm">
          אין אימונים מתועדים עדיין
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: d.week,
  }));

  return (
    <div className="card-surface rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">
          נפח שבועי
        </h3>
        <span className="text-xs text-navy-500">{data.length} שבועות אחרונים</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(30,54,96,0.6)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickFormatter={formatWeekLabel}
            tick={{ fill: "#3a66b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatDistance}
            tick={{ fill: "#3a66b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,212,255,0.05)" }} />
          <Bar
            dataKey="distance"
            fill="#00d4ff"
            fillOpacity={0.7}
            radius={[3, 3, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
