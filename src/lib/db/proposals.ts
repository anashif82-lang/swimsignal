import { createClient } from "@/lib/supabase/server";
import type {
  Proposal,
  ProposalSection,
  ProposalEvent,
  SectionKey,
  EventType,
} from "@/types";
import { nanoid } from "@/lib/utils";

export const SECTION_LABELS: Record<SectionKey, string> = {
  executive_summary: "Executive Summary",
  problem_understanding: "Our Understanding",
  scope_of_work: "Scope of Work",
  deliverables: "Deliverables",
  timeline: "Timeline",
  pricing: "Pricing",
  assumptions: "Assumptions",
  exclusions: "Exclusions",
  next_steps: "Next Steps",
};

export const SECTION_ORDER: SectionKey[] = [
  "executive_summary",
  "problem_understanding",
  "scope_of_work",
  "deliverables",
  "timeline",
  "pricing",
  "assumptions",
  "exclusions",
  "next_steps",
];

// ─── List proposals ───────────────────────────────────────────────────────────

export async function listProposals(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*, client:clients(*)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Proposal[];
}

// ─── Get proposal ─────────────────────────────────────────────────────────────

export async function getProposal(id: string, organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*, client:clients(*), sections:proposal_sections(*)")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .single();

  if (error) throw error;
  return data as Proposal;
}

// ─── Get proposal by public slug ──────────────────────────────────────────────

export async function getProposalBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*, client:clients(*), sections:proposal_sections(*)")
    .eq("public_slug", slug)
    .single();

  if (error) return null;
  return data as Proposal;
}

// ─── Create proposal ──────────────────────────────────────────────────────────

export async function createProposal(
  organizationId: string,
  input: {
    title: string;
    client_id: string | null;
    project_type: string;
    project_description: string;
    pricing_model: string;
    currency: string;
    total_amount: number | null;
    hourly_rate: number | null;
    timeline: string | null;
    tone: string;
  }
) {
  const supabase = await createClient();
  const slug = nanoid(12);

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      organization_id: organizationId,
      public_slug: slug,
      status: "draft",
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Proposal;
}

// ─── Save sections ────────────────────────────────────────────────────────────

export async function saveProposalSections(
  proposalId: string,
  sections: Record<SectionKey, string>
) {
  const supabase = await createClient();

  const rows = SECTION_ORDER.map((key, idx) => ({
    proposal_id: proposalId,
    section_key: key,
    section_label: SECTION_LABELS[key],
    section_content: sections[key] ?? "",
    sort_order: idx,
  }));

  // Upsert so repeated generation overwrites
  const { error } = await supabase
    .from("proposal_sections")
    .upsert(rows, { onConflict: "proposal_id,section_key" });

  if (error) throw error;
}

// ─── Update section ───────────────────────────────────────────────────────────

export async function updateProposalSection(
  proposalId: string,
  sectionKey: SectionKey,
  content: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposal_sections")
    .update({ section_content: content, updated_at: new Date().toISOString() })
    .eq("proposal_id", proposalId)
    .eq("section_key", sectionKey);

  if (error) throw error;
}

// ─── Update proposal status ───────────────────────────────────────────────────

export async function updateProposalStatus(
  id: string,
  status: Proposal["status"],
  organizationId: string
) {
  const supabase = await createClient();
  const extra: Record<string, string> = {};
  if (status === "sent") extra.sent_at = new Date().toISOString();
  if (status === "accepted") extra.accepted_at = new Date().toISOString();

  const { error } = await supabase
    .from("proposals")
    .update({ status, ...extra, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) throw error;
}

// ─── Record event ─────────────────────────────────────────────────────────────

export async function recordProposalEvent(
  proposalId: string,
  eventType: EventType,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createClient();
  await supabase.from("proposal_events").insert({
    proposal_id: proposalId,
    event_type: eventType,
    metadata,
  });
}

// ─── Get proposal events ──────────────────────────────────────────────────────

export async function getProposalEvents(proposalId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("proposal_events")
    .select("*")
    .eq("proposal_id", proposalId)
    .order("created_at", { ascending: false });
  return (data ?? []) as ProposalEvent[];
}
