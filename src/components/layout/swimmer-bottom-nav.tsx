"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BarChart2, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const LEFT_TABS = [
  { href: "/dashboard",           label: "ראשי",     icon: LayoutDashboard, exact: true },
  { href: "/dashboard/training",  label: "אימונים",   icon: BookOpen                    },
];
const RIGHT_TABS = [
  { href: "/dashboard/analytics", label: "אנליטיקה", icon: BarChart2 },
  { href: "/dashboard/profile",   label: "פרופיל",   icon: User      },
];

export function SwimmerBottomNav() {
  const pathname = usePathname();

  const tabClass = (active: boolean) =>
    cn(
      "flex-1 flex flex-col items-center justify-center gap-[3px] h-full transition-all duration-[120ms] active:scale-[0.88] active:opacity-70",
      active ? "text-blue-500" : "text-gray-400"
    );

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40">
      {/* Frosted glass bar */}
      <div className="relative bg-white/80 backdrop-blur-2xl border-t border-white/60" style={{ boxShadow: "0 -1px 0 rgba(203,213,225,0.5), 0 -8px 24px rgba(15,23,42,0.06)" }}>
        <div className="flex items-center h-[58px] px-2">

          {/* Left tabs */}
          {LEFT_TABS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={tabClass(active)}
                style={{ WebkitTapHighlightColor: "transparent" }}>
                <Icon className="h-[22px] w-[22px]" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}

          {/* Center spacer for FAB */}
          <div className="w-16 shrink-0" />

          {/* Right tabs */}
          {RIGHT_TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={tabClass(active)}
                style={{ WebkitTapHighlightColor: "transparent" }}>
                <Icon className="h-[22px] w-[22px]" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* FAB — floats above bar */}
      <Link
        href="/dashboard/training/new"
        className="absolute left-1/2 -translate-x-1/2 -top-5 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-[140ms] active:scale-[0.94] active:opacity-80"
        style={{
          background: "linear-gradient(145deg, #6FD3FF 0%, #4DA3FF 35%, #7B61FF 70%, #B57BFF 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1.5px solid rgba(255,255,255,0.35)",
          boxShadow: [
            "inset 0 1px 0 rgba(255,255,255,0.30)",
            "0 2px 6px  rgba(15,23,42,0.10)",
            "0 6px 20px rgba(107,97,255,0.22)",
            "0 0 0 1px  rgba(255,255,255,0.08)",
          ].join(", "),
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Plus className="h-6 w-6 stroke-[2.5] text-white" />
      </Link>
    </nav>
  );
}
