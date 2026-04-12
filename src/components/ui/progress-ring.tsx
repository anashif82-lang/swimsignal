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

  const arcFraction = 0.75;
  const trackDash   = circ * arcFraction;
  const progress    = Math.min(done / Math.max(total, 1), 1);
  const fillDash    = trackDash * progress;
  const gapDash     = circ - fillDash;
  const rotate      = -225;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: `rotate(${rotate}deg)` }}>
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#6499DF" />
            <stop offset="100%" stopColor="#83C8F0" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="#E8ECF0" strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${trackDash} ${circ - trackDash}`} />
        {/* Fill */}
        {progress > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke="url(#ring-grad)" strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${fillDash} ${gapDash}`} />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-bold leading-none" style={{ color: "#0B1A2B" }}>{done}/{total}</span>
      </div>
    </div>
  );
}
