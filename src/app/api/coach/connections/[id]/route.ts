import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { status } = parsed.data;

    const { data: connection, error: fetchError } = await supabase
      .from("coach_swimmer_connections")
      .select("id, coach_id, swimmer_id, status")
      .eq("id", id)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (connection.coach_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (connection.status !== "pending") {
      return NextResponse.json({ error: "Connection is no longer pending" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("coach_swimmer_connections")
      .update({
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (status === "approved") {
      const { data: coachProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      await supabase.from("notifications").insert({
        recipient_id: connection.swimmer_id,
        sender_id: user.id,
        type: "connection_approved",
        title: "Connection approved",
        body: `${coachProfile?.full_name ?? "Your coach"} approved your connection request`,
      });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[coach/connections/PATCH]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
