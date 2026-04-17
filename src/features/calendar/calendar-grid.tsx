"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Waves, Trophy } from "lucide-react";
import type { CalendarData, CalendarTraining, CalendarCompetition } from "@/lib/db/calendar";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳", "א׳"];

const TYPE_DOT: Record<string, string> = {
  water:   "#007AFF",
  dryland: "#FF9500",
  gym:     "#8E8E93",
  other:   "#8E8E93",
};

interface DayDetail {
  date:         string;
  trainings:    CalendarTraining[];
  competitions: CalendarCompetition[];
}

interface Props {
  data:  CalendarData;
  year:  number;
  month: number;
}

export function CalendarGrid({ data, year, month }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<DayDetail | null>(null);

  // Build a map: ISO date → events
  const trainingMap = new Map<string, CalendarTraining[]>();
  const compMap     = new Map<string, CalendarCompetition[]>();
  for (const t of data.trainings) {
    trainingMap.set(t.date, [...(trainingMap.get(t.date) ?? []), t]);
  }
  for (const c of data.competitions) {
    compMap.set(c.date, [...(compMap.get(c.date) ?? []), c]);
  }

  // Build grid: 42 cells (6 rows × 7 cols), Mon-first
  const firstDay  = new Date(year, month - 1, 1);
  const lastDay   = new Date(year, month, 0).getDate();
  // getDay() is 0=Sun, so convert to Mon-first index
  const startDow  = (firstDay.getDay() + 6) % 7; // 0=Mon
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ];
  // pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);

  const today     = new Date();
  const todayISO  = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function navigate(delta: number) {
    let y = year, m = month + delta;
    if (m < 1)  { m = 12; y--; }
    if (m > 12) { m = 1;  y++; }
    startTransition(() =>
      router.push(`/dashboard/calendar?year=${y}&month=${m}`)
    );
  }

  function dayISO(day: number) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const monthLabel = new Date(year, month - 1, 1)
    .toLocaleDateString("he-IL", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            disabled={isPending}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            disabled={isPending}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mat-card overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="h-20 border-b border-e border-gray-100 bg-gray-50" />;
            }

            const iso        = dayISO(day);
            const trainings  = trainingMap.get(iso) ?? [];
            const comps      = compMap.get(iso)     ?? [];
            const isToday    = iso === todayISO;
            const isSelected = selected?.date === iso;
            const hasEvents  = trainings.length > 0 || comps.length > 0;

            return (
              <button
                key={iso}
                type="button"
                onClick={() =>
                  setSelected(isSelected ? null : { date: iso, trainings, competitions: comps })
                }
                className={cn(
                  "h-20 border-b border-e border-gray-100 p-1.5 text-left transition-colors relative",
                  !hasEvents && "cursor-default"
                )}
                style={{
                  background: isSelected ? "rgba(0,122,255,0.08)" : "#fff",
                  boxShadow: isSelected ? "inset 0 0 0 1px rgba(0,122,255,0.25)" : undefined,
                }}
              >
                {/* Day number */}
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  style={isToday ? { background: "#007AFF", color: "#fff" } : { color: "#374151" }}
                >
                  {day}
                </span>

                {/* Event dots */}
                <div className="mt-1 space-y-0.5">
                  {trainings.slice(0, 2).map((t) => (
                    <div key={t.id} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TYPE_DOT[t.training_type] ?? "#8E8E93" }} />
                      <span className="text-xs text-gray-600 truncate leading-none">
                        {t.title ?? t.training_type}
                      </span>
                    </div>
                  ))}
                  {comps.slice(0, 1).map((c) => (
                    <div key={c.id} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-warning-400" />
                      <span className="text-xs text-warning-400 truncate leading-none font-medium">
                        {c.name}
                      </span>
                    </div>
                  ))}
                  {(trainings.length + comps.length) > 3 && (
                    <span className="text-xs text-gray-400">
                      +{trainings.length + comps.length - 3} נוספים
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selected && (
        <DayPanel detail={selected} onClose={() => setSelected(null)} />
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs" style={{ color: "#94A3B8" }}>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#007AFF" }} />מים</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#FF9500" }} />יבשה / תחרות</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#8E8E93" }} />כושר / אחר</span>
      </div>
    </div>
  );
}

function DayPanel({ detail, onClose }: { detail: DayDetail; onClose: () => void }) {
  const label = new Date(detail.date + "T00:00:00").toLocaleDateString("he-IL", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="mat-card p-5 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: "#0F172A" }}>{label}</h3>
        <button
          onClick={onClose}
          className="text-xs font-medium transition-all active:opacity-60"
          style={{ color: "#007AFF" }}
        >
          סגור
        </button>
      </div>

      {detail.trainings.length === 0 && detail.competitions.length === 0 && (
        <p className="text-sm" style={{ color: "#94A3B8" }}>אין אירועים ביום זה.</p>
      )}

      {detail.trainings.map((t) => (
        <Link
          key={t.id}
          href={`/dashboard/training/${t.id}`}
          className="flex items-start gap-3 p-3 rounded-xl transition-all active:scale-[0.98] active:opacity-80"
          style={{ background: "#F6F9FC" }}
        >
          <div className="flex-shrink-0 mt-0.5">
            <Waves className="h-4 w-4" style={{ color: "#007AFF" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: "#0F172A" }}>
              {t.title ?? t.training_type}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">
              {t.training_type}
              {t.total_distance ? ` · ${t.total_distance.toLocaleString()}m` : ""}
              {" · "}
              <span className={t.status === "completed" ? "text-green-500" : "text-gray-400"}>
                {t.status.replace("_", " ")}
              </span>
            </p>
          </div>
        </Link>
      ))}

      {detail.competitions.map((c) => (
        <div
          key={c.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
        >
          <div className="flex-shrink-0 mt-0.5">
            <Trophy className="h-4 w-4 text-warning-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800">{c.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {c.location ?? ""}
              {c.location && c.level ? " · " : ""}
              {c.level ?? ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
