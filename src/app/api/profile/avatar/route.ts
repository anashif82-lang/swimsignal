import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Called after the client uploads the file directly to Supabase Storage.
// Receives the final public URL and persists it to profiles.avatar_url.
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const url  = typeof body?.url === "string" ? body.url.trim() : null;
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
