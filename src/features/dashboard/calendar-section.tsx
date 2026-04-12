"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WeekStrip } from "./week-strip";
import type { ScheduledSession } from "@/lib/db/schedule";
import type { TrainingSession } from "@/types";

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, "0")}:00`;
}


interface Props {
  scheduledSessions: ScheduledSession[];
  recentSessions:    TrainingSession[];
}

export function DashboardCalendarSection({ scheduledSessions, recentSessions }: Props) {
  const [selectedDate, setSelectedDate] = useState(isoDate(new Date()));

  const scheduled = scheduledSessions.find((s) => s.start_time.slice(0, 10) === selectedDate) ?? null;
  const logged    = recentSessions.find((s) => s.session_date === selectedDate) ?? null;

  const timeLabel   = scheduled ? `${fmtTime(scheduled.start_time)} – ${fmtTime(scheduled.end_time)}` : null;
  const durationMin = scheduled
    ? Math.round((new Date(scheduled.end_time).getTime() - new Date(scheduled.start_time).getTime()) / 60000)
    : logged?.total_duration ?? null;

  return (
    <div className="space-y-3">

      {/* ── Week strip card ── */}
      <div className="mat-card px-4 pt-4 pb-5">
        <WeekStrip sessions={scheduledSessions} onSelect={setSelectedDate} />
      </div>

      {/* ── Session detail card ── */}
      {!scheduled && !logged ? (
        <div
          key={selectedDate}
          className="mat-card flex flex-col items-center gap-2 py-8 animate-session-enter"
        >
          <span className="text-3xl">🏊‍♂️</span>
          <p className="text-sm text-gray-400">אין אימון מתוכנן ליום זה</p>
          <Link
            href="/dashboard/calendar"
            className="text-xs font-medium transition-colors active:opacity-60"
            style={{ color: "#2E7BBF" }}
          >
            הוסף ליומן
          </Link>
        </div>
      ) : (
        <div
          key={selectedDate}
          className="mat-card overflow-hidden relative animate-session-enter"
        >
          {/* Subtle wave decoration */}
          <div className="absolute bottom-0 inset-x-0 h-20 opacity-[0.04] pointer-events-none overflow-hidden">
            <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,30 C100,10 200,50 300,30 C350,20 380,35 400,30 L400,60 L0,60 Z" fill="#3b82f6"/>
              <path d="M0,40 C80,20 180,55 280,35 C340,22 370,42 400,38 L400,60 L0,60 Z" fill="#3b82f6"/>
            </svg>
          </div>

          {/* Header */}
          <div className="flex items-center justify-end gap-2 px-5 pt-5 pb-4">
            <p className="text-sm font-semibold text-gray-800">
              {timeLabel ? `אימון ${timeLabel}` : (scheduled?.title ?? logged?.title ?? "אימון")}
            </p>
            <span className="text-xl">🏊‍♂️</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 px-4 pb-4 gap-2 text-center">
            <div className="mat-cell flex flex-col items-center gap-1 py-3">
              <span className="text-2xl">🔥</span>
              <p className="text-base font-bold text-gray-900">—</p>
              <p className="text-[11px] text-gray-400">קלוריות</p>
            </div>
            <div className="mat-cell flex flex-col items-center gap-1 py-3">
              <span className="text-2xl">🏊</span>
              <p className="text-base font-bold text-gray-900">
                {logged?.total_distance ? `${logged.total_distance.toLocaleString()}m` : "—"}
              </p>
              <p className="text-[11px] text-gray-400">מרחק</p>
            </div>
            <div className="mat-cell flex flex-col items-center gap-1 py-3">
              <span className="text-2xl">🕐</span>
              <p className="text-base font-bold text-gray-900">
                {durationMin ? fmtDuration(durationMin) : "—"}
              </p>
              <p className="text-[11px] text-gray-400">זמן כולל</p>
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 pb-4">
            {logged ? (
              <Link
                href={`/dashboard/training/${logged.id}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-[120ms] active:scale-[0.95] active:opacity-75"
                style={{ background: "rgba(46,123,191,0.10)", color: "#2E7BBF" }}
              >
                <ArrowLeft className="h-4 w-4" />
                צפה באימון
              </Link>
            ) : (
              <Link
                href="/dashboard/training/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-[120ms] active:scale-[0.95] active:opacity-75"
                style={{ background: "rgba(46,123,191,0.10)", color: "#2E7BBF" }}
              >
                <ArrowLeft className="h-4 w-4" />
                תעד אימון
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
