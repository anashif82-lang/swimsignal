import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: "signal" | "success" | "warning" | "default";
  className?: string;
}

export function StatsCard({
  label, value, sub, icon: Icon, trend, accent = "default", className,
}: StatsCardProps) {
  const accentClasses = {
    signal:  "text-signal-400 bg-signal-400/10 border-signal-400/20",
    success: "text-success-400 bg-success-500/10 border-success-500/20",
    warning: "text-warning-400 bg-warning-500/10 border-warning-500/20",
    default: "text-navy-300 bg-navy-800 border-surface-border",
  };

  return (
    <div className={cn("card-surface p-5 flex items-start gap-4", className)}>
      <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center shrink-0", accentClasses[accent])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-navy-400 font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        {sub && <p className="text-xs text-navy-400 mt-1">{sub}</p>}
        {trend && (
          <p className={cn(
            "text-xs mt-1.5 font-medium",
            trend.value >= 0 ? "text-success-400" : "text-danger-400"
          )}>
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
