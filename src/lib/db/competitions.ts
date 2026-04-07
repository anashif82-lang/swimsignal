import { createClient } from "@/lib/supabase/server";
import type { Competition, PersonalBest, PoolLength } from "@/types";

export async function listCompetitions(swimmerId: string): Promise<Competition[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("competitions")
    .select("*, results:competition_results(*)")
    .eq("swimmer_id", swimmerId)
    .order("competition_date", { ascending: false });
  return data ?? [];
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
