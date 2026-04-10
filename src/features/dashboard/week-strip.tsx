"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ScheduledSession } from "@/lib/db/schedule";

const DAY = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"]; // Sun-Sat

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

interface WeekStripProps {
  sessions: ScheduledSession[];
  onSelect?: (date: string) => void;
}

export function WeekStrip({ sessions, onSelect }: WeekStripProps) {
  const todayISO = isoDate(new Date());
  const [selected, setSelected] = useState(todayISO);

  // 9 days centred on today (4 before + today + 4 after)
  const days = Array.from({ length: 9 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 4 + i);
    return d;
  });

  const sessionDates = new Set(sessions.map((s) => s.start_time.slice(0, 10)));

  function handleSelect(iso: string) {
    setSelected(iso);
    onSelect?.(iso);
  }

  return (
    <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
      <div className="flex items-center gap-1 min-w-max py-1">
        {days.map((d) => {
          const iso     = isoDate(d);
          const isToday = iso === todayISO;
          const isSel   = iso === selected;
          const hasDot  = sessionDates.has(iso);

          return (
            <button
              key={iso}
              onClick={() => handleSelect(iso)}
              className="flex flex-col items-center gap-[3px] px-2"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <span className="text-[10px] text-gray-400 font-medium">{DAY[d.getDay()]}</span>
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                (isToday || isSel)
                  ? "bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
                  : "text-gray-800"
              )}>
                {d.getDate()}
              </div>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                hasDot ? (isToday || isSel) ? "bg-white" : "bg-blue-400" : "bg-transparent"
              )} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
