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
        <main className="flex-1 overflow-y-auto bg-navy-950 pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <SwimmerBottomNav />
    </div>
  );
}
