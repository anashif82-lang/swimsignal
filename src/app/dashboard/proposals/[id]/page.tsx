import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateOrganization } from "@/lib/db/organizations";
import { getProposal, getProposalEvents } from "@/lib/db/proposals";
import { ProposalEditor } from "@/features/proposals/proposal-editor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProposalPage({ params }: Props) {
  const { id } = await params;

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

  let proposal;
  try {
    proposal = await getProposal(id, organization.id);
  } catch {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700 truncate">
            {proposal.title}
          </span>
        </div>
      </div>
      <ProposalEditor proposal={proposal} appUrl={appUrl} />
    </div>
  );
}
