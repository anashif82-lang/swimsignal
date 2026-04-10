"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Trophy, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard",               label: "ראשי",     icon: LayoutDashboard, exact: true },
  { href: "/dashboard/training",      label: "אימונים",   icon: BookOpen                    },
  { href: "/dashboard/competitions",  label: "תחרויות",  icon: Trophy                      },
  { href: "/dashboard/analytics",     label: "אנליטיקה", icon: BarChart2                   },
  { href: "/dashboard/profile",       label: "פרופיל",   icon: User                        },
];

export function SwimmerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-navy-900/95 backdrop-blur-sm border-t border-surface-border safe-area-bottom">
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                isActive ? "text-signal-400" : "text-navy-500 hover:text-navy-300"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
