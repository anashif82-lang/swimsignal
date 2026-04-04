"use client";

import type { ProposalFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface StepReviewProps {
  data: Partial<ProposalFormData>;
  onGenerate: () => void;
  onBack: () => void;
  loading: boolean;
}

export function StepReview({ data, onGenerate, onBack, loading }: StepReviewProps) {
  const sections = [
    {
      title: "Client",
      rows: [
        ["Name", data.client_name],
        ["Email", data.client_email || "—"],
        ["Company", data.client_company || "—"],
      ],
    },
    {
      title: "Project",
      rows: [
        ["Type", data.project_type],
        ["Description", data.project_description],
        ["Goals", data.goals],
      ],
    },
    {
      title: "Scope",
      rows: [
        ["Deliverables", data.deliverables],
        ["Out of scope", data.out_of_scope || "—"],
        ["Revisions", data.revisions || "—"],
      ],
    },
    {
      title: "Pricing",
      rows: [
        ["Model", data.pricing_model],
        [
          "Amount",
          data.pricing_model === "hourly"
            ? `${data.hourly_rate} ${data.currency}/hr`
            : `${data.currency} ${data.price_amount}`,
        ],
        ["Timeline", data.timeline],
      ],
    },
    {
      title: "Style",
      rows: [
        ["Tone", data.tone],
        ["Prepared by", `${data.your_name}${data.your_company ? `, ${data.your_company}` : ""}`],
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Review & generate
        </h2>
        <p className="text-sm text-gray-500">
          Confirm your inputs, then let AI write the full proposal.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map(({ title, rows }) => (
          <div key={title} className="rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {title}
            </div>
            <div className="divide-y divide-gray-50">
              {rows.map(([label, value]) => (
                <div key={label} className="flex gap-4 px-4 py-2.5 text-sm">
                  <span className="w-32 flex-shrink-0 text-gray-500">{label}</span>
                  <span className="text-gray-900 whitespace-pre-wrap break-words flex-1">
                    {value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="rounded-xl bg-violet-50 border border-violet-100 px-5 py-4 flex items-center gap-3">
          <div className="animate-spin h-5 w-5 rounded-full border-2 border-violet-600 border-t-transparent flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-violet-900">Generating your proposal…</div>
            <div className="text-xs text-violet-600 mt-0.5">
              AI is writing your scope, timeline, and pricing sections
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          ← Back
        </Button>
        <Button onClick={onGenerate} loading={loading} size="lg">
          <Zap className="h-4 w-4" />
          Generate proposal
        </Button>
      </div>
    </div>
  );
}
