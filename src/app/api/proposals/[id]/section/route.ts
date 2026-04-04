import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateOrganization } from "@/lib/db/organizations";
import { updateProposalSection, recordProposalEvent } from "@/lib/db/proposals";
import type { SectionKey } from "@/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { section_key, content } = await request.json();

    if (!section_key || content === undefined) {
      return NextResponse.json({ error: "Missing section_key or content" }, { status: 400 });
    }

    await updateProposalSection(id, section_key as SectionKey, content);
    await recordProposalEvent(id, "updated", { section_key });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[section-update]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
