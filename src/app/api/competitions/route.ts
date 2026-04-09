import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCompetition } from "@/lib/db/competitions";
import { competitionSchema } from "@/lib/validations/competition";
import { parseSwimTime } from "@/lib/utils";
import { SWIM_EVENTS } from "@/types";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const parsed = competitionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { results: rawResults, level, location, notes, ...compData } = parsed.data;

  // Resolve stroke + distance from SWIM_EVENTS and parse times
  const results = rawResults.map((r) => {
    const event = SWIM_EVENTS.find((e) => e.key === r.event_name);
    const finalTimeMs = parseSwimTime(r.final_time) ?? 0;
    const heatTimeMs  = r.heat_time ? (parseSwimTime(r.heat_time) ?? undefined) : undefined;
    const goalTimeMs  = r.goal_time ? (parseSwimTime(r.goal_time) ?? undefined) : undefined;
    return {
      event_name:       r.event_name,
      stroke:           event?.stroke,
      distance:         event?.distance,
      final_time:       r.final_time,
      final_time_ms:    finalTimeMs,
      heat_time:        r.heat_time || undefined,
      heat_time_ms:     heatTimeMs,
      place:            r.place,
      goal_time:        r.goal_time || undefined,
      goal_time_ms:     goalTimeMs,
      is_personal_best: r.is_personal_best,
      is_official:      r.is_official,
    };
  });

  const { data, error } = await createCompetition(
    user.id,
    {
      ...compData,
      level:    level ?? undefined,
      location: location || undefined,
      notes:    notes || undefined,
    },
    results
  );

  if (error || !data) {
    return NextResponse.json({ error: error ?? "Failed to create competition" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
