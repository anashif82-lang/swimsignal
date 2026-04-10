"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import type { PersonalBest, PoolLength } from "@/types";
import { STROKE_LABELS, SWIM_EVENTS } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  pbs25: PersonalBest[];
  pbs50: PersonalBest[];
}

export function PbGrid({ pbs25, pbs50 }: Props) {
  const [pool, setPool] = useState<PoolLength>("50m");
  const pbs = pool === "25m" ? pbs25 : pbs50;

  // Group by stroke
  const byStroke = new Map<string, PersonalBest[]>();
  for (const pb of pbs) {
    const existing = byStroke.get(pb.stroke) ?? [];
    byStroke.set(pb.stroke, [...existing, pb]);
  }

  const hasAny = pbs.length > 0;

  return (
    <div className="space-y-5">
      {/* Pool length toggle */}
      <div className="flex gap-1 p-1 bg-navy-900 rounded-lg w-fit">
        {(["50m", "25m"] as PoolLength[]).map((pl) => (
          <button
            key={pl}
            type="button"
            onClick={() => setPool(pl)}
            className={cn(
              "px-5 py-1.5 rounded-md text-sm font-medium transition-colors",
              pool === pl
                ? "bg-navy-800 text-white"
                : "text-navy-400 hover:text-navy-200"
            )}
          >
            {pl}
          </button>
        ))}
      </div>

      {!hasAny ? (
        <div className="card-surface rounded-xl p-12 text-center">
          <Trophy className="h-10 w-10 text-navy-600 mx-auto mb-3" />
          <p className="text-navy-300 font-medium">אין שיאים אישיים עבור {pool}</p>
          <p className="text-navy-500 text-sm mt-1">
            שיאים אישיים נרשמים אוטומטית כשמסמנים תוצאה כשיא אישי רשמי.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byStroke.entries()).map(([stroke, records]) => (
            <div key={stroke} className="card-surface rounded-xl overflow-hidden">
              {/* Stroke header */}
              <div className="px-5 py-3 border-b border-surface-border bg-navy-900/40 flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {STROKE_LABELS[stroke as keyof typeof STROKE_LABELS]?.en ?? stroke}
                </span>
                <span className="text-xs text-navy-500">
                  {records.length} {records.length === 1 ? "שיא אישי" : "שיאים אישיים"}
                </span>
              </div>

              {/* PB rows */}
              <div className="divide-y divide-surface-border">
                {/* Column headers */}
                <div className="px-5 py-2 grid grid-cols-[auto_1fr_auto_auto] gap-4 text-xs text-navy-500 uppercase tracking-wide font-medium">
                  <span>מרחק</span>
                  <span />
                  <span className="text-end">זמן</span>
                  <span className="text-end">תאריך</span>
                </div>

                {records
                  .sort((a, b) => a.distance - b.distance)
                  .map((pb) => {
                    const event = SWIM_EVENTS.find(
                      (e) => e.stroke === pb.stroke && e.distance === pb.distance
                    );
                    return (
                      <div
                        key={pb.id}
                        className="px-5 py-3 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center"
                      >
                        {/* Distance chip */}
                        <span className="text-xs font-mono font-medium text-navy-400 w-12">
                          {pb.distance}m
                        </span>

                        {/* Event label */}
                        <span className="text-sm text-navy-300 truncate">
                          {event?.label ?? `${pb.distance}m ${pb.stroke}`}
                        </span>

                        {/* Time */}
                        <span className="font-mono text-sm font-bold text-signal-300 text-end">
                          {pb.time_text}
                        </span>

                        {/* Date */}
                        <span className="text-xs text-navy-500 text-end whitespace-nowrap">
                          {formatDate(pb.achieved_at, "en-US")}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
