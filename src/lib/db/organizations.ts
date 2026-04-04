import { createClient } from "@/lib/supabase/server";
import type { Organization, Profile } from "@/types";

export async function getOrCreateOrganization(
  userId: string,
  userEmail: string,
  fullName: string | null
): Promise<{ organization: Organization; profile: Profile }> {
  const supabase = await createClient();

  // Check if profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organization:organizations(*)")
    .eq("id", userId)
    .single();

  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.organization_id)
      .single();
    return { organization: org as Organization, profile: profile as Profile };
  }

  // Create organization
  const orgName = fullName ? `${fullName}'s Workspace` : "My Workspace";
  const orgSlug = userEmail.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();

  const { data: newOrg, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: orgName, slug: `${orgSlug}-${Date.now()}`, owner_id: userId })
    .select()
    .single();

  if (orgError) throw orgError;

  // Upsert profile
  const { data: newProfile, error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email: userEmail,
      full_name: fullName,
      organization_id: newOrg.id,
      role: "owner",
    })
    .select()
    .single();

  if (profileError) throw profileError;

  return {
    organization: newOrg as Organization,
    profile: newProfile as Profile,
  };
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data as Profile | null;
}
