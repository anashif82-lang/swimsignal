import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SwimmerSidebar } from "@/components/layout/swimmer-sidebar";
import { SwimmerBottomNav } from "@/components/layout/swimmer-bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { getUnreadCount } from "@/lib/db/notifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");
  if (!profile.onboarding_done) redirect("/onboarding");

  const unreadCount = await getUnreadCount(user.id);

  return (
    <div className="flex h-dvh overflow-hidden">
      <SwimmerSidebar profile={profile} unreadCount={unreadCount} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader unreadCount={unreadCount} showAddButton addHref="/dashboard/training/new" addLabel="תעד" />
        <main
          className="flex-1 overflow-y-auto pb-16 md:pb-0 relative"
          style={{
            background: [
              /* sky-light bloom at the top — simulates soft light from above */
              "radial-gradient(ellipse 90% 45% at 50% -5%, rgba(147,210,255,0.28) 0%, transparent 65%)",
              /* soft shimmer pocket — lower right, like a water reflection */
              "radial-gradient(ellipse 55% 28% at 82% 65%, rgba(186,224,255,0.14) 0%, transparent 60%)",
              /* base gradient — very light sky-blue, barely shifts */
              "linear-gradient(180deg, #EDF5FF 0%, #E6F0FC 38%, #ECF6FF 68%, #F0F8FA 100%)",
            ].join(", "),
          }}
        >
          {/* Subtle wave overlay — very faint water-surface hint */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
            <svg
              viewBox="0 0 390 844"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full opacity-[0.05]"
            >
              <path d="M0 500 Q97 460 195 500 Q293 540 390 500 L390 560 Q293 600 195 560 Q97 520 0 560Z" fill="#3b82f6"/>
              <path d="M0 620 Q97 580 195 620 Q293 660 390 620 L390 670 Q293 710 195 670 Q97 630 0 670Z" fill="#0ea5e9"/>
              <path d="M0 720 Q97 690 195 720 Q293 750 390 720 L390 760 Q293 790 195 760 Q97 730 0 760Z" fill="#3b82f6" opacity="0.6"/>
            </svg>
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
      <SwimmerBottomNav />
    </div>
  );
}
