"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BarChart2, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard",           label: "ראשי",     icon: LayoutDashboard, exact: true },
  { href: "/dashboard/training",  label: "אימונים",   icon: BookOpen                    },
  { href: "/dashboard/training/new", label: "תעד אימון", icon: Plus, isAction: true     },
  { href: "/dashboard/analytics", label: "אנליטיקה", icon: BarChart2                   },
  { href: "/dashboard/profile",   label: "פרופיל",   icon: User                        },
];

export function SwimmerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-navy-900/85 backdrop-blur-xl border-t border-white/[0.07] safe-area-bottom">
      <div className="flex items-center h-[60px] px-1">
        {tabs.map(({ href, label, icon: Icon, exact, isAction }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          if (isAction) {
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center gap-1"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <div className="w-11 h-11 rounded-2xl bg-signal-400 flex items-center justify-center shadow-[0_2px_12px_rgba(34,211,238,0.3)] active:scale-95 transition-transform">
                  <Icon className="h-5 w-5 text-navy-950 stroke-[2.5]" />
                </div>
                <span className="text-[9px] font-medium text-signal-400">{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-signal-400" : "text-navy-500"
              )}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <Icon className="h-[22px] w-[22px]" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
