import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listTrainingSessions } from "@/lib/db/training";
import { Button } from "@/components/ui/button";
import { SessionList } from "@/features/training/session-list";

export const metadata: Metadata = { title: "יומן אימונים" };

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const { data: sessions, total } = await listTrainingSessions(user.id, {
    from: params.from,
    to: params.to,
    limit,
    offset,
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">יומן אימונים</h1>
          <p className="text-navy-400 text-sm mt-0.5">
            {total} {total === 1 ? "אימון" : "אימונים"} מתועדים
          </p>
        </div>
        <Link href="/dashboard/training/new">
          <Button variant="signal" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            אימון חדש
          </Button>
        </Link>
      </div>

      {/* Session list */}
      <SessionList
        sessions={sessions}
        page={page}
        totalPages={totalPages}
        from={params.from}
        to={params.to}
      />
    </div>
  );
}
