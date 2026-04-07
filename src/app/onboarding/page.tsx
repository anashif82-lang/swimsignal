import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SwimmerOnboarding } from "@/features/onboarding/swimmer-onboarding";
import { CoachOnboarding } from "@/features/onboarding/coach-onboarding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Your Profile",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_done")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_done) {
    redirect(profile.role === "coach" ? "/coach" : "/dashboard");
  }

  const role = profile?.role ?? user.user_metadata?.role ?? "swimmer";

  return role === "coach"
    ? <CoachOnboarding />
    : <SwimmerOnboarding userId={user.id} />;
}
