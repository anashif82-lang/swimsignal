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
    <div className="rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 border border-white/[0.07] p-4 space-y-4">
      {/* Greeting */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-white">{greeting}, {firstName}! 👋</h1>
        <p className="text-sm text-navy-400 mt-0.5">מוכן לשבור עוד שיא היום?</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 rounded-xl bg-navy-950/60 border border-white/[0.05] divide-x divide-white/[0.05] overflow-hidden">

        {/* Streak */}
        <div className="flex flex-col items-center justify-center gap-0.5 py-3 px-1">
          <span className="text-2xl leading-none">🔥</span>
          <span className="text-2xl font-bold text-white leading-tight">{streak}</span>
          <span className="text-[10px] text-navy-400">ימי רצף</span>
        </div>

        {/* Last achievement */}
        <div className="flex flex-col items-center justify-center gap-0.5 py-3 px-2 text-center">
          <p className="text-[9px] text-navy-500 uppercase tracking-wide">הישג אחרון</p>
          {lastPb ? (
            <>
              <span className="text-base leading-none">🏆</span>
              <p className="text-[10px] text-navy-300 leading-tight">{eventLabel}</p>
              <p className="text-sm font-bold text-signal-400">{lastPb.time_text}</p>
            </>
          ) : (
            <p className="text-xs text-navy-600 mt-1">אין עדיין</p>
          )}
        </div>

        {/* Weekly ring */}
        <div className="flex flex-col items-center justify-center gap-0.5 py-3 px-1">
          <p className="text-[9px] text-navy-500 uppercase tracking-wide">מטרה שבועית</p>
          <ProgressRing done={weeklyDone} total={weeklyGoal} size={64} />
          <p className="text-[10px] text-navy-400">אימונים</p>
        </div>
      </div>
    </div>
  );
}
