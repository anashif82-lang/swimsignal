import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { coachOnboardingSchema } from "@/lib/validations/onboarding";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = coachOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { full_name, club_name, bio, credentials } = parsed.data;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name, role: "coach", onboarding_done: true })
      .eq("id", user.id);

    if (profileError) throw profileError;

    const { error: cpError } = await supabase
      .from("coach_profiles")
      .upsert({ id: user.id, club_name_raw: club_name, bio, credentials }, { onConflict: "id" });

    if (cpError) throw cpError;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[onboarding/coach]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
