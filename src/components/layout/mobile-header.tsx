"use client";

import Link from "next/link";
import { Bell, Plus } from "lucide-react";

interface MobileHeaderProps {
  unreadCount?: number;
  showAddButton?: boolean;
  addHref?: string;
  addLabel?: string;
}

export function MobileHeader({
  unreadCount = 0,
  showAddButton = false,
  addHref = "/dashboard/training/new",
  addLabel = "תעד",
}: MobileHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-navy-900/95 backdrop-blur-sm border-b border-surface-border px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-signal-400/10 border border-signal-400/30 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-signal-400"
            />
            <circle cx="16" cy="7" r="2.5" fill="currentColor" className="text-signal-400" />
          </svg>
        </div>
        <span className="font-bold text-white text-sm">SwimSignal</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 end-1 w-3.5 h-3.5 rounded-full bg-signal-400 text-navy-950 text-[9px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {showAddButton && (
          <Link
            href={addHref}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-signal-400 text-navy-950 text-xs font-semibold hover:bg-signal-300 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
