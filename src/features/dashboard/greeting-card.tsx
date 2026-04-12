import { ProgressRing } from "@/components/ui/progress-ring";
import type { PersonalBest } from "@/types";

interface GreetingCardProps {
  firstName:    string;
  greeting:     string;
  streak:       number;
  lastPb:       PersonalBest | null;
  weeklyDone:   number;
  weeklyGoal?:  number;
}

export function GreetingCard({
  firstName,
  greeting,
  streak,
  lastPb,
  weeklyDone,
  weeklyGoal = 6,
}: GreetingCardProps) {
  const eventLabel = lastPb
    ? lastPb.event_name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <div className="mat-card p-5 space-y-4">
      {/* Greeting */}
      <div className="text-center">
        <h1 className="text-xl font-bold" style={{ color: "#0F172A" }}>{greeting}, {firstName}! 👋</h1>
        <p className="text-sm mt-0.5" style={{ color: "#667085" }}>מוכן לשבור עוד שיא היום?</p>
      </div>

      {/* Stats row — three mat-cell tiles */}
      <div className="grid grid-cols-3 gap-2">
        {/* Streak */}
        <div className="mat-cell flex flex-col items-center justify-center gap-0.5 py-3 px-1">
          <span className="text-2xl leading-none">🔥</span>
          <span className="text-2xl font-bold leading-tight" style={{ color: "#0F172A" }}>{streak}</span>
          <span className="text-[10px]" style={{ color: "#667085" }}>ימי רצף</span>
        </div>

        {/* Last achievement */}
        <div className="mat-cell flex flex-col items-center justify-center gap-0.5 py-3 px-2 text-center">
          <p className="text-[9px] uppercase tracking-wide" style={{ color: "#667085" }}>הישג אחרון</p>
          {lastPb ? (
            <>
              <span className="text-base leading-none">🏆</span>
              <p className="text-[10px] leading-tight" style={{ color: "#0F172A" }}>{eventLabel}</p>
              <p className="text-sm font-bold" style={{ color: "#2E7BBF" }}>{lastPb.time_text}</p>
            </>
          ) : (
            <p className="text-xs mt-1" style={{ color: "#667085" }}>אין עדיין</p>
          )}
        </div>

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
