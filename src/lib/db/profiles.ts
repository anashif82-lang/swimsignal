import { createClient } from "@/lib/supabase/server";
import type { Profile, SwimmerProfile, CoachProfile, CoachWithProfile, SwimmerStats } from "@/types";

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "full_name" | "avatar_url" | "preferred_lang" | "onboarding_done">>
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  return data ?? null;
}

// ─── SWIMMER PROFILE ──────────────────────────────────────────────────────────

export async function getSwimmerProfile(userId: string): Promise<SwimmerProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("swimmer_profiles")
    .select("*, club:clubs(*)")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export async function upsertSwimmerProfile(
  userId: string,
  profileData: Partial<Omit<SwimmerProfile, "id" | "club" | "updated_at">>
): Promise<SwimmerProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("swimmer_profiles")
    .upsert({ id: userId, ...profileData }, { onConflict: "id" })
    .select("*, club:clubs(*)")
    .single();
  return data ?? null;
}

// ─── COACH PROFILE ────────────────────────────────────────────────────────────

export async function getCoachProfile(userId: string): Promise<CoachProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coach_profiles")
    .select("*, club:clubs(*)")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export async function upsertCoachProfile(
  userId: string,
  profileData: Partial<Omit<CoachProfile, "id" | "club" | "updated_at">>
): Promise<CoachProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coach_profiles")
    .upsert({ id: userId, ...profileData }, { onConflict: "id" })
    .select("*, club:clubs(*)")
    .single();
  return data ?? null;
}

// ─── SWIMMER SEARCH ───────────────────────────────────────────────────────────

export async function searchSwimmers(
  query: string,
  limit = 10
): Promise<{ id: string; full_name: string | null; avatar_url: string | null; club_name: string | null }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, swimmer_profiles(club_name_raw)")
    .eq("role", "swimmer")
    .eq("onboarding_done", true)
    .ilike("full_name", `%${query}%`)
    .limit(limit);

  if (!data) return [];
  return data.map((p) => ({
    id:         p.id,
    full_name:  p.full_name,
    avatar_url: p.avatar_url,
    club_name:  (p.swimmer_profiles as unknown as { club_name_raw: string | null }[] | null)?.[0]?.club_name_raw ?? null,
  }));
}

export async function getSentPendingInvites(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coach_swimmer_connections")
    .select("*, swimmer:profiles!swimmer_id(id, full_name, avatar_url)")
    .eq("coach_id", coachId)
    .eq("initiated_by", coachId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ─── COACH SEARCH ─────────────────────────────────────────────────────────────

export async function searchCoaches(
  query: string
): Promise<CoachWithProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("search_coaches", { search_query: query, result_limit: 10 });
  if (!data) return [];

  return data.map((row: { id: string; full_name: string; avatar_url: string; club_name: string }) => ({
    profile: {
      id: row.id,
      full_name: row.full_name,
      avatar_url: row.avatar_url,
      role: "coach" as const,
    } as Profile,
    coach_profile: {
      id: row.id,
      club_name_raw: row.club_name,
      club_id: null,
      bio: null,
      credentials: null,
      updated_at: "",
    },
  }));
}

// ─── SWIMMER STATS ────────────────────────────────────────────────────────────

export async function getSwimmerStats(swimmerId: string): Promise<SwimmerStats | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("get_swimmer_stats", { p_swimmer_id: swimmerId });
  return data ?? null;
}

// ─── CONNECTIONS ──────────────────────────────────────────────────────────────

export async function getMyCoach(swimmerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coach_swimmer_connections")
    .select("*, coach:profiles!coach_id(*)")
    .eq("swimmer_id", swimmerId)
    .eq("status", "approved")
    .single();
  return data ?? null;
}

export async function getPendingConnectionRequests(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coach_swimmer_connections")
    .select("*, swimmer:profiles!swimmer_id(*, swimmer_profiles(*))")
    .eq("coach_id", coachId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getCoachSwimmers(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coach_swimmer_connections")
    .select("*, swimmer:profiles!swimmer_id(*, swimmer_profiles(*))")
    .eq("coach_id", coachId)
    .eq("status", "approved")
    .order("approved_at", { ascending: false });
  return data ?? [];
}

export async function requestCoachConnection(
  swimmerId: string,
  coachId: string,
  message?: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coach_swimmer_connections")
    .insert({
      swimmer_id: swimmerId,
      coach_id: coachId,
      initiated_by: swimmerId,
      message,
    })
    .select()
    .single();
  return { data, error };
}

export async function updateConnectionStatus(
  connectionId: string,
  status: "approved" | "rejected",
  coachId: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coach_swimmer_connections")
    .update({
      status,
      approved_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", connectionId)
    .eq("coach_id", coachId)
    .select()
    .single();
  return { data, error };
}
