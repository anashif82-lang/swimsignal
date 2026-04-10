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
  return d.toISOString().slice(0, 10);
}

function toMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const TYPE_STYLE: Record<string, string> = {
  water:   "border-signal-400   bg-signal-400/15   text-signal-600",
  dryland: "border-warning-400  bg-warning-400/15  text-warning-600",
  gym:     "border-gray-400     bg-gray-100         text-gray-600",
  other:   "border-gray-400     bg-gray-100         text-gray-600",
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
  const style     = TYPE_STYLE[session.training_type] ?? TYPE_STYLE.other;

  return (
    <>
      <button
        type="button"
        style={{ top, height, insetInlineStart: 2, insetInlineEnd: 2 }}
        className={cn(
          "absolute rounded-md border-s-2 px-1.5 py-0.5 overflow-hidden text-start transition-all hover:brightness-110",
          style,
          open && "ring-1 ring-white/20"
        )}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        <p className="text-[10px] font-semibold leading-tight truncate">{session.title}</p>
        {height > 30 && (
          <p className="text-[9px] opacity-70 leading-tight">
            {fmtTime(session.start_time)}–{fmtTime(session.end_time)}
          </p>
        )}
        {session.is_recurring && <span className="text-[8px] opacity-50 absolute bottom-0.5 end-1">↻</span>}
      </button>

      {/* Popup */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white border border-gray-200 rounded-xl p-4 w-72 space-y-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-gray-900 text-sm">{session.title}</p>
            <p className="text-xs text-gray-500">
              {new Date(session.start_time).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
              <br />
              {fmtTime(session.start_time)} – {fmtTime(session.end_time)}
            </p>
            {session.is_recurring && (
              <p className="text-xs text-signal-500 flex items-center gap-1">
                <RotateCcw className="h-3 w-3" /> אימון חוזר שבועי
              </p>
            )}
            {session.notes && <p className="text-xs text-gray-600">{session.notes}</p>}
            <div className="flex gap-2 pt-1">
              {session.is_recurring && (
                <button
                  onClick={() => { onDelete(session.id, session.recurrence_group_id); setOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-danger-400 bg-danger-500/10 hover:bg-danger-500/20 border border-danger-500/20 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> מחק כולם
                </button>
              )}
              <button
                onClick={() => { onDelete(session.id, null); setOpen(false); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-danger-400 bg-danger-500/10 hover:bg-danger-500/20 border border-danger-500/20 transition-colors"
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
          <button onClick={goBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-gray-800 px-1">{rangeLabel}</span>
          <button onClick={goNext} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <button onClick={goNow} className="text-xs text-signal-500 hover:text-signal-600 transition-colors px-2 py-1 rounded-lg hover:bg-signal-400/10">
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
                className={cn(
                  "flex-1 border-s border-gray-100 min-w-0",
                  isToday && "bg-signal-400/[0.04]"
                )}
              >
                {/* Day header */}
                <div className={cn(
                  "h-10 flex flex-col items-center justify-center border-b border-gray-200 sticky top-0 z-10",
                  isToday ? "bg-signal-400/10" : "bg-white"
                )}>
                  <span className="text-[9px] text-gray-400 uppercase">{DAY_NAMES[date.getDay()]}</span>
                  <span className={cn(
                    "text-sm font-bold leading-tight",
                    isToday ? "text-signal-500" : "text-gray-700"
                  )}>
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
