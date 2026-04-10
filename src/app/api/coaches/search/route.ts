import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, coach_profiles(club_name_raw)")
    .eq("role", "coach")
    .eq("onboarding_done", true)
    .ilike("full_name", `%${q}%`)
    .limit(10);

  const results = (data ?? []).map((p) => ({
    id:         p.id,
    full_name:  p.full_name,
    avatar_url: p.avatar_url,
    club_name:  (p.coach_profiles as unknown as { club_name_raw: string | null }[] | null)?.[0]?.club_name_raw ?? null,
  }));

  return NextResponse.json({ results });
}
