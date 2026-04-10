import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listCompetitions, getPersonalBests } from "@/lib/db/competitions";
import { CompetitionsView } from "@/features/competitions/competitions-view";

export const metadata: Metadata = { title: "תחרויות ושיאים אישיים" };

export default async function CompetitionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [competitions, pbs25, pbs50] = await Promise.all([
    listCompetitions(user.id),
    getPersonalBests(user.id, "25m"),
    getPersonalBests(user.id, "50m"),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <CompetitionsView
        competitions={competitions}
        pbs25={pbs25}
        pbs50={pbs50}
      />
    </div>
  );
}
