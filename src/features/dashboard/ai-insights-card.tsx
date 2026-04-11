import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
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
    <div
      className="rounded-2xl p-4 space-y-3 transition-all duration-[200ms] ease-out hover:-translate-y-0.5 active:-translate-y-0.5"
      style={{
        background: "linear-gradient(135deg, #EAF3FF 0%, #F8FBFF 100%)",
        border: "1px solid #D6E8FF",
        boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#DBEAFE" }}>
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
        </div>
        <span className="text-sm font-bold" style={{ color: "#0B1A2B" }}>ניתוח AI חכם</span>
      </div>

      {/* Insights */}
      <div className="space-y-2">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-base leading-none mt-0.5">{ins.icon}</span>
            <p className="text-sm leading-snug" style={{ color: "#0F172A" }}>{ins.text}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/dashboard/analytics"
        className="flex items-center gap-1.5 text-xs font-medium pt-1 text-blue-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        ראה ניתוח מלא
      </Link>
    </div>
  );
}
