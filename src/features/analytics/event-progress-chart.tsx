"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { formatSwimTime } from "@/lib/utils";
import type { EventProgressPoint } from "@/lib/db/analytics";

interface Props {
  data: EventProgressPoint[];
}

function formatDateShort(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

// Recharts needs numeric Y values; we store ms but display as swim time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload as EventProgressPoint;
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-xs shadow-raised">
      <p className="text-navy-300 font-medium mb-1">{pt.competition_name}</p>
      <p className="text-signal-300 font-mono text-sm font-bold">{pt.final_time}</p>
      <p className="text-navy-400">{formatDateShort(pt.competition_date)}</p>
      {pt.is_personal_best && (
        <p className="text-success-400 font-medium mt-1">Personal Best ★</p>
      )}
    </div>
  );
}

export function EventProgressChart({ data }: Props) {
  // Build sorted unique event list from data
  const eventOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { value: string; label: string }[] = [];
    for (const pt of data) {
      if (!seen.has(pt.event_name)) {
        seen.add(pt.event_name);
        opts.push({ value: pt.event_name, label: pt.event_name });
      }
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const [selectedEvent, setSelectedEvent] = useState<string>(
    eventOptions[0]?.value ?? ""
  );

  const chartData = useMemo(
    () => data.filter((pt) => pt.event_name === selectedEvent),
    [data, selectedEvent]
  );

  // Y axis: invert so lower time = higher on chart (better performance up)
  const times = chartData.map((d) => d.final_time_ms);
  const minMs = times.length ? Math.min(...times) : 0;
  const maxMs = times.length ? Math.max(...times) : 1;
  const padding = (maxMs - minMs) * 0.15 || 1000;
  const yMin = Math.max(0, minMs - padding);
  const yMax = maxMs + padding;

  if (data.length === 0) {
    return (
      <div className="card-surface rounded-xl p-6">
        <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wide mb-4">
          Event Progress
        </h3>
        <div className="h-52 flex items-center justify-center text-navy-500 text-sm">
          No competition results logged yet
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">
          Event Progress
        </h3>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="input-dark text-sm h-8 px-2 py-0 min-w-[180px] cursor-pointer"
        >
          {eventOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {chartData.length < 2 ? (
        <div className="h-52 flex items-center justify-center text-navy-500 text-sm">
          {chartData.length === 0
            ? "No results for this event"
            : "Need at least 2 results to show a trend"}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(30,54,96,0.6)"
              vertical={false}
            />
            <XAxis
              dataKey="competition_date"
              tickFormatter={formatDateShort}
              tick={{ fill: "#3a66b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[yMin, yMax]}
              reversed
              tickFormatter={(ms) => formatSwimTime(ms)}
              tick={{ fill: "#3a66b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="final_time_ms"
              stroke="#00d4ff"
              strokeWidth={2}
              dot={{ r: 4, fill: "#00d4ff", stroke: "#071527", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#40e0ff", stroke: "#071527", strokeWidth: 2 }}
            />
            {/* Highlight PB points */}
            {chartData
              .filter((pt) => pt.is_personal_best)
              .map((pt, i) => (
                <ReferenceDot
                  key={i}
                  x={pt.competition_date}
                  y={pt.final_time_ms}
                  r={7}
                  fill="transparent"
                  stroke="#4ade80"
                  strokeWidth={2}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {chartData.length >= 2 && (() => {
        const first = chartData[0].final_time_ms;
        const last  = chartData[chartData.length - 1].final_time_ms;
        const diffMs = first - last; // positive = improvement
        const pct    = ((diffMs / first) * 100).toFixed(1);
        if (diffMs === 0) return null;
        return (
          <p className={`text-xs mt-3 ${diffMs > 0 ? "text-success-400" : "text-danger-400"}`}>
            {diffMs > 0 ? "▼" : "▲"} {Math.abs(diffMs / 10).toFixed(0)} hundredths ({Math.abs(Number(pct))}%)
            {diffMs > 0 ? " improvement" : " slower"} over {chartData.length} results
          </p>
        );
      })()}
    </div>
  );
}
