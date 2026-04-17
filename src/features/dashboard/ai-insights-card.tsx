import Link from "next/link";
import { ArrowLeft, Sparkles, Award, Zap, TrendingUp, Waves, Lightbulb, Target, type LucideIcon } from "lucide-react";
import type { PersonalBest } from "@/types";

interface SwimmerStats {
  sessions_this_week:  number;
  sessions_this_month: number;
  total_distance_km:   number;
  pb_count:            number;
}

interface AIInsightsCardProps {
  stats: SwimmerStats | null;
  pbs:   PersonalBest[];
}

export function AIInsightsCard({ stats, pbs }: AIInsightsCardProps) {
  const insights: { Icon: LucideIcon; color: string; text: string }[] = [];

  if (pbs.length > 0) {
    const topPb = pbs[0];
    const eventLabel = topPb.event_name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    insights.push({ Icon: Award, color: "#FF9500", text: `שיא אישי ב-${eventLabel} — ${topPb.time_text}` });
  }

  if (stats) {
    if (stats.sessions_this_week >= 4) {
      insights.push({ Icon: Zap, color: "#FF9500", text: `${stats.sessions_this_week} אימונים השבוע — שבוע מצוין!` });
    } else if (stats.sessions_this_month > 0) {
      insights.push({ Icon: TrendingUp, color: "#34C759", text: `${stats.sessions_this_month} אימונים החודש — המשך כך` });
    }
    if (stats.total_distance_km > 0) {
      insights.push({ Icon: Waves, color: "#007AFF", text: `${stats.total_distance_km}ק"מ סה"כ — מרחק מרשים` });
    }
  }

  if (insights.length === 0) {
    insights.push({ Icon: Lightbulb, color: "#FF9500", text: "תעד אימונים כדי לקבל תובנות אישיות" });
    insights.push({ Icon: Target, color: "#5856D6", text: "הגדר יעדים בפרופיל לניתוח מעמיק יותר" });
  }

  return (
    <div className="mat-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center mat-cell">
          <Sparkles className="h-3.5 w-3.5" style={{ color: "#2E7BBF" }} />
        </div>
        <span className="text-sm font-bold" style={{ color: "#0F172A" }}>ניתוח AI חכם</span>
      </div>

      {/* Insights */}
      <div className="space-y-2.5">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <ins.Icon className="h-4 w-4 shrink-0 mt-0.5" style={{ color: ins.color }} />
            <p className="text-sm leading-snug" style={{ color: "#1E293B" }}>{ins.text}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/dashboard/analytics"
        className="flex items-center gap-1.5 text-xs font-semibold pt-1 transition-all duration-[120ms] active:opacity-60"
        style={{ color: "#2E7BBF" }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        ראה ניתוח מלא
      </Link>
    </div>
  );
}
