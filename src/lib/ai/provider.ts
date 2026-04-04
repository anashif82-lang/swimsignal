/**
 * AI Provider abstraction.
 * Swap the provider by changing NEXT_PUBLIC_AI_PROVIDER env var.
 * Currently supports: openai (default), stub (for local dev without API key).
 */

import type { GenerationInput, GenerationOutput } from "@/types";

export interface AIProvider {
  generateProposal(input: GenerationInput): Promise<GenerationOutput>;
}

// ─── Stub provider (works without API key) ────────────────────────────────────

export class StubAIProvider implements AIProvider {
  async generateProposal(input: GenerationInput): Promise<GenerationOutput> {
    // Simulates a 1.5s generation delay in dev
    await new Promise((r) => setTimeout(r, 1500));

    const company = input.client_company ?? input.client_name;
    const price =
      input.pricing_model === "hourly"
        ? `${input.hourly_rate} ${input.currency}/hr`
        : `${input.currency} ${input.price_amount}`;

    return {
      executive_summary: `We are excited to present this proposal to ${company}. Based on our understanding of your requirements for ${input.project_type}, we are confident we can deliver exceptional results that meet your objectives and timeline.`,

      problem_understanding: `${company} requires ${input.project_type} work to address the following goals: ${input.goals}. ${input.challenges ? `Key challenges identified include: ${input.challenges}.` : ""}  Our approach is designed specifically to address these requirements.`,

      scope_of_work: `The following scope of work outlines the full engagement:\n\n${input.deliverables
        .split("\n")
        .filter(Boolean)
        .map((d, i) => `${i + 1}. ${d.trim()}`)
        .join("\n")}`,

      deliverables: input.deliverables
        .split("\n")
        .filter(Boolean)
        .map((d) => `• ${d.trim()}`)
        .join("\n"),

      timeline: `Estimated project duration: ${input.timeline}.\n\nPhase 1 – Discovery & Planning (Week 1–2): Requirements gathering, stakeholder alignment, and technical architecture.\n\nPhase 2 – Execution (Week 3 onwards): Core delivery of all agreed deliverables.\n\nPhase 3 – Review & Handover (Final week): QA, revisions${input.revisions ? ` (${input.revisions})` : ""}, and delivery.`,

      pricing: `**Pricing Model:** ${input.pricing_model.charAt(0).toUpperCase() + input.pricing_model.slice(1)}\n\n**Investment:** ${price}\n\n**Currency:** ${input.currency}\n\nThis investment covers all deliverables outlined in the scope of work. Payment terms and milestones will be agreed upon project commencement.`,

      assumptions: `• Client will provide timely feedback within 2 business days of each review.\n• All required assets, credentials, and access will be provided at project start.\n• Scope changes will be managed via a formal change request process.\n• The timeline assumes availability of key stakeholders for reviews.`,

      exclusions: `The following items are explicitly outside the scope of this engagement:\n${
        input.out_of_scope
          ? input.out_of_scope
              .split("\n")
              .filter(Boolean)
              .map((e) => `• ${e.trim()}`)
              .join("\n")
          : "• Any work not explicitly listed in the scope of work above.\n• Third-party licensing fees.\n• Ongoing maintenance post-delivery unless separately agreed."
      }`,

      next_steps: `To proceed with this engagement:\n\n1. Review this proposal and raise any questions.\n2. Sign and return this proposal.\n3. Provide a 50% deposit to confirm project start.\n4. We will schedule a kickoff call within 2 business days.\n\nWe look forward to working with you. Please don't hesitate to reach out with any questions.`,
    };
  }
}

// ─── OpenAI provider ─────────────────────────────────────────────────────────

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "gpt-4o") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateProposal(input: GenerationInput): Promise<GenerationOutput> {
    const prompt = buildPrompt(input);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are an expert proposal writer for freelancers and agencies. Write professional, persuasive, and client-ready proposals. Respond with a JSON object matching the exact schema requested.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error: ${err}`);
    }

    const data = await res.json();
    const raw = JSON.parse(data.choices[0].message.content) as GenerationOutput;
    return raw;
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createAIProvider(): AIProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key") {
    console.warn("[AI] No OPENAI_API_KEY found — using StubAIProvider");
    return new StubAIProvider();
  }
  return new OpenAIProvider(apiKey);
}

// ─── Prompt builder ──────────────────────────────────────────────────────────

function buildPrompt(input: GenerationInput): string {
  const price =
    input.pricing_model === "hourly"
      ? `${input.hourly_rate} ${input.currency}/hr`
      : `${input.price_amount} ${input.currency}`;

  return `
Generate a complete, professional business proposal as a JSON object.

CLIENT: ${input.client_name} ${input.client_company ? `at ${input.client_company}` : ""}
PROJECT TYPE: ${input.project_type}
DESCRIPTION: ${input.project_description}
GOALS: ${input.goals}
CHALLENGES: ${input.challenges || "Not specified"}
DELIVERABLES: ${input.deliverables}
OUT OF SCOPE: ${input.out_of_scope || "Not specified"}
REVISIONS: ${input.revisions || "Standard revisions included"}
PRICING: ${input.pricing_model} – ${price}
TIMELINE: ${input.timeline}
TONE: ${input.tone}
PREPARED BY: ${input.your_name}${input.your_company ? ` at ${input.your_company}` : ""}
EXTRA NOTES: ${input.extra_notes || "None"}

Return a JSON object with EXACTLY these keys (all values are strings, use markdown formatting within values):
{
  "executive_summary": "...",
  "problem_understanding": "...",
  "scope_of_work": "...",
  "deliverables": "...",
  "timeline": "...",
  "pricing": "...",
  "assumptions": "...",
  "exclusions": "...",
  "next_steps": "..."
}

Write in a ${input.tone} tone. Be specific, persuasive, and professional. Do not use placeholder text.
`.trim();
}
