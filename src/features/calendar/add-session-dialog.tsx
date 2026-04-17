"use client";

import { useState } from "react";
import { X, RotateCcw, Waves, Activity, Dumbbell, MoreHorizontal, type LucideIcon } from "lucide-react";
import { TimeWheelPicker } from "@/components/ui/time-wheel-picker";
import { cn } from "@/lib/utils";

const TYPES: { value: "water" | "dryland" | "gym" | "other"; label: string; Icon: LucideIcon }[] = [
  { value: "water",   label: "מים",   Icon: Waves          },
  { value: "dryland", label: "יבשה",  Icon: Activity       },
  { value: "gym",     label: "כושר",  Icon: Dumbbell       },
  { value: "other",   label: "אחר",   Icon: MoreHorizontal },
];

interface AddSessionDialogProps {
  initialDate: string;
  initialHour: number;
  onClose: () => void;
  onSaved: () => void;
}

export function AddSessionDialog({ initialDate, initialHour, onClose, onSaved }: AddSessionDialogProps) {
  const [title,     setTitle]     = useState("");
  const [type,      setType]      = useState<"water" | "dryland" | "gym" | "other">("water");
  const [date,      setDate]      = useState(initialDate);
  const [startH,    setStartH]    = useState(Math.max(5, Math.min(23, initialHour)));
  const [startM,    setStartM]    = useState(0);
  const [endH,      setEndH]      = useState(Math.max(5, Math.min(23, initialHour + 2)));
  const [endM,      setEndM]      = useState(0);
  const [recurring, setRecurring] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("נא להזין כותרת"); return; }

    const pad = (n: number) => String(n).padStart(2, "0");
    const startISO = `${date}T${pad(startH)}:${pad(startM)}:00+03:00`;
    const endISO   = `${date}T${pad(endH)}:${pad(endM)}:00+03:00`;
    if (endISO <= startISO) { setError("שעת הסיום חייבת להיות אחרי שעת ההתחלה"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/schedule", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title:         title.trim(),
          training_type: type,
          start_time:    startISO,
          end_time:      endISO,
          is_recurring:  recurring,
          weeks_ahead:   12,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "שגיאה בשמירה");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  }

  const totalMins = (endH * 60 + endM) - (startH * 60 + startM);
  const durationLabel = totalMins > 0
    ? (() => {
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        return [h > 0 ? `${h} שע׳` : "", m > 0 ? `${m} דק׳` : ""].filter(Boolean).join(" ");
      })()
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="animate-backdrop-in fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="animate-sheet-enter fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-white max-h-[92dvh] flex flex-col"
        style={{ boxShadow: "0 -8px 40px rgba(15,23,42,0.14)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <h2 className="text-base font-semibold" style={{ color: "#0F172A" }}>הוסף אימון</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-[120ms] active:scale-[0.88] active:opacity-70"
            style={{ background: "#F1F5F9" }}
          >
            <X className="h-3.5 w-3.5" style={{ color: "#64748B" }} />
          </button>
        </div>

        <div className="mx-4 h-px bg-gray-100" />

        {/* Scrollable content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Title input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: "#94A3B8" }}>
              כותרת
            </label>
            <input
              type="text"
              placeholder="לדוגמה: אימון בריכה"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-[120ms]"
              style={{
                background: "#F6F9FC",
                border: "1px solid rgba(226,232,240,0.80)",
                color: "#0F172A",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,122,255,0.10)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(226,232,240,0.80)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Type selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: "#94A3B8" }}>
              סוג אימון
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-[120ms] active:scale-[0.94]",
                    type === value
                      ? "text-white"
                      : ""
                  )}
                  style={type === value ? {
                    background: "#007AFF",
                    boxShadow: "0 2px 8px rgba(0,122,255,0.30)",
                  } : {
                    background: "#F6F9FC",
                    border: "1px solid rgba(226,232,240,0.80)",
                    color: "#64748B",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: "#94A3B8" }}>
              תאריך
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-[120ms]"
              style={{
                background: "#F6F9FC",
                border: "1px solid rgba(226,232,240,0.80)",
                color: "#0F172A",
              }}
            />
          </div>

          {/* Time pickers */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: "#94A3B8" }}>
              שעות
            </label>
            <div className="grid grid-cols-2 gap-3">
              <TimeWheelPicker
                label="התחלה"
                hour={startH}
                minute={startM}
                onChangeHour={setStartH}
                onChangeMinute={setStartM}
              />
              <TimeWheelPicker
                label="סיום"
                hour={endH}
                minute={endM}
                onChangeHour={setEndH}
                onChangeMinute={setEndM}
              />
            </div>

            {durationLabel && (
              <p className="text-center text-xs mt-2 font-medium" style={{ color: "#007AFF" }}>
                משך: {durationLabel}
              </p>
            )}
          </div>

          {/* Recurring */}
          <button
            type="button"
            onClick={() => setRecurring((r) => !r)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-[120ms] active:scale-[0.98] active:opacity-80"
            style={recurring ? {
              background: "rgba(0,122,255,0.08)",
              border: "1px solid rgba(0,122,255,0.25)",
            } : {
              background: "#F6F9FC",
              border: "1px solid rgba(226,232,240,0.80)",
            }}
          >
            <RotateCcw className="h-4 w-4 shrink-0" style={{ color: recurring ? "#007AFF" : "#94A3B8" }} />
            <div className="text-start flex-1">
              <p className="text-sm font-medium" style={{ color: recurring ? "#007AFF" : "#0F172A" }}>
                {recurring ? "אימון חוזר כל שבוע" : "הפוך לאימון חוזר"}
              </p>
              {recurring && (
                <p className="text-xs mt-0.5" style={{ color: "#5856D6" }}>יווצרו 12 שבועות קדימה</p>
              )}
            </div>
          </button>

          {/* Error */}
          {error && (
            <p className="text-sm rounded-xl px-4 py-2.5" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid rgba(239,68,68,0.20)" }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-[120ms] active:scale-[0.97] active:opacity-70"
              style={{ background: "#F1F5F9", color: "#64748B" }}
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-[120ms] active:scale-[0.97] active:opacity-80 disabled:opacity-60"
              style={{ background: "#007AFF", boxShadow: "0 2px 12px rgba(0,122,255,0.30)" }}
            >
              {loading ? "שומר…" : "שמור"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
