import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SwimmerSidebar } from "@/components/layout/swimmer-sidebar";
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
      <main className="flex-1 overflow-y-auto bg-navy-950">
        {children}
      </main>
    </div>
  );
}
