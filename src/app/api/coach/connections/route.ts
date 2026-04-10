import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const inviteSchema = z.object({
  swimmer_id: z.string().uuid(),
  message:    z.string().max(500).optional(),
});

// Coach invites a swimmer
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "coach")
    return NextResponse.json({ error: "Only coaches can invite swimmers" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { swimmer_id, message } = parsed.data;

  // Check not already connected/pending
  const { data: existing } = await supabase
    .from("coach_swimmer_connections")
    .select("id, status")
    .eq("coach_id", user.id)
    .eq("swimmer_id", swimmer_id)
    .maybeSingle();

  if (existing) {
    if (existing.status === "approved")
      return NextResponse.json({ error: "Already connected" }, { status: 409 });
    if (existing.status === "pending")
      return NextResponse.json({ error: "Invitation already sent" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("coach_swimmer_connections")
    .insert({ coach_id: user.id, swimmer_id, initiated_by: user.id, message })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify swimmer
  const { data: coachProfile } = await supabase
    .from("profiles").select("full_name").eq("id", user.id).single();
  await supabase.from("notifications").insert({
    recipient_id: swimmer_id,
    sender_id:    user.id,
    type:         "connection_request",
    title:        "Coach invitation",
    body:         `${coachProfile?.full_name ?? "A coach"} invited you to connect`,
  }).maybeSingle();

  return NextResponse.json(data, { status: 201 });
}
