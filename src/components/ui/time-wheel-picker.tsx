"use client";

import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 44;
const VISIBLE    = 5; // visible rows (selected = middle)

const HOURS   = Array.from({ length: 19 }, (_, i) => i + 5);          // 05..23
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);          // 0,5,10..55

// ── Single scrollable column ──────────────────────────────────────────────────
interface WheelColumnProps {
  items:    number[];
  selected: number;
  onChange: (v: number) => void;
}

function WheelColumn({ items, selected, onChange }: WheelColumnProps) {
  const ref       = useRef<HTMLDivElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fromScroll = useRef(false); // prevent scroll→state→scroll loop

  // Initial scroll (instant)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = items.indexOf(selected);
    if (idx >= 0) el.scrollTop = idx * ITEM_HEIGHT;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll when value changes externally (not from user scroll)
  useEffect(() => {
    if (fromScroll.current) { fromScroll.current = false; return; }
    const el = ref.current;
    if (!el) return;
    const idx = items.indexOf(selected);
    if (idx >= 0) el.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
  }, [selected, items]);

  const handleScroll = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx     = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      // Snap to exact position
      el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
      if (items[clamped] !== selected) {
        fromScroll.current = true;
        onChange(items[clamped]);
      }
    }, 120);
  }, [items, selected, onChange]);

  return (
    <div className="relative" style={{ height: ITEM_HEIGHT * VISIBLE, width: 64 }}>
      {/* Selection band */}
      <div
        className="absolute inset-x-0 z-10 pointer-events-none border-y border-signal-400/40 bg-signal-400/8 rounded-sm"
        style={{ top: ITEM_HEIGHT * 2, height: ITEM_HEIGHT }}
      />
      {/* Fade top */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none h-16 bg-gradient-to-b from-navy-900 to-transparent" />
      {/* Fade bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none h-16 bg-gradient-to-t from-navy-900 to-transparent" />

      {/* Scroll area */}
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll overscroll-contain"
        style={{ scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {/* Top padding so first item can be centered */}
        <div style={{ height: ITEM_HEIGHT * 2 }} />

        {items.map((v) => (
          <div
            key={v}
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" } as React.CSSProperties}
            className={cn(
              "flex items-center justify-center font-mono text-xl font-semibold select-none transition-colors duration-150",
              v === selected ? "text-white" : "text-navy-600"
            )}
          >
            {String(v).padStart(2, "0")}
          </div>
        ))}

        {/* Bottom padding so last item can be centered */}
        <div style={{ height: ITEM_HEIGHT * 2 }} />
      </div>
    </div>
  );
}

// ── TimeWheelPicker ───────────────────────────────────────────────────────────
interface TimeWheelPickerProps {
  hour:     number;
  minute:   number;
  onChangeHour:   (h: number) => void;
  onChangeMinute: (m: number) => void;
  label?:   string;
}

export function TimeWheelPicker({ hour, minute, onChangeHour, onChangeMinute, label }: TimeWheelPickerProps) {
  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-navy-100 mb-2">{label}</p>
      )}
      <div className="flex items-center justify-center gap-1 bg-navy-950 border border-surface-border rounded-xl overflow-hidden px-2">
        <WheelColumn items={HOURS}   selected={hour}   onChange={onChangeHour}   />
        <span className="text-2xl font-bold text-navy-400 mb-0.5 select-none">:</span>
        <WheelColumn items={MINUTES} selected={minute} onChange={onChangeMinute} />
      </div>
    </div>
  );
}
