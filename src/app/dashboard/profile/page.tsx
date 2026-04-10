import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getSwimmerProfile, getCoachProfile } from "@/lib/db/profiles";
import { SwimmerProfileForm } from "@/features/profile/swimmer-profile-form";
import { CoachProfileForm } from "@/features/profile/coach-profile-form";
import { User } from "lucide-react";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/auth/login");

  const isSwimmer = profile.role === "swimmer";
  const [swimmerProfile, coachProfile] = await Promise.all([
    isSwimmer ? getSwimmerProfile(user.id) : Promise.resolve(null),
    !isSwimmer ? getCoachProfile(user.id)  : Promise.resolve(null),
  ]);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-navy-900 border border-surface-border flex items-center justify-center flex-shrink-0">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? ""}
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-navy-400" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{profile.full_name ?? "Your Profile"}</h1>
          <p className="text-navy-400 text-sm mt-0.5">{user.email} · {profile.role}</p>
        </div>
      </div>

      {/* Form */}
      {isSwimmer ? (
        <SwimmerProfileForm profile={profile} swimmerProfile={swimmerProfile} />
      ) : (
        <CoachProfileForm profile={profile} coachProfile={coachProfile} />
      )}
    </div>
  );
}
