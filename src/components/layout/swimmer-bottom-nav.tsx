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
        className="absolute left-1/2 -translate-x-1/2 -top-5 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-[140ms] active:scale-[0.94] active:opacity-70 active:shadow-none"
        style={{
          background: "linear-gradient(150deg, rgba(236,247,255,0.97) 0%, rgba(200,228,252,0.93) 100%)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1.5px solid rgba(255,255,255,0.78)",
          boxShadow: [
            "inset 0 1px 0 rgba(255,255,255,0.85)",   /* top glass highlight */
            "0 1px 3px rgba(15,23,42,0.07)",           /* tight base */
            "0 6px 20px rgba(74,146,198,0.18)",        /* soft blue glow */
            "0 0 0 1px rgba(147,197,253,0.18)",        /* hairline ring */
          ].join(", "),
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Plus className="h-6 w-6 stroke-[2.5]" style={{ color: "#2E7BBF" }} />
      </Link>
    </nav>
  );
}
