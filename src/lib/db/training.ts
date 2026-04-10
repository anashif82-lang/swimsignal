import { createClient } from "@/lib/supabase/server";
import type { TrainingSession, TrainingSet, TrainingSessionFormData } from "@/types";

// ─── SESSIONS ─────────────────────────────────────────────────────────────────

export async function listTrainingSessions(
  swimmerId: string,
  options: {
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ data: TrainingSession[]; total: number }> {
  const supabase = await createClient();
  const { from, to, limit = 20, offset = 0 } = options;

  let query = supabase
    .from("training_sessions")
    .select("*, sets:training_sets(*), tags:training_session_tags(tag:tags(*))", { count: "exact" })
    .eq("swimmer_id", swimmerId)
    .order("session_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (from) query = query.gte("session_date", from);
  if (to)   query = query.lte("session_date", to);

  const { data, count } = await query;
  return { data: data ?? [], total: count ?? 0 };
}

export async function getTrainingSession(
  sessionId: string
): Promise<TrainingSession | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("training_sessions")
    .select("*, sets:training_sets(*), tags:training_session_tags(tag:tags(*))")
    .eq("id", sessionId)
    .single();
  return data ?? null;
}

export async function getRecentSessions(
  swimmerId: string,
  limit = 7
): Promise<TrainingSession[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("training_sessions")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .order("session_date", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function createTrainingSession(
  swimmerId: string,
  formData: TrainingSessionFormData
): Promise<{ data: TrainingSession | null; error: string | null }> {
  const supabase = await createClient();

  const { sets, tag_ids, ...sessionData } = formData;

  const { data: session, error: sessionError } = await supabase
    .from("training_sessions")
    .insert({ ...sessionData, swimmer_id: swimmerId })
    .select()
    .single();

  if (sessionError || !session) {
    return { data: null, error: sessionError?.message ?? "Failed to create session" };
  }

  // Insert sets
  if (sets && sets.length > 0) {
    const { error: setsError } = await supabase
      .from("training_sets")
      .insert(sets.map((s) => ({ ...s, session_id: session.id })));
    if (setsError) {
      return { data: null, error: setsError.message };
    }
  }

  // Link tags
  if (tag_ids && tag_ids.length > 0) {
    await supabase
      .from("training_session_tags")
      .insert(tag_ids.map((tag_id) => ({ session_id: session.id, tag_id })));
  }

  return { data: session, error: null };
}

export async function updateTrainingSession(
  sessionId: string,
  swimmerId: string,
  updates: Partial<TrainingSessionFormData>
): Promise<{ data: TrainingSession | null; error: string | null }> {
  const supabase = await createClient();
  const { sets, tag_ids, ...sessionUpdates } = updates;

  const { data, error } = await supabase
    .from("training_sessions")
    .update(sessionUpdates)
    .eq("id", sessionId)
    .eq("swimmer_id", swimmerId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  if (sets !== undefined) {
    await supabase.from("training_sets").delete().eq("session_id", sessionId);
    if (sets.length > 0) {
      await supabase
        .from("training_sets")
        .insert(sets.map((s) => ({ ...s, session_id: sessionId })));
    }
  }

  return { data, error: null };
}

export async function deleteTrainingSession(
  sessionId: string,
  swimmerId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("training_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("swimmer_id", swimmerId);
  return { error: error?.message ?? null };
}

// ─── WEEKLY VOLUME ────────────────────────────────────────────────────────────

export async function getWeeklyVolume(
  swimmerId: string,
  weeks = 8
): Promise<{ week: string; distance: number; sessions: number }[]> {
  const supabase = await createClient();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - weeks * 7);

  const { data } = await supabase
    .from("training_sessions")
    .select("session_date, total_distance, status")
    .eq("swimmer_id", swimmerId)
    .eq("status", "completed")
    .gte("session_date", fromDate.toISOString().split("T")[0])
    .order("session_date");

  if (!data) return [];

  // Group by week
  const weekMap = new Map<string, { distance: number; sessions: number }>();
  for (const session of data) {
    const d = new Date(session.session_date);
    const dayOfWeek = d.getDay();
    const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    d.setDate(diff);
    const weekKey = d.toISOString().split("T")[0];

    const existing = weekMap.get(weekKey) ?? { distance: 0, sessions: 0 };
    weekMap.set(weekKey, {
      distance: existing.distance + (session.total_distance ?? 0),
      sessions: existing.sessions + 1,
    });
  }

  return Array.from(weekMap.entries()).map(([week, stats]) => ({
    week,
    ...stats,
  }));
}

export async function getStreakDays(swimmerId: string): Promise<number> {
  const supabase = await createClient();
  const from = new Date();
  from.setDate(from.getDate() - 90);
  const { data } = await supabase
    .from("training_sessions")
    .select("session_date")
    .eq("swimmer_id", swimmerId)
    .eq("status", "completed")
    .gte("session_date", from.toISOString().slice(0, 10))
    .order("session_date", { ascending: false });
  if (!data || data.length === 0) return 0;
  const dates = new Set(data.map((s) => s.session_date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (dates.has(iso)) { streak++; }
    else if (i > 0) { break; }
  }
  return streak;
}
