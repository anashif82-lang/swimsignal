"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Group, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/coach",           label: "סקירה",    icon: LayoutDashboard, exact: true },
  { href: "/coach/swimmers",  label: "שחיינים",  icon: Users                       },
  { href: "/coach/groups",    label: "קבוצות",   icon: Group                       },
  { href: "/coach/analytics", label: "אנליטיקה", icon: BarChart2                   },
  { href: "/coach/profile",   label: "פרופיל",   icon: User                        },
];

export function CoachBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-navy-900/95 backdrop-blur-sm border-t border-surface-border">
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
