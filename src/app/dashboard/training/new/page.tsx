import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SessionForm } from "@/features/training/session-form";

export const metadata: Metadata = { title: "Log Training Session" };

export default async function NewTrainingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/training"
          className="text-navy-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Log Training Session</h1>
          <p className="text-navy-400 text-sm mt-0.5">Record a new training session</p>
        </div>
      </div>

      <SessionForm />
    </div>
  );
}
