"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, UserPlus, UserCheck, Dumbbell, Info } from "lucide-react";
import { formatRelativeTime, getInitials, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/db/notifications";

const TYPE_ICON: Record<string, React.ReactNode> = {
  connection_request:  <UserPlus  className="h-4 w-4 text-signal-400" />,
  connection_approved: <UserCheck className="h-4 w-4 text-success-400" />,
  workout_assigned:    <Dumbbell  className="h-4 w-4 text-warning-400" />,
  reminder:            <Bell      className="h-4 w-4 text-navy-400"    />,
  system:              <Info      className="h-4 w-4 text-navy-400"    />,
};

interface Props {
  notifications: Notification[];
}

export function NotificationsList({ notifications: initial }: Props) {
  const [items, setItems] = useState(initial);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = items.filter((n) => !n.is_read).length;

  async function markOne(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function markAll() {
    setMarkingAll(true);
    await fetch("/api/notifications", { method: "PATCH" });
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setMarkingAll(false);
  }

  if (items.length === 0) {
    return (
      <div className="card-surface rounded-xl p-12 text-center">
        <Bell className="h-10 w-10 text-navy-600 mx-auto mb-3" />
        <p className="text-navy-300 font-medium">אין התראות</p>
        <p className="text-navy-500 text-sm mt-1">
          כאן יופיעו בקשות חיבור ועדכונים.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-navy-400">
            {unreadCount} לא נקרא
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={markingAll}
            onClick={markAll}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            סמן הכל כנקרא
          </Button>
        </div>
      )}

      <div className="space-y-1">
        {items.map((n) => (
          <div
            key={n.id}
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border transition-colors",
              n.is_read
                ? "card-surface border-transparent"
                : "bg-signal-400/5 border-signal-400/20"
            )}
          >
            {/* Icon */}
            <div className="w-9 h-9 rounded-full bg-navy-800 border border-surface-border flex items-center justify-center flex-shrink-0 mt-0.5">
              {TYPE_ICON[n.type] ?? TYPE_ICON.system}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", n.is_read ? "text-navy-200" : "text-white")}>
                {n.title}
              </p>
              {n.body && (
                <p className="text-xs text-navy-400 mt-0.5 leading-relaxed">{n.body}</p>
              )}
              <p className="text-xs text-navy-600 mt-1">
                {formatRelativeTime(n.created_at)}
                {n.sender?.full_name && (
                  <span className="text-navy-500"> · {n.sender.full_name}</span>
                )}
              </p>
            </div>

            {/* Mark read */}
            {!n.is_read && (
              <button
                onClick={() => markOne(n.id)}
                className="flex-shrink-0 mt-0.5 p-1.5 rounded-md text-navy-500 hover:text-success-400 hover:bg-success-400/10 transition-colors"
                title="סמן כנקרא"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
