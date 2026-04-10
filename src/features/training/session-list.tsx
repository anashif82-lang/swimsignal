"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Waves, Dumbbell, Calendar, Clock, Ruler,
  ChevronLeft, ChevronRight, Trash2, ExternalLink,
} from "lucide-react";
import type { TrainingSession, TrainingType } from "@/types";
import {
  formatDate, formatDistance, formatDuration, sessionStatusBadge,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TYPE_ICON: Record<TrainingType, React.ReactNode> = {
  water:   <Waves className="h-4 w-4 text-signal-400" />,
  dryland: <Dumbbell className="h-4 w-4 text-navy-300" />,
  gym:     <Dumbbell className="h-4 w-4 text-navy-400" />,
  other:   <Calendar className="h-4 w-4 text-navy-400" />,
};

const TYPE_LABEL: Record<TrainingType, string> = {
  water:   "מים",
  dryland: "יבשה",
  gym:     "חדר כושר",
  other:   "אחר",
};

const STATUS_LABEL: Record<string, string> = {
  completed:     "הושלם",
  not_completed: "הוחמץ",
  partial:       "חלקי",
};

interface Props {
  sessions: TrainingSession[];
  page: number;
  totalPages: number;
  from?: string;
  to?: string;
}

export function SessionList({ sessions, page, totalPages, from, to }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function buildUrl(newPage: number) {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to)   params.set("to", to);
    if (newPage > 1) params.set("page", String(newPage));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  async function handleDelete(id: string) {
    if (!confirm("למחוק את האימון?")) return;
    setDeleting(id);
    const res = await fetch(`/api/training/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      startTransition(() => router.refresh());
    } else {
      alert("מחיקת האימון נכשלה.");
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="card-surface rounded-xl p-12 text-center">
        <Waves className="h-10 w-10 text-navy-600 mx-auto mb-3" />
        <p className="text-navy-300 font-medium">אין אימונים עדיין</p>
        <p className="text-navy-500 text-sm mt-1">תעד את האימון הראשון שלך כדי להתחיל.</p>
        <Link href="/dashboard/training/new" className="mt-4 inline-block">
          <Button variant="signal" size="sm">אימון חדש</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List */}
      <div className="space-y-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="card-surface rounded-xl px-5 py-4 flex items-center gap-4 group hover:border-surface-border-hover transition-colors"
          >
            {/* Type icon */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-navy-900 border border-surface-border flex items-center justify-center">
              {TYPE_ICON[session.training_type]}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-white text-sm truncate">
                  {session.title ?? `אימון ${TYPE_LABEL[session.training_type]}`}
                </span>
                <Badge variant={sessionStatusBadge(session.status) as "success" | "danger" | "warning"}>
                  {STATUS_LABEL[session.status]}
                </Badge>
                {session.pool_length && (
                  <Badge variant="navy">{session.pool_length}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-navy-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(session.session_date)}
                </span>
                {session.total_distance != null && session.total_distance > 0 && (
                  <span className="flex items-center gap-1">
                    <Ruler className="h-3 w-3" />
                    {formatDistance(session.total_distance)}
                  </span>
                )}
                {session.total_duration != null && session.total_duration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(session.total_duration)}
                  </span>
                )}
                {session.rpe != null && (
                  <span className="font-mono">RPE {session.rpe}/10</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link href={`/dashboard/training/${session.id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="צפה באימון">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-danger-400 hover:text-danger-300 hover:bg-danger-900/30"
                onClick={() => handleDelete(session.id)}
                disabled={deleting === session.id}
                title="מחק אימון"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link href={buildUrl(page - 1)}>
            <Button variant="ghost" size="icon" disabled={page <= 1} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="text-sm text-navy-400">
            עמוד {page} מתוך {totalPages}
          </span>
          <Link href={buildUrl(page + 1)}>
            <Button variant="ghost" size="icon" disabled={page >= totalPages} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
