"use client";

interface ProgressRingProps {
  done:  number;
  total: number;
  size?: number;
}

export function ProgressRing({ done, total, size = 72 }: ProgressRingProps) {
  const sw  = 6;
  const r   = (size - sw) / 2;
  const cx  = size / 2;
  const cy  = size / 2;
  const circ = 2 * Math.PI * r;

  // 270° arc (gap at bottom)
  const arcFraction = 0.75;
  const trackDash   = circ * arcFraction;
  const progress    = Math.min(done / Math.max(total, 1), 1);
  const fillDash    = trackDash * progress;
  const gapDash     = circ - fillDash;

  // Rotate so arc starts at ~8 o'clock (-225°)
  const rotate = -225;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: `rotate(${rotate}deg)` }}>
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${trackDash} ${circ - trackDash}`} />
        {/* Fill */}
        {progress > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke="url(#ring-grad)" strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${fillDash} ${gapDash}`} />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-bold text-white leading-none">{done}/{total}</span>
      </div>
    </div>
  );
}
