import { createClient } from "@/lib/supabase/server";

export interface SwimmerStats {
  totalSessions:     number;
  totalDistanceKm:   number;
  totalCompetitions: number;
  pbCount:           number;
  sessionsThisMonth: number;
}

export interface EventProgressPoint {
  event_name:       string;
  final_time_ms:    number;
  final_time:       string;
  competition_date: string;
  competition_name: string;
  is_personal_best: boolean;
}

export async function getSwimmerStats(swimmerId: string): Promise<SwimmerStats> {
  const supabase = await createClient();

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  const monthISO = thisMonthStart.toISOString().split("T")[0];

  const [sessions, competitions, pbs, monthSessions] = await Promise.all([
    supabase
      .from("training_sessions")
      .select("total_distance", { count: "exact" })
      .eq("swimmer_id", swimmerId),
    supabase
      .from("competitions")
      .select("id", { count: "exact", head: true })
      .eq("swimmer_id", swimmerId),
    supabase
      .from("personal_bests")
      .select("id", { count: "exact", head: true })
      .eq("swimmer_id", swimmerId)
      .eq("source", "official"),
    supabase
      .from("training_sessions")
      .select("id", { count: "exact", head: true })
      .eq("swimmer_id", swimmerId)
      .gte("session_date", monthISO),
  ]);

  const totalDistance = sessions.data?.reduce(
    (sum, s) => sum + (s.total_distance ?? 0),
    0
  ) ?? 0;

  return {
    totalSessions:     sessions.count    ?? 0,
    totalDistanceKm:   Math.round(totalDistance / 1000 * 10) / 10,
    totalCompetitions: competitions.count ?? 0,
    pbCount:           pbs.count          ?? 0,
    sessionsThisMonth: monthSessions.count ?? 0,
  };
}

export async function getEventProgressData(
  swimmerId: string
): Promise<EventProgressPoint[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("competition_results")
    .select(`
      event_name,
      final_time_ms,
      final_time,
      is_personal_best,
      competitions ( competition_date, name )
    `)
    .eq("swimmer_id", swimmerId)
    .eq("is_official", true)
    .gt("final_time_ms", 0)
    .order("competitions(competition_date)", { ascending: true });

  if (!data) return [];

  return data.map((r) => {
    const comp = r.competitions as unknown as { competition_date: string; name: string } | null;
    return {
      event_name:       r.event_name,
      final_time_ms:    r.final_time_ms,
      final_time:       r.final_time,
      competition_date: comp?.competition_date ?? "",
      competition_name: comp?.name ?? "",
      is_personal_best: r.is_personal_best,
    };
  });
}
