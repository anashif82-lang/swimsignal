// ============================================================
// POST /api/sync/iswim/player
// ============================================================
// Body: { iswim_player_id?: number, iswim_url?: string }
// If iswim_url is given we extract the numeric id from it.
// Syncs the swimmer's personal bests from loglig.com and stores them
// with source='iswim' in personal_bests.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncPersonalBestsFromIswim } from "@/lib/db/iswim";

export const runtime = "nodejs";

function extractPlayerId(input: { iswim_player_id?: unknown; iswim_url?: unknown }): number | null {
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
  return null;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const playerId = extractPlayerId(body);
  if (!playerId) {
    return NextResponse.json(
      { error: "Missing or invalid iswim_player_id / iswim_url" },
      { status: 422 },
    );
  }

  const rawUrl = typeof body.iswim_url === "string" && /^https?:\/\//i.test(body.iswim_url)
    ? body.iswim_url as string
    : null;

  try {
    const result = await syncPersonalBestsFromIswim(user.id, playerId, rawUrl);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
