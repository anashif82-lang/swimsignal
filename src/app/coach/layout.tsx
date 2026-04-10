import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CoachSidebar } from "@/components/layout/coach-sidebar";
import { CoachBottomNav } from "@/components/layout/coach-bottom-nav";

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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header for coach */}
        <header className="md:hidden sticky top-0 z-40 bg-navy-900/95 backdrop-blur-sm border-b border-surface-border px-4 py-3 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-signal-400/10 border border-signal-400/30 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-signal-400"/>
                <circle cx="16" cy="7" r="2.5" fill="currentColor" className="text-signal-400"/>
              </svg>
            </div>
            <div>
              <span className="font-bold text-white text-sm block">SwimSignal</span>
              <span className="text-[10px] text-signal-400 font-medium uppercase tracking-wider">Coach</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-navy-950 pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <CoachBottomNav />
    </div>
  );
}
