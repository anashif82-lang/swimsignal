import { createClient } from "@/lib/supabase/server";

export interface ScheduledSession {
  id:                  string;
  swimmer_id:          string;
  title:               string;
  training_type:       string;
  start_time:          string;  // ISO 8601
  end_time:            string;  // ISO 8601
  is_recurring:        boolean;
  recurrence_group_id: string | null;
  notes:               string | null;
}

export async function getScheduledSessions(
  swimmerId: string,
  from: string, // ISO date "YYYY-MM-DD"
  to:   string, // ISO date "YYYY-MM-DD"
): Promise<ScheduledSession[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("scheduled_sessions")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .gte("start_time", `${from}T00:00:00`)
    .lte("start_time", `${to}T23:59:59`)
    .order("start_time");
  return data ?? [];
}
