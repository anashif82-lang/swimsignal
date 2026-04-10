import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getSwimmerProfile } from "@/lib/db/profiles";
import { getRecentSessions } from "@/lib/db/training";
import { getPersonalBests } from "@/lib/db/competitions";
import { formatSwimTime } from "@/lib/utils";
import { z } from "zod";

const messageSchema = z.object({
  role:    z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
});

function buildSystemPrompt(context: {
  name:     string | null;
  club:     string | null;
  age:      number | null;
  strokes:  string[];
  events:   string[];
  goals:    string | null;
  sessions: { date: string; type: string; distance: number | null; status: string; title: string | null }[];
  pbs:      { event: string; pool: string; time: string }[];
}): string {
  const today = new Date().toISOString().split("T")[0];

  const sessionsSummary = context.sessions.length > 0
    ? context.sessions.map(s =>
        `• ${s.date}: ${s.title ?? s.type}${s.distance ? ` (${s.distance}m)` : ""} — ${s.status}`
      ).join("\n")
    : "No recent sessions logged.";

  const pbsSummary = context.pbs.length > 0
    ? context.pbs.map(pb => `• ${pb.event} (${pb.pool}): ${pb.time}`).join("\n")
    : "No personal bests recorded yet.";

  return `You are an AI swimming coach assistant inside SwimSignal, a performance platform for competitive swimmers. Your role is to give personalized, practical coaching advice based on the swimmer's data.

Today's date: ${today}

SWIMMER PROFILE:
- Name: ${context.name ?? "Unknown"}
- Club: ${context.club ?? "Not specified"}
- Age: ${context.age ? `${context.age} years old` : "Not specified"}
- Main strokes: ${context.strokes.length > 0 ? context.strokes.join(", ") : "Not specified"}
- Main events: ${context.events.length > 0 ? context.events.join(", ") : "Not specified"}
- Goals: ${context.goals ?? "Not specified"}

RECENT TRAINING (last 7 sessions):
${sessionsSummary}

PERSONAL BESTS:
${pbsSummary}

COACHING GUIDELINES:
- Give specific, actionable advice based on the swimmer's actual data
- Reference their training history and PBs when relevant
- Keep responses concise — 2-4 paragraphs max unless a detailed breakdown is requested
- Use swimming terminology correctly (splits, turns, stroke rate, DPS, etc.)
- Be encouraging but honest about areas for improvement
- If asked about nutrition, recovery, or dryland training, give practical advice
- Do not make up performance data — only use the data provided above`;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success)
    return new Response("Invalid request", { status: 400 });

  // Build swimmer context
  const [profile, swimmerProfile, recentSessions, pbs] = await Promise.all([
    getProfile(user.id),
    getSwimmerProfile(user.id),
    getRecentSessions(user.id, 7),
    getPersonalBests(user.id),
  ]);

  const age = swimmerProfile?.birth_year
    ? new Date().getFullYear() - swimmerProfile.birth_year
    : null;

  const systemPrompt = buildSystemPrompt({
    name:    profile?.full_name ?? null,
    club:    swimmerProfile?.club_name_raw ?? null,
    age,
    strokes: swimmerProfile?.strokes ?? [],
    events:  swimmerProfile?.main_events ?? [],
    goals:   swimmerProfile?.goals ?? null,
    sessions: recentSessions.map((s) => ({
      date:     s.session_date,
      type:     s.training_type,
      distance: s.total_distance ?? null,
      status:   s.status,
      title:    s.title ?? null,
    })),
    pbs: pbs.map((pb) => ({
      event: pb.event_name,
      pool:  pb.pool_length,
      time:  formatSwimTime(pb.time_ms),
    })),
  });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  // Stream the response as SSE
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        const stream = anthropic.messages.stream({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system:     systemPrompt,
          messages:   parsed.data.messages,
        });

        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const data = JSON.stringify({ text: chunk.delta.text });
            controller.enqueue(enc.encode(`data: ${data}\n\n`));
          }
        }
        controller.enqueue(enc.encode("data: [DONE]\n\n"));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
}
