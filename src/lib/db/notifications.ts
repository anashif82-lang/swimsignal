import { createClient } from "@/lib/supabase/server";

export interface Notification {
  id:           string;
  recipient_id: string;
  sender_id:    string | null;
  type:         string;
  title:        string;
  body:         string | null;
  is_read:      boolean;
  created_at:   string;
  sender?:      { full_name: string | null; avatar_url: string | null } | null;
}

export async function listNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*, sender:profiles!sender_id(full_name, avatar_url)")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as Notification[];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("is_read", false);
  return count ?? 0;
}

export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("recipient_id", userId);
}

export async function markAllAsRead(userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", userId)
    .eq("is_read", false);
}
