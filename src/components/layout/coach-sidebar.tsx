"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Group, BarChart2, Bell, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import type { Profile } from "@/types";

const navItems = [
  { href: "/coach",           label: "Overview",  icon: LayoutDashboard },
  { href: "/coach/swimmers",  label: "Swimmers",  icon: Users            },
  { href: "/coach/groups",    label: "Groups",    icon: Group            },
  { href: "/coach/analytics", label: "Analytics", icon: BarChart2        },
];

interface CoachSidebarProps {
  profile: Profile;
}

export function CoachSidebar({ profile }: CoachSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <aside className="w-60 shrink-0 flex flex-col h-dvh bg-navy-900 border-e border-surface-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-surface-border">
        <div className="w-8 h-8 rounded-md bg-signal-400/10 border border-signal-400/30 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-signal-400"/>
            <circle cx="16" cy="7" r="2.5" fill="currentColor" className="text-signal-400"/>
          </svg>
        </div>
        <div>
          <span className="font-bold text-white text-sm block">SwimSignal</span>
          <span className="text-[10px] text-signal-400 font-medium uppercase tracking-wider">Coach</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/coach"
              ? pathname === "/coach"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link", isActive && "active")}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-surface-border space-y-1">
        <Link
          href="/coach/notifications"
          className={cn("sidebar-link", pathname === "/coach/notifications" && "active")}
        >
          <Bell className="h-4 w-4 shrink-0" />
          Notifications
        </Link>
        <Link
          href="/coach/profile"
          className={cn("sidebar-link", pathname === "/coach/profile" && "active")}
        >
          <User className="h-4 w-4 shrink-0" />
          Profile
        </Link>

        <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-surface-card border border-surface-border">
          <div className="w-8 h-8 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-navy-200">
                {getInitials(profile.full_name)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile.full_name ?? "Coach"}
            </p>
            <p className="text-xs text-navy-400 truncate">{profile.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-navy-400 hover:text-danger-400 hover:bg-danger-500/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
