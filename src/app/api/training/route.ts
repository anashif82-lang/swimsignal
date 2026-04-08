import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTrainingSession } from "@/lib/db/training";
import { trainingSessionSchema } from "@/lib/validations/training";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = trainingSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { data, error } = await createTrainingSession(user.id, parsed.data);
  if (error || !data) {
    return NextResponse.json({ error: error ?? "Failed to create session" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
