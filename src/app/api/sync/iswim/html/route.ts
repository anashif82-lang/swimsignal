// ============================================================
// POST /api/sync/iswim/html
// ============================================================
// Fallback: accepts HTML pasted by the user (after they View Source
// their own player page) and parses it server-side. Used when the
// direct fetch from our server to loglig.com is blocked.
// Body: { iswim_player_id: number, html: string }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncPersonalBestsFromHtml } from "@/lib/db/iswim";

export const runtime = "nodejs";
export const maxDuration = 30;

function extractPlayerId(input: { iswim_player_id?: unknown; iswim_url?: unknown; html?: unknown }): number | null {
  if (typeof input.iswim_player_id === "number" && Number.isFinite(input.iswim_player_id)) {
    return Math.trunc(input.iswim_player_id);
  }
  if (typeof input.iswim_player_id === "string") {
    const n = parseInt(input.iswim_player_id, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  if (typeof input.iswim_url === "string") {
    const m = input.iswim_url.match(/\/Players\/Details\/(\d+)/i);
    if (m) return parseInt(m[1], 10);
  }
  // Last resort: try to pull it out of the pasted HTML.
  if (typeof input.html === "string") {
    const m = input.html.match(/\/Players\/Details\/(\d+)/);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.html !== "string" || body.html.length < 200) {
    return NextResponse.json(
      { error: "Missing or too-short HTML body" },
      { status: 400 },
    );
  }

  const playerId = extractPlayerId(body);
  if (!playerId) {
    return NextResponse.json(
      { error: "Could not determine player ID. Please paste the URL too." },
      { status: 422 },
    );
  }

  try {
    const result = await syncPersonalBestsFromHtml(user.id, playerId, body.html);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
