import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Clock, Ruler, Pencil,
  Waves, Dumbbell, Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTrainingSession } from "@/lib/db/training";
import {
  formatDate, formatDistance, formatDuration,
  sessionStatusBadge, formatSwimTime,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Session Detail" };

const TYPE_ICON: Record<string, React.ReactNode> = {
  water:   <Waves className="h-5 w-5 text-signal-400" />,
  dryland: <Dumbbell className="h-5 w-5 text-navy-300" />,
  gym:     <Dumbbell className="h-5 w-5 text-navy-300" />,
  other:   <Zap className="h-5 w-5 text-navy-400" />,
};

const STATUS_LABEL: Record<string, string> = {
  completed:     "Completed",
  not_completed: "Not completed",
  partial:       "Partial",
};

const STROKE_LABEL: Record<string, string> = {
  freestyle:         "Freestyle",
  backstroke:        "Backstroke",
  breaststroke:      "Breaststroke",
  butterfly:         "Butterfly",
  individual_medley: "IM",
};

export default async function TrainingSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const session = await getTrainingSession(id);
  if (!session || session.swimmer_id !== user.id) notFound();

  const sets = session.sets ?? [];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/training"
            className="text-navy-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-900 border border-surface-border flex items-center justify-center">
              {TYPE_ICON[session.training_type]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {session.title ?? `${session.training_type.charAt(0).toUpperCase() + session.training_type.slice(1)} Session`}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={sessionStatusBadge(session.status) as "success" | "danger" | "warning"}>
                  {STATUS_LABEL[session.status]}
                </Badge>
                {session.pool_length && (
                  <Badge variant="navy">{session.pool_length}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <Link href={`/dashboard/training/${id}/edit`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Calendar className="h-4 w-4" />}
          label="Date"
          value={formatDate(session.session_date)}
        />
        {session.total_distance != null && session.total_distance > 0 && (
          <StatCard
            icon={<Ruler className="h-4 w-4" />}
            label="Distance"
            value={formatDistance(session.total_distance)}
          />
        )}
        {session.total_duration != null && session.total_duration > 0 && (
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Duration"
            value={formatDuration(session.total_duration)}
          />
        )}
        {session.rpe != null && (
          <StatCard
            icon={<Zap className="h-4 w-4" />}
            label="RPE"
            value={`${session.rpe} / 10`}
          />
        )}
      </div>

      {/* Notes */}
      {session.notes && (
        <div className="card-surface rounded-xl p-5">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wide mb-3">Notes</h2>
          <p className="text-navy-200 text-sm whitespace-pre-wrap leading-relaxed">{session.notes}</p>
        </div>
      )}

      {/* Sets */}
      {sets.length > 0 && (
        <div className="card-surface rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wide">
            Sets ({sets.length})
          </h2>
          <div className="space-y-2">
            {sets.map((set, idx) => (
              <div
                key={set.id}
                className="bg-navy-900/60 rounded-lg px-4 py-3 flex items-start gap-4 border border-surface-border"
              >
                <span className="text-xs font-mono text-navy-500 w-6 pt-0.5">{idx + 1}</span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="font-semibold text-white">
                      {set.repetitions}×{set.distance != null ? `${set.distance}m` : "–"}
                    </span>
                    {set.stroke && (
                      <Badge variant="navy">{STROKE_LABEL[set.stroke]}</Badge>
                    )}
                    {set.rest_seconds != null && (
                      <span className="text-navy-500 text-xs">:{set.rest_seconds}s rest</span>
                    )}
                  </div>
                  {(set.target_time || set.actual_time) && (
                    <div className="flex items-center gap-3 text-xs text-navy-400">
                      {set.target_time && (
                        <span>Target: <span className="font-mono text-navy-200">{set.target_time}</span></span>
                      )}
                      {set.actual_time && (
                        <span>Actual: <span className="font-mono text-signal-300">{set.actual_time}</span></span>
                      )}
                    </div>
                  )}
                  {set.description && (
                    <p className="text-xs text-navy-400">{set.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card-surface rounded-xl p-4 space-y-1">
      <div className="flex items-center gap-1.5 text-navy-400 text-xs">
        {icon}
        {label}
      </div>
      <p className="font-semibold text-white text-sm">{value}</p>
    </div>
  );
}
