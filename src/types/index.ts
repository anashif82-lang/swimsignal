// ─── Database entity types ───────────────────────────────────────────────────

export type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "declined";

export type PricingModel = "fixed" | "hourly" | "retainer" | "milestone";

export type ProposalTone = "professional" | "friendly" | "formal" | "creative";

export type EventType =
  | "created"
  | "updated"
  | "viewed"
  | "shared"
  | "accepted"
  | "declined";

// ─── Organization ─────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan: "free" | "pro" | "agency";
  created_at: string;
  updated_at: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  organization_id: string | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "owner" | "member";
  created_at: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  organization_id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  created_at: string;
}

// ─── Proposal ─────────────────────────────────────────────────────────────────

export interface Proposal {
  id: string;
  organization_id: string;
  client_id: string | null;
  title: string;
  status: ProposalStatus;
  project_type: string;
  project_description: string;
  pricing_model: PricingModel;
  currency: string;
  total_amount: number | null;
  hourly_rate: number | null;
  timeline: string | null;
  tone: ProposalTone;
  public_slug: string;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  client?: Client;
  sections?: ProposalSection[];
}

// ─── Proposal Section ─────────────────────────────────────────────────────────

export type SectionKey =
  | "executive_summary"
  | "problem_understanding"
  | "scope_of_work"
  | "deliverables"
  | "timeline"
  | "pricing"
  | "assumptions"
  | "exclusions"
  | "next_steps";

export interface ProposalSection {
  id: string;
  proposal_id: string;
  section_key: SectionKey;
  section_label: string;
  section_content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Proposal Event ───────────────────────────────────────────────────────────

export interface ProposalEvent {
  id: string;
  proposal_id: string;
  event_type: EventType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── AI Generation ────────────────────────────────────────────────────────────

export interface GenerationInput {
  client_name: string;
  client_company: string | null;
  project_type: string;
  project_description: string;
  goals: string;
  challenges: string;
  deliverables: string;
  out_of_scope: string;
  revisions: string;
  pricing_model: PricingModel;
  price_amount: number | null;
  hourly_rate: number | null;
  currency: string;
  timeline: string;
  tone: ProposalTone;
  your_name: string;
  your_company: string;
  extra_notes: string;
}

export interface GenerationOutput {
  executive_summary: string;
  problem_understanding: string;
  scope_of_work: string;
  deliverables: string;
  timeline: string;
  pricing: string;
  assumptions: string;
  exclusions: string;
  next_steps: string;
}

// ─── Form types ───────────────────────────────────────────────────────────────

export interface ProposalFormData {
  // Step 1: Client
  client_name: string;
  client_email: string;
  client_company: string;

  // Step 2: Project
  project_type: string;
  project_description: string;
  goals: string;
  challenges: string;

  // Step 3: Scope
  deliverables: string;
  out_of_scope: string;
  revisions: string;

  // Step 4: Pricing
  pricing_model: PricingModel;
  price_amount: string;
  hourly_rate: string;
  currency: string;
  timeline: string;

  // Step 5: Tone
  tone: ProposalTone;
  your_name: string;
  your_company: string;
  extra_notes: string;
}
