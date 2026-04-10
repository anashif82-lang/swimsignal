"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SentInvite {
  id:      string;
  swimmer: { id: string; full_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  invites: SentInvite[];
}

export function SentInvites({ invites: initial }: Props) {
  const router  = useRouter();
  const [invites, setInvites] = useState(initial);
  const [cancelling, setCancelling] = useState<string | null>(null);

  if (invites.length === 0) return null;

  async function cancel(id: string) {
    setCancelling(id);
    const res = await fetch(`/api/coach/connections/${id}`, { method: "DELETE" });
    setCancelling(null);
    if (res.ok) {
      setInvites((prev) => prev.filter((inv) => inv.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="card-surface rounded-xl p-5 space-y-3">
      <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Sent Invites ({invites.length})
      </h2>
      <ul className="space-y-2">
        {invites.map((inv) => (
          <li key={inv.id} className="flex items-center gap-3 p-3 rounded-lg bg-navy-900/60 border border-surface-border">
            <div className="w-9 h-9 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-navy-200">
              {inv.swimmer?.avatar_url
                ? <img src={inv.swimmer.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                : getInitials(inv.swimmer?.full_name)
              }
            </div>
            <p className="flex-1 text-sm text-white">{inv.swimmer?.full_name ?? "Unknown"}</p>
            <span className="text-xs text-navy-500">Awaiting response</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-navy-500 hover:text-danger-400"
              disabled={cancelling === inv.id}
              onClick={() => cancel(inv.id)}
              title="Cancel invite"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
