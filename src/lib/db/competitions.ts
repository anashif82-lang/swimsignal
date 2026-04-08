import { createClient } from "@/lib/supabase/server";
import type { Competition, PersonalBest, PoolLength, CompetitionLevel } from "@/types";

export async function listCompetitions(swimmerId: string): Promise<Competition[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("competitions")
    .select("*, results:competition_results(*)")
    .eq("swimmer_id", swimmerId)
    .order("competition_date", { ascending: false });
  return data ?? [];
}

export async function getCompetition(id: string): Promise<Competition | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("competitions")
    .select("*, results:competition_results(*)")
    .eq("id", id)
    .single();
  return data ?? null;
}

export async function createCompetition(
  swimmerId: string,
  competition: {
    name: string;
    competition_date: string;
    location?: string;
    level?: CompetitionLevel;
    pool_length: PoolLength;
    notes?: string;
  },
  results: Array<{
    event_name: string;
    stroke?: string;
    distance?: number;
    final_time: string;
    final_time_ms: number;
    heat_time?: string;
    heat_time_ms?: number;
    place?: number;
    goal_time?: string;
    goal_time_ms?: number;
    is_personal_best: boolean;
    is_official: boolean;
  }>
): Promise<{ data: Competition | null; error: string | null }> {
  const supabase = await createClient();

  const { data: comp, error: compError } = await supabase
    .from("competitions")
    .insert({ ...competition, swimmer_id: swimmerId })
    .select()
    .single();

  if (compError || !comp) {
    return { data: null, error: compError?.message ?? "Failed to create competition" };
  }

  if (results.length > 0) {
    const { error: resultsError } = await supabase
      .from("competition_results")
      .insert(
        results.map((r) => ({
          ...r,
          competition_id: comp.id,
          swimmer_id: swimmerId,
          pool_length: competition.pool_length,
          stroke: r.stroke ?? null,
          distance: r.distance ?? null,
          heat_time: r.heat_time ?? null,
          heat_time_ms: r.heat_time_ms ?? null,
          place: r.place ?? null,
          goal_time: r.goal_time ?? null,
          goal_time_ms: r.goal_time_ms ?? null,
        }))
      );
    if (resultsError) {
      return { data: null, error: resultsError.message };
    }

    // Upsert PBs for official results that are PBs
    const pbEntries = results
      .filter((r) => r.is_personal_best && r.is_official)
      .map((r) => ({
        swimmer_id:     swimmerId,
        event_name:     r.event_name,
        stroke:         r.stroke ?? "freestyle",
        distance:       r.distance ?? 0,
        pool_length:    competition.pool_length,
        time_text:      r.final_time,
        time_ms:        r.final_time_ms,
        achieved_at:    competition.competition_date,
        source:         "official" as const,
        competition_id: comp.id,
        notes:          null,
      }));

    if (pbEntries.length > 0) {
      await supabase
        .from("personal_bests")
        .upsert(pbEntries, {
          onConflict: "swimmer_id,event_name,pool_length",
          ignoreDuplicates: false,
        });
    }
  }

  return { data: comp, error: null };
}

export async function deleteCompetition(
  id: string,
  swimmerId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("competitions")
    .delete()
    .eq("id", id)
    .eq("swimmer_id", swimmerId);
  return { error: error?.message ?? null };
}

export async function getPersonalBests(
  swimmerId: string,
  poolLength?: PoolLength
): Promise<PersonalBest[]> {
  const supabase = await createClient();
  let query = supabase
    .from("personal_bests")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .eq("source", "official")
    .order("distance")
    .order("stroke");

  if (poolLength) query = query.eq("pool_length", poolLength);

  const { data } = await query;
  return data ?? [];
}
