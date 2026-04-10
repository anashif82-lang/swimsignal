import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { swimmerOnboardingSchema } from "@/lib/validations/onboarding";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = swimmerOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { full_name, birth_year, gender, club_name, coach_id, strokes, main_events, goals } =
      parsed.data;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name, role: "swimmer", onboarding_done: true })
      .eq("id", user.id);

    if (profileError) throw profileError;

    const { error: spError } = await supabase
      .from("swimmer_profiles")
      .upsert({ id: user.id, birth_year, gender, club_name_raw: club_name, strokes, main_events, goals }, { onConflict: "id" });

    if (spError) throw spError;

    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (coach_id && uuidRe.test(coach_id)) {
      await supabase
        .from("coach_swimmer_connections")
        .insert({ swimmer_id: user.id, coach_id, initiated_by: user.id, status: "pending" });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[onboarding/swimmer]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
