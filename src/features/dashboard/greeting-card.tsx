import Link from "next/link";
import { Zap, Award, ChevronLeft } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { SWIM_EVENTS, type PersonalBest } from "@/types";

interface GreetingCardProps {
  firstName:    string;
  greeting:     string;
  streak:       number;
  recentPbs:    PersonalBest[];
  weeklyDone:   number;
  weeklyGoal?:  number;
}

function eventLabelHe(eventName: string): string {
  return SWIM_EVENTS.find((e) => e.key === eventName)?.labelHe ?? eventName;
}

export function GreetingCard({
  firstName,
  greeting,
  streak,
  recentPbs,
  weeklyDone,
  weeklyGoal = 6,
}: GreetingCardProps) {
  const topThree = recentPbs.slice(0, 3);

  return (
    <div className="mat-card p-5 space-y-4">
      {/* Greeting */}
      <div className="text-center">
        <h1 className="text-xl font-bold" style={{ color: "#0F172A" }}>{greeting}, {firstName}!</h1>
        <p className="text-sm mt-0.5" style={{ color: "#667085" }}>מוכן לשבור עוד שיא היום?</p>
      </div>

      {/* Stats row — three mat-cell tiles */}
      <div className="grid grid-cols-3 gap-2">
        {/* Streak */}
        <div className="mat-cell flex flex-col items-center justify-center gap-0.5 py-3 px-1">
          <Zap className="h-5 w-5" style={{ color: "#FF9500" }} />
          <span className="text-2xl font-bold leading-tight" style={{ color: "#0F172A" }}>{streak}</span>
          <span className="text-[10px]" style={{ color: "#667085" }}>ימי רצף</span>
        </div>

        {/* Recent PBs (clickable to full PBs page) */}
        <Link
          href="/dashboard/training/personal-bests"
          className="mat-cell flex flex-col py-2.5 px-2 transition-all duration-[120ms] active:scale-[0.97] active:opacity-80"
        >
          <div className="flex items-center justify-between mb-1">
            <Award className="h-3.5 w-3.5" style={{ color: "#FF9500" }} />
            <ChevronLeft className="h-3 w-3" style={{ color: "#94A3B8" }} />
          </div>
          <p className="text-[9px] uppercase tracking-wide mb-1" style={{ color: "#667085" }}>שיאים אחרונים</p>

          {topThree.length > 0 ? (
            <div className="space-y-1 flex-1">
              {topThree.map((pb) => (
                <div key={pb.id} className="flex items-baseline justify-between gap-1 leading-tight">
                  <span className="text-[9px] truncate" style={{ color: "#667085" }}>
                    {eventLabelHe(pb.event_name)}
                  </span>
                  <span className="text-[10px] font-bold tabular-nums" style={{ color: "#007AFF" }}>
                    {pb.time_text}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>אין עדיין — סנכרן באיגוד השחייה</p>
          )}
        </Link>

        {/* Weekly ring */}
        <div className="mat-cell flex flex-col items-center justify-center gap-0.5 py-3 px-1">
          <p className="text-[9px] uppercase tracking-wide" style={{ color: "#667085" }}>מטרה שבועית</p>
          <ProgressRing done={weeklyDone} total={weeklyGoal} size={64} />
          <p className="text-[10px]" style={{ color: "#667085" }}>אימונים</p>
        </div>
      </div>
    </div>
  );
}
