"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, User, Settings, Globe, HelpCircle, LogOut, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
}

interface MobileHeaderProps {
  unreadCount?: number;
  profile?: ProfileData;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

// Menu items — mark future routes so they don't hard-404
const MENU_ITEMS = [
  { href: "/dashboard/profile",       label: "פרופיל",  icon: User,        live: true  },
  { href: "/dashboard/settings",      label: "הגדרות",  icon: Settings,    live: false },
  { href: "/dashboard/language",      label: "שפה",     icon: Globe,        live: false },
  { href: "/dashboard/help",          label: "עזרה",    icon: HelpCircle,  live: false },
] as const;

export function MobileHeader({ unreadCount = 0, profile }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const initials  = getInitials(profile?.full_name);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const Avatar = ({ size }: { size: "sm" | "lg" }) => {
    const cls = size === "sm"
      ? "w-7 h-7 text-xs font-bold"
      : "w-12 h-12 text-base font-bold";
    return (
      <div
        className={`${cls} rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white`}
        style={{ background: "linear-gradient(135deg, #5AAAD8, #4492C6)" }}
      >
        {profile?.avatar_url
          ? <img src={profile.avatar_url} alt={firstName} className="w-full h-full object-cover" />
          : initials}
      </div>
    );
  };

  return (
    <>
      {/* ── Header bar ── */}
      <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="#4B7BA6" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="7" r="2.5" fill="#4B7BA6" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-sm">SwimSignal</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Bell */}
          <Link
            href="/dashboard/notifications"
            className="relative p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-[120ms] active:scale-[0.88] active:opacity-70"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 end-1 w-3.5 h-3.5 rounded-full bg-signal-400 text-navy-950 text-[9px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile pill */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 ps-1 pe-2.5 py-1 rounded-2xl transition-all duration-[120ms] active:scale-[0.94] active:opacity-80"
            style={{
              background: "rgba(241,245,249,0.80)",
              border: "1px solid rgba(203,213,225,0.50)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Avatar size="sm" />
            {firstName && (
              <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>{firstName}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Account sheet ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="animate-backdrop-in fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div
            className="animate-sheet-enter fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-white"
            style={{ boxShadow: "0 -8px 40px rgba(15,23,42,0.14)" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-0">
              <div className="w-9 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Profile summary */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-4">
              <Avatar size="lg" />
              <div>
                <p className="text-base font-bold" style={{ color: "#0F172A" }}>
                  {profile?.full_name ?? "שחיין"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>SwimSignal</p>
              </div>
            </div>

            <div className="mx-4 h-px bg-gray-100" />

            {/* Menu */}
            <nav className="px-3 py-2">
              {MENU_ITEMS.map(({ href, label, icon: Icon, live }) =>
                live ? (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-[120ms] hover:bg-gray-50 active:bg-gray-100 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#F1F5F9" }}>
                        <Icon className="h-4 w-4" style={{ color: "#475569" }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "#0F172A" }}>{label}</span>
                    </div>
                    <ChevronLeft className="h-4 w-4" style={{ color: "#CBD5E1" }} />
                  </Link>
                ) : (
                  <div
                    key={href}
                    className="flex items-center justify-between px-3 py-3 rounded-xl opacity-45"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#F8FAFC" }}>
                        <Icon className="h-4 w-4" style={{ color: "#94A3B8" }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "#64748B" }}>{label}</span>
                    </div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: "#F1F5F9", color: "#94A3B8" }}>בקרוב</span>
                  </div>
                )
              )}
            </nav>

            <div className="mx-4 h-px bg-gray-100" />

            {/* Logout */}
            <div className="px-3 py-2 pb-10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-[120ms] hover:bg-red-50 active:bg-red-100 active:scale-[0.99]"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FEF2F2" }}>
                  <LogOut className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-sm font-medium text-red-500">התנתק</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
