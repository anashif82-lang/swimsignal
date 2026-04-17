import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAllPersonalBests, getIswimPlayerId } from "@/lib/db/iswim";
import { PersonalBestsList } from "@/features/training/personal-bests-list";

export const metadata: Metadata = { title: "שיאים אישיים" };

export default async function PersonalBestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [pbs, iswimLink] = await Promise.all([
    getAllPersonalBests(user.id),
    getIswimPlayerId(user.id),
  ]);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold mb-1 transition-all active:opacity-60"
            style={{ color: "#007AFF" }}
          >
            <ChevronRight className="h-3.5 w-3.5" />
            חזרה
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "#0F172A" }}>שיאים אישיים</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94A3B8" }}>
            {pbs.length} שיאים רשמיים מאיגוד השחייה
          </p>
        </div>
        <Link
          href="/dashboard/profile"
          className="px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.97] active:opacity-80"
          style={{ background: "rgba(0,122,255,0.08)", color: "#007AFF", border: "1px solid rgba(0,122,255,0.18)" }}
        >
          {iswimLink.player_id ? "סנכרן מחדש" : "חבר לאיגוד"}
        </Link>
      </div>

      <PersonalBestsList pbs={pbs} iswimConnected={Boolean(iswimLink.player_id)} />
    </div>
  );
}
