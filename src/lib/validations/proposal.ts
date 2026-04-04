import { z } from "zod";

// Helper: optional string that always resolves to string (never undefined)
const optStr = z
  .string()
  .optional()
  .transform((v) => v ?? "");

export const clientStepSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  client_email: z
    .string()
    .optional()
    .transform((v) => v ?? "")
    .pipe(z.string().refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: "Invalid email",
    })),
  client_company: optStr,
});

export const projectStepSchema = z.object({
  project_type: z.string().min(1, "Project type is required"),
  project_description: z
    .string()
    .min(20, "Please describe the project in at least 20 characters"),
  goals: z.string().min(10, "Please describe the project goals"),
  challenges: optStr,
});

export const scopeStepSchema = z.object({
  deliverables: z.string().min(10, "Please list at least one deliverable"),
  out_of_scope: optStr,
  revisions: optStr,
});

export const pricingStepSchema = z
  .object({
    pricing_model: z.enum(["fixed", "hourly", "retainer", "milestone"]),
    price_amount: optStr,
    hourly_rate: optStr,
    currency: z.string().min(1, "Currency is required"),
    timeline: z.string().min(1, "Timeline is required"),
  })
  .refine(
    (data) => {
      if (data.pricing_model === "hourly") return !!data.hourly_rate;
      return !!data.price_amount;
    },
    { message: "Please enter a price", path: ["price_amount"] }
  );

export const toneStepSchema = z.object({
  tone: z.enum(["professional", "friendly", "formal", "creative"]),
  your_name: z.string().min(1, "Your name is required"),
  your_company: optStr,
  extra_notes: optStr,
});

export const fullProposalSchema = clientStepSchema
  .merge(projectStepSchema)
  .merge(scopeStepSchema)
  .merge(pricingStepSchema)
  .merge(toneStepSchema);

export type ClientStepValues = z.infer<typeof clientStepSchema>;
export type ProjectStepValues = z.infer<typeof projectStepSchema>;
export type ScopeStepValues = z.infer<typeof scopeStepSchema>;
export type PricingStepValues = z.infer<typeof pricingStepSchema>;
export type ToneStepValues = z.infer<typeof toneStepSchema>;
export type FullProposalValues = z.infer<typeof fullProposalSchema>;
