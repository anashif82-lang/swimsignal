import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateOrganization } from "@/lib/db/organizations";
import { listProposals } from "@/lib/db/proposals";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProposalRow } from "@/features/proposals/proposal-row";
import { formatDate, statusColor, statusLabel } from "@/lib/utils";
import { PlusCircle, FileText, Send, CheckCircle2, Pencil } from "lucide-react";
import type { Proposal } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { organization } = await getOrCreateOrganization(
    user.id,
    user.email!,
    user.user_metadata?.full_name ?? null
  );

  const proposals = await listProposals(organization.id);

  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === "draft").length,
    sent: proposals.filter((p) => p.status === "sent" || p.status === "viewed").length,
    accepted: proposals.filter((p) => p.status === "accepted").length,
  };

  const recent = proposals.slice(0, 5);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {organization.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/proposals/new">
            <PlusCircle className="h-4 w-4" />
            New proposal
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total proposals",
            value: stats.total,
            icon: FileText,
            color: "text-gray-700",
            bg: "bg-gray-50",
          },
          {
            label: "Drafts",
            value: stats.draft,
            icon: Pencil,
            color: "text-gray-600",
            bg: "bg-gray-50",
          },
          {
            label: "Sent / Viewed",
            value: stats.sent,
            icon: Send,
            color: "text-blue-700",
            bg: "bg-blue-50",
          },
          {
            label: "Accepted",
            value: stats.accepted,
            icon: CheckCircle2,
            color: "text-green-700",
            bg: "bg-green-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent proposals */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Recent proposals
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/proposals">View all</Link>
        </Button>
      </div>

      {recent.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Proposal</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {recent.map((proposal) => (
                <ProposalRow key={proposal.id} proposal={proposal} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 mb-4">
        <FileText className="h-7 w-7 text-violet-500" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">
        No proposals yet
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Create your first AI-powered proposal and close your next deal faster.
      </p>
      <Button asChild>
        <Link href="/dashboard/proposals/new">
          <PlusCircle className="h-4 w-4" />
          Create first proposal
        </Link>
      </Button>
    </div>
  );
}
