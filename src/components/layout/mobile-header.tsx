"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, User, Settings, Globe, HelpCircle, LogOut, ChevronLeft, Camera } from "lucide-react";
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

// ── Ripple hook ──────────────────────────────────────────────────────────────
function useRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const trigger = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
  }, []);

  const nodes = ripples.map((r) => (
    <span
      key={r.id}
      aria-hidden
      className="animate-water-ripple absolute rounded-full pointer-events-none"
      style={{
        left:       r.x - 20,
        top:        r.y - 20,
        width:      40,
        height:     40,
        background: "rgba(74,146,198,0.18)",
      }}
    />
  ));

  return { trigger, nodes };
}

// Menu items — mark future routes so they don't hard-404
const MENU_ITEMS = [
  { href: "/dashboard/profile",       label: "פרופיל",  icon: User,        live: true  },
  { href: "/dashboard/settings",      label: "הגדרות",  icon: Settings,    live: false },
  { href: "/dashboard/language",      label: "שפה",     icon: Globe,        live: false },
  { href: "/dashboard/help",          label: "עזרה",    icon: HelpCircle,  live: false },
] as const;

export function MobileHeader({ unreadCount = 0, profile }: MobileHeaderProps) {
  const [open,      setOpen]      = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router  = useRouter();
  const ripple  = useRipple();

  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const initials  = getInitials(profile?.full_name);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("לא מחובר");

      const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

      const res = await fetch("/api/profile/avatar", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url: publicUrl }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "שגיאה" }));
        throw new Error(error);
      }

      setAvatarUrl(publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "שגיאה בהעלאת התמונה";
      alert(`שגיאה: ${msg}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const Avatar = ({ size, editable }: { size: "sm" | "lg"; editable?: boolean }) => {
    const cls = size === "sm"
      ? "w-10 h-10 text-sm font-bold"
      : "w-12 h-12 text-base font-bold";
    return (
      <div
        className={`${cls} rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white relative`}
        style={{ background: "linear-gradient(135deg, #5AAAD8, #4492C6)" }}
      >
        {avatarUrl
          ? <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" />
          : initials}
        {editable && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
            style={{ opacity: uploading ? 1 : undefined }}
          >
            {uploading
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Camera className="w-4 h-4 text-white opacity-80" />}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

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
          <span
            className="text-sm tracking-tight"
            style={{
              fontWeight: 600,
              letterSpacing: "-0.01em",
              background: "linear-gradient(90deg, #007AFF 0%, #5856D6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >SwimSignal</span>
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
            className="flex items-center gap-2.5 ps-1.5 pe-3.5 py-1.5 rounded-2xl transition-all duration-[120ms] active:scale-[0.93] active:opacity-75"
            style={{
              background: "rgba(255,255,255,0.88)",
              border: "1px solid rgba(203,213,225,0.60)",
              boxShadow: "0 1px 4px rgba(15,23,42,0.07), 0 0 0 0.5px rgba(203,213,225,0.35)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Avatar size="sm" />
            {firstName && (
              <span className="text-[15px] font-semibold tracking-tight" style={{ color: "#0F172A" }}>{firstName}</span>
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
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="shrink-0 rounded-full active:scale-[0.93] active:opacity-80 transition-all duration-[120ms]"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <Avatar size="lg" editable />
              </button>
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
                  <div key={href} className="relative overflow-hidden rounded-xl" onPointerDown={ripple.trigger}>
                    {ripple.nodes}
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-3 transition-all duration-[120ms] hover:bg-gray-50 active:bg-gray-100 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#F1F5F9" }}>
                          <Icon className="h-4 w-4" style={{ color: "#475569" }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: "#0F172A" }}>{label}</span>
                      </div>
                      <ChevronLeft className="h-4 w-4" style={{ color: "#CBD5E1" }} />
                    </Link>
                  </div>
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
              <div className="relative overflow-hidden rounded-xl" onPointerDown={ripple.trigger}>
                {ripple.nodes}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 transition-all duration-[120ms] hover:bg-red-50 active:bg-red-100 active:scale-[0.99]"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FEF2F2" }}>
                    <LogOut className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-red-500">התנתק</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
