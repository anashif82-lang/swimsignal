import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const requestSchema = z.object({
  coach_id: z.string().uuid(),
  message:  z.string().max(500).optional(),
});

// Swimmer requests to connect with a coach
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "swimmer")
    return NextResponse.json({ error: "Only swimmers can request a coach" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { coach_id, message } = parsed.data;

  const { data: existing } = await supabase
    .from("coach_swimmer_connections")
    .select("id, status")
    .eq("swimmer_id", user.id)
    .eq("coach_id", coach_id)
    .maybeSingle();

  if (existing) {
    if (existing.status === "approved")
      return NextResponse.json({ error: "Already connected" }, { status: 409 });
    if (existing.status === "pending")
      return NextResponse.json({ error: "Request already sent" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("coach_swimmer_connections")
    .insert({ swimmer_id: user.id, coach_id, initiated_by: user.id, message })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// Swimmer removes their current coach connection
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const connectionId = req.nextUrl.searchParams.get("id");
  if (!connectionId)
    return NextResponse.json({ error: "Missing connection id" }, { status: 400 });

  const { data: conn } = await supabase
    .from("coach_swimmer_connections")
    .select("swimmer_id")
    .eq("id", connectionId)
    .single();

  if (!conn || conn.swimmer_id !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase
    .from("coach_swimmer_connections")
    .delete()
    .eq("id", connectionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
