import Link from "next/link";
import { Waves, Clock, Flame, ArrowLeft } from "lucide-react";
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
      <div className="rounded-2xl bg-navy-800/60 border border-white/[0.06] p-4 flex flex-col items-center justify-center gap-2 py-6">
        <Waves className="h-8 w-8 text-navy-600" />
        <p className="text-sm text-navy-500">אין אימון מתוכנן להיום</p>
        <Link
          href="/dashboard/calendar"
          className="text-xs text-signal-400 hover:text-signal-300 transition-colors"
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
    return h > 0 ? `${h}:${String(m).padStart(2,"0")}:00` : `0:${String(m).padStart(2,"0")}:00`;
  };

  return (
    <div className="rounded-2xl bg-navy-800/60 border border-white/[0.06] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
        <div className="w-7 h-7 rounded-lg bg-signal-400/15 flex items-center justify-center">
          <Waves className="h-3.5 w-3.5 text-signal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {scheduled?.title ?? logged?.title ?? "אימון היום"}
          </p>
          {timeLabel && <p className="text-[10px] text-navy-400">{timeLabel}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.05] px-0">
        <div className="flex flex-col items-center gap-0.5 py-3">
          <Clock className="h-4 w-4 text-navy-400" />
          <p className="text-sm font-bold text-white">
            {durationMin ? fmtDuration(durationMin) : "—"}
          </p>
          <p className="text-[9px] text-navy-500">זמן כולל</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 py-3">
          <Waves className="h-4 w-4 text-navy-400" />
          <p className="text-sm font-bold text-white">
            {logged?.total_distance ? `${logged.total_distance.toLocaleString()}m` : "—"}
          </p>
          <p className="text-[9px] text-navy-500">מרחק</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 py-3">
          <Flame className="h-4 w-4 text-navy-400" />
          <p className="text-sm font-bold text-white">—</p>
          <p className="text-[9px] text-navy-500">קלוריות</p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-3">
        {logged ? (
          <Link
            href={`/dashboard/training/${logged.id}`}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-signal-400/10 border border-signal-400/20 text-signal-400 text-xs font-medium hover:bg-signal-400/20 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            צפה באימון
          </Link>
        ) : (
          <Link
            href="/dashboard/training/new"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-signal-400/10 border border-signal-400/20 text-signal-400 text-xs font-medium hover:bg-signal-400/20 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            תעד אימון
          </Link>
        )}
      </div>
    </div>
  );
}
