import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAIProvider } from "@/lib/ai/provider";
import { getOrCreateOrganization } from "@/lib/db/organizations";
import { upsertClient } from "@/lib/db/clients";
import {
  createProposal,
  saveProposalSections,
  recordProposalEvent,
  SECTION_ORDER,
} from "@/lib/db/proposals";
import { fullProposalSchema } from "@/lib/validations/proposal";
import type { GenerationInput, GenerationOutput, SectionKey } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse + validate body
    const body = await request.json();
    const parsed = fullProposalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Ensure org exists
    const { organization } = await getOrCreateOrganization(
      user.id,
      user.email!,
      user.user_metadata?.full_name ?? null
    );

    // Upsert client
    const client = await upsertClient(organization.id, {
      name: data.client_name,
      email: data.client_email || undefined,
      company: data.client_company || undefined,
    });

    // Build proposal title
    const title = `${data.project_type} for ${data.client_name}${
      data.client_company ? ` (${data.client_company})` : ""
    }`;

    // Create proposal record
    const proposal = await createProposal(organization.id, {
      title,
      client_id: client.id,
      project_type: data.project_type,
      project_description: data.project_description,
      pricing_model: data.pricing_model,
      currency: data.currency,
      total_amount: data.price_amount ? parseFloat(data.price_amount) : null,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      timeline: data.timeline,
      tone: data.tone,
    });

    // Build AI input
    const aiInput: GenerationInput = {
      client_name: data.client_name,
      client_company: data.client_company || null,
      project_type: data.project_type,
      project_description: data.project_description,
      goals: data.goals,
      challenges: data.challenges,
      deliverables: data.deliverables,
      out_of_scope: data.out_of_scope,
      revisions: data.revisions,
      pricing_model: data.pricing_model,
      price_amount: data.price_amount ? parseFloat(data.price_amount) : null,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      currency: data.currency,
      timeline: data.timeline,
      tone: data.tone,
      your_name: data.your_name,
      your_company: data.your_company,
      extra_notes: data.extra_notes,
    };

    // Generate with AI
    const aiProvider = createAIProvider();
    const generated: GenerationOutput = await aiProvider.generateProposal(aiInput);

    // Persist sections
    const sections = SECTION_ORDER.reduce((acc, key) => {
      acc[key] = generated[key as keyof GenerationOutput] ?? "";
      return acc;
    }, {} as Record<SectionKey, string>);

    await saveProposalSections(proposal.id, sections);

    // Record event
    await recordProposalEvent(proposal.id, "created", {
      user_id: user.id,
      ai_provider: process.env.OPENAI_API_KEY ? "openai" : "stub",
    });

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (err: unknown) {
    console.error("[generate]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
