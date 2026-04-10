import Link from "next/link";
import { ArrowRight, Waves, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateShort, formatDistance, formatDuration, sessionStatusBadge } from "@/lib/utils";
import type { TrainingSession } from "@/types";

interface RecentSessionsProps {
  sessions: TrainingSession[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-navy-800 border border-surface-border flex items-center justify-center mx-auto mb-3">
          <Waves className="h-6 w-6 text-navy-500" />
        </div>
        <p className="text-navy-400 text-sm">אין אימונים עדיין</p>
        <p className="text-navy-500 text-xs mt-1">תעד את האימון הראשון שלך כדי להתחיל</p>
        <Link
          href="/dashboard/training/new"
          className="inline-flex items-center gap-1.5 mt-4 text-signal-400 text-sm hover:text-signal-300 transition-colors"
        >
          תעד אימון
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <Link
          key={session.id}
          href={`/dashboard/training/${session.id}`}
          className="flex items-center gap-4 p-3.5 rounded-lg hover:bg-surface-raised border border-transparent hover:border-surface-border transition-all group"
        >
          {/* Type icon */}
          <div className="w-9 h-9 rounded-lg bg-navy-800 border border-surface-border flex items-center justify-center shrink-0">
            {session.training_type === "water" ? (
              <Waves className="h-4 w-4 text-signal-400" />
            ) : (
              <Dumbbell className="h-4 w-4 text-navy-300" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-medium text-white truncate">
                {session.title ?? (session.training_type === "water" ? "אימון מים" : "אימון יבשה")}
              </p>
              {session.pool_length && (
                <span className="text-[10px] text-navy-500 font-mono bg-navy-800 px-1.5 py-0.5 rounded">
                  {session.pool_length}
                </span>
              )}
            </div>
            <p className="text-xs text-navy-400">
              {formatDateShort(session.session_date)}
              {session.total_distance && ` · ${formatDistance(session.total_distance)}`}
              {session.total_duration && ` · ${formatDuration(session.total_duration)}`}
            </p>
          </div>

          {/* Status & RPE */}
          <div className="flex items-center gap-2 shrink-0">
            {session.rpe && (
              <span className="text-xs font-mono text-navy-400">
                RPE {session.rpe}
              </span>
            )}
            <Badge variant={
              session.status === "completed"     ? "success" :
              session.status === "not_completed" ? "danger"  : "warning"
            }>
              {session.status === "completed"     ? "הושלם" :
               session.status === "not_completed" ? "הוחמץ" : "חלקי"}
            </Badge>
            <ArrowRight className="h-4 w-4 text-navy-600 group-hover:text-navy-400 transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}
