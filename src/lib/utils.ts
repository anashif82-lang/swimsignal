import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PoolLength, StrokeType, SessionStatus, ConnectionStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format swim time from milliseconds to display string: "1:02.34" or "58.34" */
export function formatSwimTime(ms: number): string {
  const totalHundredths = Math.round(ms / 10);
  const hundredths = totalHundredths % 100;
  const totalSeconds = Math.floor(totalHundredths / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  const hh = String(hundredths).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (minutes > 0) {
    return `${minutes}:${ss}.${hh}`;
  }
  return `${seconds}.${hh}`;
}

/** Parse swim time string ("1:02.34" or "58.34") to milliseconds */
export function parseSwimTime(timeStr: string): number | null {
  const clean = timeStr.trim();
  const colonParts = clean.split(":");

  try {
    if (colonParts.length === 2) {
      const minutes = parseInt(colonParts[0], 10);
      const [secs, hundredths = "0"] = colonParts[1].split(".");
      return (
        minutes * 60 * 1000 +
        parseInt(secs, 10) * 1000 +
        parseInt(hundredths.padEnd(2, "0").slice(0, 2), 10) * 10
      );
    } else {
      const [secs, hundredths = "0"] = clean.split(".");
      return (
        parseInt(secs, 10) * 1000 +
        parseInt(hundredths.padEnd(2, "0").slice(0, 2), 10) * 10
      );
    }
  } catch {
    return null;
  }
}

/** Format meters to human-readable distance */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

/** Format minutes to "Xh Ym" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Format ISO date string to locale date */
export function formatDate(dateStr: string, locale = "he-IL"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

/** Format ISO date to short: "Apr 7" */
export function formatDateShort(dateStr: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(new Date(dateStr));
}

/** Get relative time: "2 days ago", "in 3 hours" */
export function formatRelativeTime(dateStr: string, locale = "en"): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const absDiff = Math.abs(diff);

  if (absDiff < 60_000)     return rtf.format(Math.round(diff / 1000), "second");
  if (absDiff < 3_600_000)  return rtf.format(Math.round(diff / 60_000), "minute");
  if (absDiff < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), "hour");
  if (absDiff < 604_800_000)return rtf.format(Math.round(diff / 86_400_000), "day");
  return rtf.format(Math.round(diff / 604_800_000), "week");
}

/** Today's date as ISO string (YYYY-MM-DD) */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Get current week Monday */
export function weekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Pool length badge text */
export function poolLabel(length: PoolLength): string {
  return length === "25m" ? "25m" : "50m";
}

/** Status → badge class */
export function sessionStatusBadge(status: SessionStatus): string {
  const map: Record<SessionStatus, string> = {
    completed:     "badge-success",
    not_completed: "badge-danger",
    partial:       "badge-warning",
  };
  return map[status];
}

export function connectionStatusBadge(status: ConnectionStatus): string {
  const map: Record<ConnectionStatus, string> = {
    pending:  "badge-warning",
    approved: "badge-success",
    rejected: "badge-danger",
    removed:  "badge-muted",
  };
  return map[status];
}

/** Stroke → short label */
export function strokeShort(stroke: StrokeType): string {
  const map: Record<StrokeType, string> = {
    freestyle:         "FR",
    backstroke:        "BK",
    breaststroke:      "BR",
    butterfly:         "FLY",
    individual_medley: "IM",
  };
  return map[stroke];
}

/** Generate a simple slug-safe ID (not crypto-random — use server UUIDs for DB) */
export function generateId(length = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Initials from full name */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

/** Calculate age from birth year */
export function ageFromBirthYear(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}
