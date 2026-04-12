"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, CalendarDays, Calendar, Clock } from "lucide-react";
import { WeeklyView } from "./weekly-view";
import { CalendarGrid } from "./calendar-grid";
import { AddSessionDialog } from "./add-session-dialog";
import type { ScheduledSession } from "@/lib/db/schedule";
import type { CalendarData } from "@/lib/db/calendar";
import { cn } from "@/lib/utils";

type View = "week" | "month" | "day";

interface ScheduleCalendarProps {
  initialSessions:  ScheduledSession[];
  calendarData:     CalendarData;          // for monthly view (logged sessions)
  calendarYear:     number;
  calendarMonth:    number;
}

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

export function ScheduleCalendar({
  initialSessions,
  calendarData,
  calendarYear,
  calendarMonth,
}: ScheduleCalendarProps) {
  const [view,     setView]     = useState<View>("week");
  const [sessions, setSessions] = useState<ScheduledSession[]>(initialSessions);
  const [dialog,   setDialog]   = useState<{ date: string; hour: number } | null>(null);

  // Re-fetch scheduled sessions when view changes or after save
  const reload = useCallback(async () => {
    const now  = new Date();
    const from = isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const to   = isoDate(new Date(now.getFullYear(), now.getMonth() + 3, 0));
    const res  = await fetch(`/api/schedule?from=${from}&to=${to}`);
    if (res.ok) setSessions(await res.json());
  }, []);

  const handleClickSlot = useCallback((date: string, hour: number) => {
    setDialog({ date, hour });
  }, []);

  const handleSaved = useCallback(async () => {
    setDialog(null);
    await reload();
  }, [reload]);

  const handleDelete = useCallback(async (id: string, groupId: string | null) => {
    const url = groupId
      ? `/api/schedule/${id}?all=true`
      : `/api/schedule/${id}`;
    await fetch(url, { method: "DELETE" });
    await reload();
  }, [reload]);

  // ── daily view state ──
  const [dayDate, setDayDate] = useState(isoDate(new Date()));
  const daySessions = sessions.filter((s) => s.start_time.slice(0, 10) === dayDate);

  const VIEWS: { id: View; label: string; icon: typeof CalendarDays }[] = [
    { id: "week",  label: "שבועי", icon: CalendarDays },
    { id: "month", label: "חודשי", icon: Calendar     },
    { id: "day",   label: "יומי",  icon: Clock        },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        {/* View switcher */}
        <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-lg p-0.5">
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-[120ms] active:scale-[0.94] active:opacity-80",
                view === id
                  ? "bg-signal-400 text-navy-950"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={() => setDialog({ date: isoDate(new Date()), hour: 9 })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-signal-400 text-navy-950 text-xs font-semibold hover:bg-signal-300 transition-all duration-[120ms] active:scale-[0.94] active:opacity-80"
        >
          <Plus className="h-3.5 w-3.5" />
          הוסף אימון
        </button>
      </div>

      {/* ── Views ── */}
      <div className="flex-1 min-h-0">
        {view === "week" && (
          <WeeklyView
            sessions={sessions}
            onClickSlot={handleClickSlot}
            onDelete={handleDelete}
          />
        )}

        {view === "month" && (
          <div className="h-full overflow-auto">
            <CalendarGrid data={calendarData} year={calendarYear} month={calendarMonth} />
          </div>
        )}

        {view === "day" && (
          <DayView
            date={dayDate}
            sessions={daySessions}
            onChangeDate={setDayDate}
            onClickSlot={(hour) => handleClickSlot(dayDate, hour)}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* ── Add dialog ── */}
      {dialog && (
        <AddSessionDialog
          initialDate={dialog.date}
          initialHour={dialog.hour}
          onClose={() => setDialog(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ── DayView ───────────────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6);
const HOUR_PX = 56;

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

interface DayViewProps {
  date:         string;
  sessions:     ScheduledSession[];
  onChangeDate: (d: string) => void;
  onClickSlot:  (hour: number) => void;
  onDelete:     (id: string, groupId: string | null) => void;
}

function DayView({ date, sessions, onChangeDate, onClickSlot, onDelete }: DayViewProps) {
  function shift(n: number) {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + n);
    onChangeDate(d.toISOString().slice(0, 10));
  }

  const label = new Date(date + "T00:00:00").toLocaleDateString("he-IL", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <button onClick={() => shift(-1)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-all duration-[120ms] active:scale-[0.88] active:opacity-70">
          ‹
        </button>
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <button onClick={() => shift(1)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-all duration-[120ms] active:scale-[0.88] active:opacity-70">
          ›
        </button>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white">
        <div className="relative" style={{ height: HOURS.length * HOUR_PX }}>
          {HOURS.map((h) => (
            <div
              key={h}
              style={{ top: (h - 6) * HOUR_PX, height: HOUR_PX }}
              className="absolute inset-x-0 border-b border-gray-100 flex items-start gap-3 px-3 pt-1 hover:bg-gray-50 active:bg-blue-50 cursor-pointer transition-colors duration-[100ms]"
              onClick={() => onClickSlot(h)}
            >
              <span className="text-[10px] text-gray-400 font-mono w-8 shrink-0">{String(h).padStart(2, "0")}:00</span>
            </div>
          ))}

          {/* Sessions */}
          {sessions.map((s) => {
            const startMin = new Date(s.start_time).getHours() * 60 + new Date(s.start_time).getMinutes();
            const endMin   = new Date(s.end_time).getHours()   * 60 + new Date(s.end_time).getMinutes();
            const top      = ((startMin - 6 * 60) / 60) * HOUR_PX;
            const height   = Math.max(((endMin - startMin) / 60) * HOUR_PX, 28);
            return (
              <div
                key={s.id}
                style={{ top, height, left: 48, right: 8 }}
                className="absolute rounded-lg bg-signal-400/15 border-s-2 border-signal-400 px-2 py-1"
              >
                <p className="text-xs font-semibold text-signal-600 truncate">{s.title}</p>
                <p className="text-[10px] text-gray-500">{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id, s.is_recurring ? s.recurrence_group_id : null); }}
                  className="absolute top-1 end-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <span className="text-[10px]">✕</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
