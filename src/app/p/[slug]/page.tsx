import { notFound } from "next/navigation";
import { getProposalBySlug, recordProposalEvent, SECTION_LABELS, SECTION_ORDER } from "@/lib/db/proposals";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Proposal } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicProposalPage({ params }: Props) {
  const { slug } = await params;
  const proposal = await getProposalBySlug(slug);

  if (!proposal) notFound();

  // Record view event (fire and forget)
  recordProposalEvent(proposal.id, "viewed", { slug }).catch(() => {});

  const sectionMap = buildSectionMap(proposal);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600">
              <span className="text-xs font-bold text-white">S</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">ScopeProp</span>
          </div>
          <span className="text-xs text-gray-400">
            Proposal · {formatDate(proposal.created_at)}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-12 px-6">
        {/* Proposal header */}
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3">
            Proposal
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
            {proposal.title}
          </h1>
          {proposal.client && (
            <p className="text-gray-500 text-sm">
              Prepared for{" "}
              <span className="font-medium text-gray-700">
                {proposal.client.name}
                {proposal.client.company ? `, ${proposal.client.company}` : ""}
              </span>
            </p>
          )}

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {proposal.project_type && (
              <Chip>{proposal.project_type}</Chip>
            )}
            {proposal.timeline && (
              <Chip>Timeline: {proposal.timeline}</Chip>
            )}
            {proposal.total_amount && (
              <Chip className="bg-violet-50 text-violet-700 border-violet-100">
                {formatCurrency(proposal.total_amount, proposal.currency)}
              </Chip>
            )}
            {proposal.hourly_rate && (
              <Chip className="bg-violet-50 text-violet-700 border-violet-100">
                {formatCurrency(proposal.hourly_rate, proposal.currency)}/hr
              </Chip>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTION_ORDER.map((key) => {
            const content = sectionMap[key];
            if (!content) return null;
            return (
              <Section key={key} label={SECTION_LABELS[key]} content={content} />
            );
          })}
        </div>

        {/* CTA footer */}
        <div className="mt-12 rounded-2xl bg-violet-600 text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to move forward?</h2>
          <p className="text-violet-200 text-sm mb-6">
            Reply to this proposal or reach out directly to get started.
          </p>
          {proposal.client?.email ? (
            <a
              href={`mailto:${proposal.client.email}?subject=Re: ${encodeURIComponent(proposal.title)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50 transition-colors"
            >
              Accept & get started
            </a>
          ) : (
            <div className="text-violet-200 text-sm">
              Contact us to proceed with this proposal.
            </div>
          )}
        </div>

        {/* Powered by */}
        <div className="mt-8 text-center text-xs text-gray-400">
          Created with{" "}
          <a href="/" className="text-violet-500 hover:underline">
            ScopeProp
          </a>
        </div>
      </div>
    </div>
  );
}

function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

function Section({ label, content }: { label: string; content: string }) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </h2>
      </div>
      <div className="px-6 py-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function buildSectionMap(proposal: Proposal): Record<string, string> {
  const map: Record<string, string> = {};
  for (const s of proposal.sections ?? []) {
    map[s.section_key] = s.section_content;
  }
  return map;
}
