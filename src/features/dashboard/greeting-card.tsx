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
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 2px 16px rgba(59,130,246,0.07), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Greeting */}
      <div className="text-center">
        <h1 className="text-xl font-bold" style={{ color: "#0B1A2B" }}>{greeting}, {firstName}! 👋</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7C93" }}>מוכן לשבור עוד שיא היום?</p>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 rounded-xl divide-x overflow-hidden"
        style={{ background: "#F5F7FA", borderColor: "#E8ECF0", border: "1px solid #E8ECF0" }}
      >
        {/* Streak */}
        <div className="flex flex-col items-center justify-center gap-0.5 py-3 px-1">
          <span className="text-2xl leading-none">🔥</span>
          <span className="text-2xl font-bold leading-tight" style={{ color: "#0B1A2B" }}>{streak}</span>
          <span className="text-[10px]" style={{ color: "#6B7C93" }}>ימי רצף</span>
        </div>

        {/* Last achievement */}
        <div className="flex flex-col items-center justify-center gap-0.5 py-3 px-2 text-center">
          <p className="text-[9px] uppercase tracking-wide" style={{ color: "#6B7C93" }}>הישג אחרון</p>
          {lastPb ? (
            <>
              <span className="text-base leading-none">🏆</span>
              <p className="text-[10px] leading-tight" style={{ color: "#0B1A2B" }}>{eventLabel}</p>
              <p className="text-sm font-bold text-blue-500">{lastPb.time_text}</p>
            </>
          ) : (
            <p className="text-xs mt-1" style={{ color: "#6B7C93" }}>אין עדיין</p>
          )}
        </div>

        {/* Weekly ring */}
        <div className="flex flex-col items-center justify-center gap-0.5 py-3 px-1">
          <p className="text-[9px] uppercase tracking-wide" style={{ color: "#6B7C93" }}>מטרה שבועית</p>
          <ProgressRing done={weeklyDone} total={weeklyGoal} size={64} />
          <p className="text-[10px]" style={{ color: "#6B7C93" }}>אימונים</p>
        </div>
      </div>
    </div>
  );
}
