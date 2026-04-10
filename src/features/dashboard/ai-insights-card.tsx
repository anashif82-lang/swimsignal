import Link from "next/link";
import { Trophy, ArrowLeft, Sparkles } from "lucide-react";
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
  // Generate rule-based insights
  const insights: { icon: string; text: string }[] = [];

  if (pbs.length > 0) {
    const topPb = pbs[0];
    const eventLabel = topPb.event_name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    insights.push({ icon: "🏆", text: `שיא אישי ב-${eventLabel} — ${topPb.time_text}` });
  }

  if (stats) {
    if (stats.sessions_this_week >= 4) {
      insights.push({ icon: "🔥", text: `${stats.sessions_this_week} אימונים השבוע — שבוע מצוין!` });
    } else if (stats.sessions_this_month > 0) {
      insights.push({ icon: "📈", text: `${stats.sessions_this_month} אימונים החודש — המשך כך` });
    }
    if (stats.total_distance_km > 0) {
      insights.push({ icon: "🌊", text: `${stats.total_distance_km}ק"מ סה"כ — מרחק מרשים` });
    }
  }

  if (insights.length === 0) {
    insights.push({ icon: "💡", text: "תעד אימונים כדי לקבל תובנות אישיות" });
    insights.push({ icon: "🎯", text: "הגדר יעדים בפרופיל לניתוח מעמיק יותר" });
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 border border-white/[0.07]">
      {/* Background swimmer silhouette (decorative) */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg viewBox="0 0 400 200" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="200" cy="120" rx="180" ry="60" fill="currentColor" className="text-signal-400" />
          <circle cx="320" cy="70" r="25" fill="currentColor" className="text-signal-400" />
          <path d="M100 110 Q200 60 300 90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-signal-400" />
        </svg>
      </div>

      <div className="relative z-10 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-warning-400/15 flex items-center justify-center">
            <Trophy className="h-3.5 w-3.5 text-warning-400" />
          </div>
          <span className="text-sm font-bold text-white">ניתוח AI חכם</span>
          <Sparkles className="h-3.5 w-3.5 text-signal-400 ms-auto" />
        </div>

        {/* Insights */}
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-base leading-none mt-0.5">{ins.icon}</span>
              <p className="text-sm text-navy-200 leading-snug">{ins.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-1.5 text-xs text-signal-400 hover:text-signal-300 transition-colors font-medium pt-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          ראה ניתוח מלא
        </Link>
      </div>
    </div>
  );
}
