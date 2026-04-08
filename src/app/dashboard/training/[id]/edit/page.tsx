import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTrainingSession } from "@/lib/db/training";
import { SessionForm } from "@/features/training/session-form";
import type { TrainingSessionInput } from "@/lib/validations/training";

export const metadata: Metadata = { title: "Edit Session" };

export default async function EditTrainingPage({
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

  const defaultValues: Partial<TrainingSessionInput> = {
    session_date:   session.session_date,
    training_type:  session.training_type,
    pool_length:    session.pool_length ?? undefined,
    status:         session.status,
    title:          session.title ?? "",
    total_distance: session.total_distance ?? undefined,
    total_duration: session.total_duration ?? undefined,
    rpe:            session.rpe ?? undefined,
    notes:          session.notes ?? "",
    sets: (session.sets ?? []).map((s, i) => ({
      set_order:    s.set_order ?? i,
      repetitions:  s.repetitions,
      distance:     s.distance ?? undefined,
      stroke:       s.stroke ?? undefined,
      equipment:    s.equipment ?? undefined,
      target_time:  s.target_time ?? "",
      actual_time:  s.actual_time ?? "",
      rest_seconds: s.rest_seconds ?? undefined,
      description:  s.description ?? "",
    })),
    tag_ids: [],
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/training/${id}`}
          className="text-navy-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Session</h1>
          <p className="text-navy-400 text-sm mt-0.5">
            {session.title ?? `Session on ${session.session_date}`}
          </p>
        </div>
      </div>

      <SessionForm defaultValues={defaultValues} sessionId={id} />
    </div>
  );
}
