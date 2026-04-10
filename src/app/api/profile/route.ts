import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateSwimmerProfileSchema, updateCoachProfileSchema } from "@/lib/validations/profile";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  if (profile.role === "swimmer") {
    const parsed = updateSwimmerProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 422 });
    }
    const { full_name, club_name, birth_year, gender, strokes, main_events, goals } = parsed.data;

    const [profileResult, spResult] = await Promise.all([
      supabase.from("profiles").update({ full_name }).eq("id", user.id),
      supabase.from("swimmer_profiles").upsert(
        { id: user.id, club_name_raw: club_name, birth_year, gender, strokes, main_events, goals: goals || null },
        { onConflict: "id" }
      ),
    ]);

    if (profileResult.error) return NextResponse.json({ error: profileResult.error.message }, { status: 500 });
    if (spResult.error)      return NextResponse.json({ error: spResult.error.message },      { status: 500 });

  } else if (profile.role === "coach") {
    const parsed = updateCoachProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 422 });
    }
    const { full_name, club_name, bio, credentials } = parsed.data;

    const [profileResult, cpResult] = await Promise.all([
      supabase.from("profiles").update({ full_name }).eq("id", user.id),
      supabase.from("coach_profiles").upsert(
        { id: user.id, club_name_raw: club_name, bio: bio || null, credentials: credentials || null },
        { onConflict: "id" }
      ),
    ]);

    if (profileResult.error) return NextResponse.json({ error: profileResult.error.message }, { status: 500 });
    if (cpResult.error)      return NextResponse.json({ error: cpResult.error.message },      { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
