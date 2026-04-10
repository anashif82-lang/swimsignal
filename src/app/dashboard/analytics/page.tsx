import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSwimmerStats, getEventProgressData } from "@/lib/db/analytics";
import { getWeeklyVolume } from "@/lib/db/training";
import { AnalyticsView } from "@/features/analytics/analytics-view";

export const metadata: Metadata = { title: "אנליטיקה" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [stats, weeklyVolume, eventData] = await Promise.all([
    getSwimmerStats(user.id),
    getWeeklyVolume(user.id, 12),
    getEventProgressData(user.id),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AnalyticsView
        stats={stats}
        weeklyVolume={weeklyVolume}
        eventData={eventData}
      />
    </div>
  );
}
