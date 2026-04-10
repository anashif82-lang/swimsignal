import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Params { params: Promise<{ id: string }> }

export async function DELETE(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const deleteAll = searchParams.get("all") === "true";

  if (deleteAll) {
    // Delete all instances of this recurring group
    const { data: session } = await supabase
      .from("scheduled_sessions")
      .select("recurrence_group_id")
      .eq("id", id)
      .eq("swimmer_id", user.id)
      .single();

    if (session?.recurrence_group_id) {
      await supabase
        .from("scheduled_sessions")
        .delete()
        .eq("recurrence_group_id", session.recurrence_group_id)
        .eq("swimmer_id", user.id);
    } else {
      await supabase.from("scheduled_sessions").delete().eq("id", id).eq("swimmer_id", user.id);
    }
  } else {
    await supabase.from("scheduled_sessions").delete().eq("id", id).eq("swimmer_id", user.id);
  }

  return NextResponse.json({ ok: true });
}
