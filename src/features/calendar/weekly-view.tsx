"use client";

import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduledSession } from "@/lib/db/schedule";

// ── constants ────────────────────────────────────────────────────────────────
const HOUR_START  = 6;
const HOUR_END    = 22;
const HOURS       = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const HOUR_PX     = 60; // px per hour
const DAY_NAMES   = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]; // Sun-Sat

// ── helpers ──────────────────────────────────────────────────────────────────
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday = 0
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isoDate(d: Date) {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const TYPE_STYLE: Record<string, React.CSSProperties> = {
  water:   { borderColor: "#007AFF", background: "rgba(0,122,255,0.10)",   color: "#007AFF"  },
  dryland: { borderColor: "#FF9500", background: "rgba(255,149,0,0.10)",   color: "#C97000"  },
  gym:     { borderColor: "#8E8E93", background: "rgba(142,142,147,0.10)", color: "#636366"  },
  other:   { borderColor: "#8E8E93", background: "rgba(142,142,147,0.10)", color: "#636366"  },
};

// ── EventBlock ────────────────────────────────────────────────────────────────
interface EventBlockProps {
  session:   ScheduledSession;
  onDelete:  (id: string, groupId: string | null) => void;
}

function EventBlock({ session, onDelete }: EventBlockProps) {
  const [open, setOpen] = useState(false);

  const startMin  = toMinutes(session.start_time);
  const endMin    = toMinutes(session.end_time);
  const top       = ((startMin - HOUR_START * 60) / 60) * HOUR_PX;
  const height    = Math.max(((endMin - startMin) / 60) * HOUR_PX, 22);
  const typeStyle = TYPE_STYLE[session.training_type] ?? TYPE_STYLE.other;

  return (
    <>
      <button
        type="button"
        style={{ top, height, insetInlineStart: 2, insetInlineEnd: 2, ...typeStyle, borderInlineStartWidth: 2, borderStyle: "solid" }}
        className={cn(
          "absolute rounded-md px-1.5 py-0.5 overflow-hidden text-start transition-all duration-[120ms] active:scale-[0.97] active:opacity-80",
          open && "ring-1 ring-black/10"
        )}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        <p className="text-[10px] font-semibold leading-tight truncate">{session.title}</p>
        {height > 30 && (
          <p className="text-[9px] opacity-70 leading-tight">
            {fmtTime(session.start_time)}–{fmtTime(session.end_time)}
          </p>
        )}
        {session.is_recurring && <RotateCcw className="h-2 w-2 opacity-50 absolute bottom-0.5 end-1" />}
      </button>

      {/* Popup */}
      {open && (
        <div
          className="animate-backdrop-in fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="mat-card p-4 w-72 space-y-3 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-sm" style={{ color: "#0F172A" }}>{session.title}</p>
            <p className="text-xs" style={{ color: "#64748B" }}>
              {new Date(session.start_time).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
              <br />
              {fmtTime(session.start_time)} – {fmtTime(session.end_time)}
            </p>
            {session.is_recurring && (
              <p className="text-xs flex items-center gap-1" style={{ color: "#007AFF" }}>
                <RotateCcw className="h-3 w-3" /> אימון חוזר שבועי
              </p>
            )}
            {session.notes && <p className="text-xs" style={{ color: "#475569" }}>{session.notes}</p>}
            <div className="flex gap-2 pt-1">
              {session.is_recurring && (
                <button
                  onClick={() => { onDelete(session.id, session.recurrence_group_id); setOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.96]"
                  style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.18)" }}
                >
                  <Trash2 className="h-3 w-3" /> מחק כולם
                </button>
              )}
              <button
                onClick={() => { onDelete(session.id, null); setOpen(false); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.96]"
                style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.18)" }}
              >
                <Trash2 className="h-3 w-3" /> {session.is_recurring ? "מחק רק זה" : "מחק"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── WeeklyView ────────────────────────────────────────────────────────────────
interface WeeklyViewProps {
  sessions:    ScheduledSession[];
  onClickSlot: (date: string, hour: number) => void;
  onDelete:    (id: string, groupId: string | null) => void;
}

export function WeeklyView({ sessions, onClickSlot, onDelete }: WeeklyViewProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const todayISO = isoDate(new Date());

  // Group sessions by date
  const byDate = useMemo(() => {
    const map = new Map<string, ScheduledSession[]>();
    for (const s of sessions) {
      const d = isoDate(new Date(s.start_time));
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(s);
    }
    return map;
  }, [sessions]);

  const goBack = useCallback(() => setWeekStart((w) => addDays(w, -7)), []);
  const goNext = useCallback(() => setWeekStart((w) => addDays(w,  7)), []);
  const goNow  = useCallback(() => setWeekStart(startOfWeek(new Date())), []);

  const rangeLabel = `${weekDates[0].toLocaleDateString("he-IL", { day: "numeric", month: "short" })} – ${weekDates[6].toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Week navigation ── */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={goBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-all duration-[120ms] active:scale-[0.88] active:opacity-70">
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-gray-800 px-1">{rangeLabel}</span>
          <button onClick={goNext} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-all duration-[120ms] active:scale-[0.88] active:opacity-70">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <button onClick={goNow} className="text-xs font-semibold px-2 py-1 rounded-lg transition-all duration-[120ms] active:opacity-60" style={{ color: "#007AFF" }}>
          היום
        </button>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white">
        <div className="flex" style={{ minWidth: "520px" }}>

          {/* Time axis */}
          <div className="w-10 shrink-0 bg-white sticky start-0 z-10">
            <div className="h-10 border-b border-gray-200" />
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ height: HOUR_PX }}
                className="border-b border-gray-100 flex items-start justify-end pe-1.5 pt-1"
              >
                <span className="text-[9px] text-gray-400 font-mono">{String(h).padStart(2, "0")}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((date, i) => {
            const iso      = isoDate(date);
            const isToday  = iso === todayISO;
            const daySess  = byDate.get(iso) ?? [];

            return (
              <div
                key={iso}
                className="flex-1 border-s border-gray-100 min-w-0"
                style={isToday ? { background: "rgba(0,122,255,0.03)" } : undefined}
              >
                {/* Day header */}
                <div
                  className="h-10 flex flex-col items-center justify-center border-b border-gray-200 sticky top-0 z-10"
                  style={isToday ? { background: "rgba(0,122,255,0.08)" } : { background: "#fff" }}
                >
                  <span className="text-[9px] text-gray-400 uppercase">{DAY_NAMES[date.getDay()]}</span>
                  <span
                    className="text-sm font-bold leading-tight"
                    style={{ color: isToday ? "#007AFF" : "#374151" }}
                  >
                    {date.getDate()}
                  </span>
                </div>

                {/* Hour slots */}
                <div
                  className="relative"
                  style={{ height: HOURS.length * HOUR_PX }}
                >
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      style={{ top: (h - HOUR_START) * HOUR_PX, height: HOUR_PX }}
                      className="absolute inset-x-0 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => onClickSlot(iso, h)}
                    />
                  ))}

                  {/* Events */}
                  {daySess.map((s) => (
                    <EventBlock key={s.id} session={s} onDelete={onDelete} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
