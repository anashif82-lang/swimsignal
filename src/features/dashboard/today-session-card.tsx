import Link from "next/link";
import { ArrowLeft, Waves, Clock, Zap } from "lucide-react";
import type { ScheduledSession } from "@/lib/db/schedule";
import type { TrainingSession } from "@/types";

interface TodaySessionCardProps {
  scheduled: ScheduledSession | null;
  logged:    TrainingSession  | null;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function TodaySessionCard({ scheduled, logged }: TodaySessionCardProps) {
  if (!scheduled && !logged) {
    return (
      <div className="mat-card p-5 flex flex-col items-center justify-center gap-2 py-7">
        <Waves className="h-8 w-8" style={{ color: "#007AFF", opacity: 0.4 }} />
        <p className="text-sm text-gray-400">אין אימון מתוכנן להיום</p>
        <Link
          href="/dashboard/calendar"
          className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
        >
          הוסף ליומן
        </Link>
      </div>
    );
  }

  const timeLabel = scheduled
    ? `${fmtTime(scheduled.start_time)} – ${fmtTime(scheduled.end_time)}`
    : null;

  const durationMin = scheduled
    ? Math.round((new Date(scheduled.end_time).getTime() - new Date(scheduled.start_time).getTime()) / 60000)
    : logged?.total_duration ?? null;

  const fmtDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}:${String(m).padStart(2,"0")}:00`;
  };

  const title = scheduled?.title ?? logged?.title ?? "אימון היום";

  return (
    <div className="mat-card overflow-hidden relative">
      {/* Water wave decoration */}
      <div className="absolute bottom-0 inset-x-0 h-16 opacity-[0.06] pointer-events-none overflow-hidden">
        <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,30 C100,10 200,50 300,30 C350,20 380,35 400,30 L400,60 L0,60 Z" fill="#3b82f6"/>
          <path d="M0,40 C80,20 180,55 280,35 C340,22 370,42 400,38 L400,60 L0,60 Z" fill="#3b82f6" opacity="0.6"/>
        </svg>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <Waves className="h-5 w-5" style={{ color: "#007AFF" }} />
        <p className="text-sm font-semibold text-gray-800">
          {timeLabel ? `אימון ${timeLabel}` : title}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 px-4 pb-3 gap-2">
        {/* Duration */}
        <div className="flex flex-col items-center gap-0.5">
          <Clock className="h-5 w-5" style={{ color: "#5856D6" }} />
          <p className="text-base font-bold text-gray-900">
            {durationMin ? fmtDuration(durationMin) : "—"}
          </p>
          <p className="text-[10px] text-gray-400">זמן כולל</p>
        </div>
        {/* Distance */}
        <div className="flex flex-col items-center gap-0.5">
          <Waves className="h-5 w-5" style={{ color: "#007AFF" }} />
          <p className="text-base font-bold text-gray-900">
            {logged?.total_distance ? `${logged.total_distance.toLocaleString()}m` : "—"}
          </p>
          <p className="text-[10px] text-gray-400">מרחק</p>
        </div>
        {/* Calories */}
        <div className="flex flex-col items-center gap-0.5">
          <Zap className="h-5 w-5" style={{ color: "#FF9500" }} />
          <p className="text-base font-bold text-gray-900">—</p>
          <p className="text-[10px] text-gray-400">קלוריות</p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4 flex justify-end">
        {logged ? (
          <Link
            href={`/dashboard/training/${logged.id}`}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-50 text-blue-500 text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            צפה באימון
          </Link>
        ) : (
          <Link
            href="/dashboard/training/new"
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-50 text-blue-500 text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            תעד אימון
          </Link>
        )}
      </div>
    </div>
  );
}
