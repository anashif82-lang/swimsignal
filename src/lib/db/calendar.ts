import { createClient } from "@/lib/supabase/server";

export interface CalendarTraining {
  id:            string;
  date:          string;
  title:         string | null;
  training_type: string;
  total_distance: number | null;
  status:        string;
}

export interface CalendarCompetition {
  id:       string;
  date:     string;
  name:     string;
  location: string | null;
  level:    string | null;
}

export interface CalendarData {
  trainings:    CalendarTraining[];
  competitions: CalendarCompetition[];
}

export async function getCalendarEvents(
  swimmerId: string,
  year: number,
  month: number   // 1-based
): Promise<CalendarData> {
  const supabase = await createClient();

  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to   = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const [trainingsResult, competitionsResult] = await Promise.all([
    supabase
      .from("training_sessions")
      .select("id, session_date, title, training_type, total_distance, status")
      .eq("swimmer_id", swimmerId)
      .gte("session_date", from)
      .lte("session_date", to)
      .order("session_date"),
    supabase
      .from("competitions")
      .select("id, competition_date, name, location, level")
      .eq("swimmer_id", swimmerId)
      .gte("competition_date", from)
      .lte("competition_date", to)
      .order("competition_date"),
  ]);

  return {
    trainings: (trainingsResult.data ?? []).map((s) => ({
      id:             s.id,
      date:           s.session_date,
      title:          s.title,
      training_type:  s.training_type,
      total_distance: s.total_distance,
      status:         s.status,
    })),
    competitions: (competitionsResult.data ?? []).map((c) => ({
      id:       c.id,
      date:     c.competition_date,
      name:     c.name,
      location: c.location,
      level:    c.level,
    })),
  };
}
