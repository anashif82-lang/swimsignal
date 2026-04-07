import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CoachSidebar } from "@/components/layout/coach-sidebar";

export default async function CoachLayout({
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
  if (profile.role !== "coach") redirect("/dashboard");

  return (
    <div className="flex h-dvh overflow-hidden">
      <CoachSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto bg-navy-950">
        {children}
      </main>
    </div>
  );
}
