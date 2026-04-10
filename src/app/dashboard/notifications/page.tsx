import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listNotifications } from "@/lib/db/notifications";
import { NotificationsList } from "@/features/notifications/notifications-list";

export const metadata: Metadata = { title: "התראות" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const notifications = await listNotifications(user.id);
  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">התראות</h1>
        <p className="text-navy-400 text-sm mt-0.5">
          {unread > 0 ? `${unread} לא נקרא` : "הכל עדכני"}
        </p>
      </div>
      <NotificationsList notifications={notifications} />
    </div>
  );
}
