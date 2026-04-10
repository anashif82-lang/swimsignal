"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
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
    <div className="rounded-3xl bg-gray-100/80 border border-gray-200 p-3 space-y-2.5">
      {/* ── Week strip card ── */}
      <div className="rounded-2xl bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/dashboard/calendar"
            className="text-xs text-blue-500 flex items-center gap-0.5 font-medium"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            הצג הכל
          </Link>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">יומן אימוני</p>
            <span className="text-xl">🏊‍♂️</span>
          </div>
        </div>
        <WeekStrip sessions={scheduledSessions} onSelect={setSelectedDate} />
      </div>

      {/* ── Session detail card ── */}
      {!scheduled && !logged ? (
        <div className="rounded-2xl bg-white shadow-sm p-5 flex flex-col items-center gap-2 py-7">
          <span className="text-3xl">🏊‍♂️</span>
          <p className="text-sm text-gray-400">אין אימון מתוכנן ליום זה</p>
          <Link href="/dashboard/calendar" className="text-xs text-blue-500 hover:text-blue-600 transition-colors">
            הוסף ליומן
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden relative">
          {/* Subtle wave at bottom */}
          <div className="absolute bottom-0 inset-x-0 h-20 opacity-[0.05] pointer-events-none overflow-hidden">
            <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,30 C100,10 200,50 300,30 C350,20 380,35 400,30 L400,60 L0,60 Z" fill="#3b82f6"/>
              <path d="M0,40 C80,20 180,55 280,35 C340,22 370,42 400,38 L400,60 L0,60 Z" fill="#3b82f6" opacity="0.6"/>
            </svg>
          </div>

          {/* Header */}
          <div className="flex items-center justify-end gap-2 px-4 pt-4 pb-3">
            <p className="text-sm font-semibold text-gray-800">
              {timeLabel ? `אימון ${timeLabel}` : (scheduled?.title ?? logged?.title ?? "אימון")}
            </p>
            <span className="text-xl">🏊‍♂️</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 px-6 pb-4 gap-2 text-center">
            {/* Calories */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🔥</span>
              <p className="text-base font-bold text-gray-900">—</p>
              <p className="text-[11px] text-gray-400">קלוריות</p>
            </div>
            {/* Distance */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🏊</span>
              <p className="text-base font-bold text-gray-900">
                {logged?.total_distance ? `${logged.total_distance.toLocaleString()}m` : "—"}
              </p>
              <p className="text-[11px] text-gray-400">מרחק</p>
            </div>
            {/* Duration */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🕐</span>
              <p className="text-base font-bold text-gray-900">
                {durationMin ? fmtDuration(durationMin) : "—"}
              </p>
              <p className="text-[11px] text-gray-400">זמן כולל</p>
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 pb-4 flex justify-start">
            {logged ? (
              <Link
                href={`/dashboard/training/${logged.id}`}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-200/80 text-blue-500 text-sm font-semibold hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                צפה באימון
              </Link>
            ) : (
              <Link
                href="/dashboard/training/new"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-200/80 text-blue-500 text-sm font-semibold hover:bg-gray-300 transition-colors"
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
