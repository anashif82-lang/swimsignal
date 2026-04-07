"use client";

import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials, formatRelativeTime, ageFromBirthYear } from "@/lib/utils";
import type { CoachSwimmerConnection } from "@/types";

interface PendingRequestsProps {
  requests: CoachSwimmerConnection[];
}

export function PendingRequests({ requests: initialRequests }: PendingRequestsProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);

  if (requests.length === 0) return null;

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setLoading(id);
    try {
      const res = await fetch(`/api/coach/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="card-signal">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-surface-raised/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-warning-500/15 border border-warning-500/20 flex items-center justify-center">
            <Clock className="h-4 w-4 text-warning-400" />
          </div>
          <div className="text-start">
            <p className="text-sm font-semibold text-white">
              Pending Requests
            </p>
            <p className="text-xs text-navy-400">
              {requests.length} swimmer{requests.length !== 1 ? "s" : ""} waiting for approval
            </p>
          </div>
          <Badge variant="warning">{requests.length}</Badge>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-navy-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-navy-400" />
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          {requests.map((req) => {
            const swimmer = req.swimmer;
            const swimmerProfile = (req as any).swimmer?.swimmer_profiles?.[0];
            const age = swimmerProfile?.birth_year
              ? ageFromBirthYear(swimmerProfile.birth_year)
              : null;

            return (
              <div
                key={req.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-navy-900/50 border border-surface-border"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-navy-200">
                    {getInitials(swimmer?.full_name)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {swimmer?.full_name ?? "Unknown swimmer"}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {age && <span className="text-xs text-navy-400">Age {age}</span>}
                    {swimmerProfile?.club_name_raw && (
                      <span className="text-xs text-navy-400">{swimmerProfile.club_name_raw}</span>
                    )}
                    <span className="text-xs text-navy-500">
                      {formatRelativeTime(req.created_at)}
                    </span>
                  </div>
                  {req.message && (
                    <p className="text-xs text-navy-300 mt-2 italic">
                      &ldquo;{req.message}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger-400 hover:text-danger-300 hover:bg-danger-500/10"
                    loading={loading === req.id}
                    onClick={() => handleAction(req.id, "rejected")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="signal"
                    loading={loading === req.id}
                    onClick={() => handleAction(req.id, "approved")}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
