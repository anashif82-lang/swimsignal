"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Waves, Calendar, ArrowUpDown, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { SWIM_EVENTS, STROKE_LABELS, type PersonalBest, type PoolLength, type StrokeType } from "@/types";

type PoolFilter   = "all" | PoolLength;
type StrokeFilter = "all" | StrokeType;
type SortKey      = "date_desc" | "date_asc" | "time_asc" | "distance_asc";

const POOL_OPTS: { value: PoolFilter; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "25m", label: "25 מ׳" },
  { value: "50m", label: "50 מ׳" },
];

const STROKE_OPTS: { value: StrokeFilter; label: string }[] = [
  { value: "all",               label: "כל הסגנונות" },
  { value: "freestyle",         label: STROKE_LABELS.freestyle.he         },
  { value: "backstroke",        label: STROKE_LABELS.backstroke.he        },
  { value: "breaststroke",      label: STROKE_LABELS.breaststroke.he      },
  { value: "butterfly",         label: STROKE_LABELS.butterfly.he         },
  { value: "individual_medley", label: STROKE_LABELS.individual_medley.he },
];

const SORT_OPTS: { value: SortKey; label: string }[] = [
  { value: "date_desc",    label: "חדש ביותר" },
  { value: "date_asc",     label: "ישן ביותר" },
  { value: "time_asc",     label: "מהיר ביותר" },
  { value: "distance_asc", label: "מרחק" },
];

function eventLabelHe(event_name: string): string {
  return SWIM_EVENTS.find((e) => e.key === event_name)?.labelHe ?? event_name;
}

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  pbs:             PersonalBest[];
  iswimConnected:  boolean;
}

export function PersonalBestsList({ pbs, iswimConnected }: Props) {
  const [pool,   setPool]   = useState<PoolFilter>("all");
  const [stroke, setStroke] = useState<StrokeFilter>("all");
  const [sort,   setSort]   = useState<SortKey>("date_desc");

  const filtered = useMemo(() => {
    let rows = pbs;
    if (pool   !== "all") rows = rows.filter((p) => p.pool_length === pool);
    if (stroke !== "all") rows = rows.filter((p) => p.stroke      === stroke);

    const sorted = [...rows];
    switch (sort) {
      case "date_desc":    sorted.sort((a, b) => b.achieved_at.localeCompare(a.achieved_at)); break;
      case "date_asc":     sorted.sort((a, b) => a.achieved_at.localeCompare(b.achieved_at)); break;
      case "time_asc":     sorted.sort((a, b) => a.time_ms - b.time_ms);                      break;
      case "distance_asc": sorted.sort((a, b) => a.distance - b.distance || a.time_ms - b.time_ms); break;
    }
    return sorted;
  }, [pbs, pool, stroke, sort]);

  if (pbs.length === 0) {
    return (
      <div className="mat-card flex flex-col items-center gap-3 py-10 px-6 text-center">
        <Trophy className="h-10 w-10" style={{ color: "#FF9500", opacity: 0.5 }} />
        <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>עדיין אין שיאים</p>
        <p className="text-xs" style={{ color: "#667085" }}>
          {iswimConnected
            ? "סנכרן שוב מאיגוד השחייה כדי לשלוף את השיאים שלך."
            : "חבר את הפרופיל שלך לאיגוד השחייה בישראל כדי לשלוף אוטומטית את כל השיאים הרשמיים."}
        </p>
        <Link
          href="/dashboard/profile"
          className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-[0.97]"
          style={{ background: "#007AFF", boxShadow: "0 2px 8px rgba(0,122,255,0.30)" }}
        >
          {iswimConnected ? "סנכרן עכשיו" : "חבר לאיגוד השחייה"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="mat-card p-3 space-y-3">
        <FilterRow
          icon={<Waves className="h-3.5 w-3.5" style={{ color: "#007AFF" }} />}
          opts={POOL_OPTS}
          value={pool}
          onChange={(v) => setPool(v as PoolFilter)}
        />
        <FilterRow
          icon={<Trophy className="h-3.5 w-3.5" style={{ color: "#FF9500" }} />}
          opts={STROKE_OPTS}
          value={stroke}
          onChange={(v) => setStroke(v as StrokeFilter)}
        />
        <FilterRow
          icon={<ArrowUpDown className="h-3.5 w-3.5" style={{ color: "#5856D6" }} />}
          opts={SORT_OPTS}
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="mat-card py-8 text-center text-sm" style={{ color: "#94A3B8" }}>
          אין תוצאות לסינון הזה
        </div>
      ) : (
        <div className="mat-card overflow-hidden">
          {filtered.map((pb, idx) => (
            <div
              key={pb.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                idx > 0 && "border-t border-gray-100"
              )}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,122,255,0.10)" }}
              >
                <span className="text-[10px] font-bold" style={{ color: "#007AFF" }}>
                  {pb.distance}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#0F172A" }}>
                  {eventLabelHe(pb.event_name)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "#F1F5F9", color: "#64748B" }}>
                    {pb.pool_length}
                  </span>
                  <span className="flex items-center gap-0.5 text-[11px]" style={{ color: "#94A3B8" }}>
                    <Calendar className="h-3 w-3" />
                    {fmtDate(pb.achieved_at)}
                  </span>
                </div>
                {pb.notes && (
                  <p className="text-[10px] truncate mt-0.5" style={{ color: "#94A3B8" }}>
                    {pb.notes}
                  </p>
                )}
              </div>

              <div className="text-end shrink-0">
                <p className="text-base font-bold tabular-nums" style={{ color: "#007AFF" }}>
                  {pb.time_text}
                </p>
                {pb.source === "iswim" && (
                  <p className="text-[9px] mt-0.5" style={{ color: "#94A3B8" }}>איגוד השחייה</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-[11px]" style={{ color: "#94A3B8" }}>
        {filtered.length} מתוך {pbs.length} שיאים
      </p>
    </div>
  );
}

function FilterRow<T extends string>({
  icon,
  opts,
  value,
  onChange,
}: {
  icon:     React.ReactNode;
  opts:     { value: T; label: string }[];
  value:    T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
      <span className="shrink-0">{icon}</span>
      <div className="flex gap-1.5">
        {opts.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all duration-[120ms] active:scale-[0.94]"
            style={value === o.value ? {
              background: "#007AFF",
              color: "#fff",
              boxShadow: "0 1px 4px rgba(0,122,255,0.30)",
            } : {
              background: "#F1F5F9",
              color: "#64748B",
              border: "1px solid rgba(226,232,240,0.80)",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
