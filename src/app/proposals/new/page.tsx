import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProposalWizard } from "@/features/proposals/wizard/proposal-wizard";
import { ArrowLeft } from "lucide-react";

export default async function NewProposalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">
            New proposal
          </span>
        </div>
      </div>
      <ProposalWizard />
    </div>
  );
}
