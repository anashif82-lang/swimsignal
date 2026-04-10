import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markAllAsRead } from "@/lib/db/notifications";

// PATCH /api/notifications — mark all as read
export async function PATCH(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await markAllAsRead(user.id);
  return NextResponse.json({ ok: true });
}
