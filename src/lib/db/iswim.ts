// ============================================================
// iswim db layer — server-only.
// ============================================================
// Responsibilities:
//   1. store/read the swimmer's iswim_player_id on swimmer_profiles
//   2. fetch + parse the loglig player page and upsert personal_bests
//   3. query recent PBs for the home dashboard
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { fetchPlayerPage, parsePlayerPage } from "@/lib/iswim/parser";
import type { PersonalBest } from "@/types";

export interface IswimSyncResult {
  player_id:     number;
  parsed_count:  number;
  inserted:      number;
  full_name:     string | null;
  last_sync_at:  string;
}

export async function getIswimPlayerId(swimmerId: string): Promise<{ player_id: number | null; last_sync_at: string | null }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("swimmer_profiles")
    .select("iswim_player_id, iswim_last_sync_at")
    .eq("id", swimmerId)
    .single();
  return {
    player_id:    data?.iswim_player_id ?? null,
    last_sync_at: data?.iswim_last_sync_at ?? null,
  };
}

/**
 * Fetches the player page from loglig, parses it, replaces all previously
 * synced iswim PBs for this swimmer with the fresh set, and returns stats.
 */
export async function syncPersonalBestsFromIswim(
  swimmerId: string,
  playerId:  number,
): Promise<IswimSyncResult> {
  const html   = await fetchPlayerPage(playerId);
  const parsed = parsePlayerPage(html);

  const supabase = await createClient();

  // 1. remove old iswim-sourced rows for this swimmer
  await supabase
    .from("personal_bests")
    .delete()
    .eq("swimmer_id", swimmerId)
    .eq("source", "iswim");

  // 2. insert fresh set (one row per event+pool)
  let inserted = 0;
  if (parsed.personal_bests.length > 0) {
    const rows = parsed.personal_bests.map((pb) => ({
      swimmer_id:  swimmerId,
      event_name:  pb.event_name,
      stroke:      pb.stroke,
      distance:    pb.distance,
      pool_length: pb.pool_length,
      time_text:   pb.time_text,
      time_ms:     pb.time_ms,
      achieved_at: pb.achieved_at,
      source:      "iswim" as const,
      notes:       pb.competition_name,
    }));
    const { error, count } = await supabase
      .from("personal_bests")
      .insert(rows, { count: "exact" });
    if (error) throw new Error(`insert personal_bests: ${error.message}`);
    inserted = count ?? rows.length;
  }

  // 3. persist player_id + last_sync_at on swimmer_profiles
  const now = new Date().toISOString();
  await supabase
    .from("swimmer_profiles")
    .upsert(
      { id: swimmerId, iswim_player_id: playerId, iswim_last_sync_at: now },
      { onConflict: "id" },
    );

  return {
    player_id:    playerId,
    parsed_count: parsed.personal_bests.length,
    inserted,
    full_name:    parsed.full_name,
    last_sync_at: now,
  };
}

/**
 * Recent PBs for the home-screen middle card. Prefers iswim sources
 * when the same event appears in multiple sources; falls back to official.
 * Ordered by achieved_at DESC.
 */
export async function getRecentPersonalBests(
  swimmerId: string,
  limit = 3,
): Promise<PersonalBest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("personal_bests")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .in("source", ["iswim", "official"])
    .order("achieved_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAllPersonalBests(swimmerId: string): Promise<PersonalBest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("personal_bests")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .in("source", ["iswim", "official"])
    .order("achieved_at", { ascending: false });
  return data ?? [];
}
