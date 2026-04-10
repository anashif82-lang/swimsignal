"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BarChart2, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard",            label: "ראשי",     icon: LayoutDashboard, exact: true },
  { href: "/dashboard/training",   label: "אימונים",   icon: BookOpen                    },
  null, // center placeholder
  { href: "/dashboard/analytics",  label: "אנליטיקה", icon: BarChart2                   },
  { href: "/dashboard/profile",    label: "פרופיל",   icon: User                        },
];

export function SwimmerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 safe-area-bottom">
      {/* Frosted glass bar */}
      <div className="bg-navy-900/80 backdrop-blur-xl border-t border-white/[0.06]">
        <div className="flex items-end h-[56px]">
          {tabs.map((tab, i) => {
            if (!tab) {
              // Center FAB placeholder — actual button sits above
              return <div key="center" className="flex-1" />;
            }
            const { href, label, icon: Icon, exact } = tab;
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-[3px] h-full text-[10px] font-medium transition-colors",
                  isActive ? "text-signal-400" : "text-navy-500"
                )}
              >
                <Icon className={cn("h-[22px] w-[22px]", isActive && "drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]")} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Center FAB — floats above bar */}
      <Link
        href="/dashboard/training/new"
        className="absolute left-1/2 -translate-x-1/2 -top-[22px] w-[52px] h-[52px] rounded-full bg-signal-400 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.35)] active:scale-95 transition-transform"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <Plus className="h-6 w-6 text-navy-950 stroke-[2.5]" />
      </Link>
    </nav>
  );
}
