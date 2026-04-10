import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCoachSwimmers, getPendingConnectionRequests, getSentPendingInvites } from "@/lib/db/profiles";
import { InviteSwimmer } from "@/features/coach/invite-swimmer";
import { PendingRequests } from "@/features/coach/pending-requests";
import { SwimmersList } from "@/features/coach/swimmers-list";
import { SentInvites } from "@/features/coach/sent-invites";

export const metadata: Metadata = { title: "שחיינים" };

export default async function CoachSwimmersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [swimmers, pendingRequests, sentInvites] = await Promise.all([
    getCoachSwimmers(user.id),
    getPendingConnectionRequests(user.id),
    getSentPendingInvites(user.id),
  ]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">שחיינים</h1>
        <p className="text-navy-400 text-sm mt-0.5">
          {swimmers.length} מחוברים · {pendingRequests.length + sentInvites.length} ממתינים
        </p>
      </div>

      <InviteSwimmer />

      {pendingRequests.length > 0 && (
        <PendingRequests requests={pendingRequests} />
      )}

      {sentInvites.length > 0 && (
        <SentInvites invites={sentInvites} />
      )}

      <div className="card-surface rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">
          השחיינים שלך ({swimmers.length})
        </h2>
        <SwimmersList connections={swimmers} />
      </div>
    </div>
  );
}
