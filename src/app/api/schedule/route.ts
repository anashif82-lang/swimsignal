import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
function isoDate(d: Date) { return d.toISOString().slice(0, 10); }
function addWeeks(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n * 7); return r; }

const createSchema = z.object({
  title:         z.string().min(1).max(100),
  training_type: z.enum(["water", "dryland", "gym", "other"]),
  start_time:    z.string().datetime({ offset: true }),
  end_time:      z.string().datetime({ offset: true }),
  is_recurring:  z.boolean().default(false),
  notes:         z.string().max(500).optional(),
  weeks_ahead:   z.number().int().min(1).max(52).default(12), // how many weeks to generate for recurring
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? isoDate(new Date());
  const to   = searchParams.get("to")   ?? isoDate(addWeeks(new Date(), 4));

  const { data, error } = await supabase
    .from("scheduled_sessions")
    .select("*")
    .eq("swimmer_id", user.id)
    .gte("start_time", `${from}T00:00:00`)
    .lte("start_time", `${to}T23:59:59`)
    .order("start_time");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { title, training_type, start_time, end_time, is_recurring, notes, weeks_ahead } = parsed.data;

  if (!is_recurring) {
    const { data, error } = await supabase
      .from("scheduled_sessions")
      .insert({ swimmer_id: user.id, title, training_type, start_time, end_time, is_recurring: false, notes })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }

  // Recurring: generate instances for the next N weeks
  const groupId = crypto.randomUUID();
  const startDate = new Date(start_time);
  const endDate   = new Date(end_time);
  const durationMs = endDate.getTime() - startDate.getTime();

  const rows = Array.from({ length: weeks_ahead }, (_, i) => {
    const s = new Date(startDate);
    s.setDate(s.getDate() + i * 7);
    const e = new Date(s.getTime() + durationMs);
    return {
      swimmer_id:          user.id,
      title,
      training_type,
      start_time:          s.toISOString(),
      end_time:            e.toISOString(),
      is_recurring:        true,
      recurrence_group_id: groupId,
      notes,
    };
  });

  const { data, error } = await supabase
    .from("scheduled_sessions")
    .insert(rows)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
