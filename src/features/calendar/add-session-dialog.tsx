"use client";

import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimeWheelPicker } from "@/components/ui/time-wheel-picker";
import { cn } from "@/lib/utils";

const TYPES = [
  { value: "water",   label: "מים"      },
  { value: "dryland", label: "יבשה"     },
  { value: "gym",     label: "חדר כושר" },
  { value: "other",   label: "אחר"      },
] as const;

interface AddSessionDialogProps {
  initialDate: string;  // "YYYY-MM-DD"
  initialHour: number;  // 5-23
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-navy-900 border border-surface-border rounded-2xl shadow-xl p-5 space-y-4 animate-fade-in max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">הוסף אימון ליומן</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <Input
            label="כותרת"
            placeholder="לדוגמה: אימון בריכה"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          {/* Type */}
          <div>
            <label className="text-sm font-medium text-navy-100 mb-2 block">סוג אימון</label>
            <div className="grid grid-cols-4 gap-1.5">
              {TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={cn(
                    "py-2 rounded-lg text-xs font-medium border transition-all",
                    type === value
                      ? "border-signal-400 bg-signal-400/10 text-signal-400"
                      : "border-surface-border bg-navy-950/60 text-navy-400 hover:border-navy-500"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-navy-100 mb-1.5 block">תאריך</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-navy-950 border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-signal-400 transition-colors"
            />
          </div>

          {/* Time pickers */}
          <div className="grid grid-cols-2 gap-4">
            <TimeWheelPicker
              label="שעת התחלה"
              hour={startH}
              minute={startM}
              onChangeHour={setStartH}
              onChangeMinute={setStartM}
            />
            <TimeWheelPicker
              label="שעת סיום"
              hour={endH}
              minute={endM}
              onChangeHour={setEndH}
              onChangeMinute={setEndM}
            />
          </div>

          {/* Duration preview */}
          {(() => {
            const totalMins = (endH * 60 + endM) - (startH * 60 + startM);
            if (totalMins <= 0) return null;
            const h = Math.floor(totalMins / 60);
            const m = totalMins % 60;
            return (
              <p className="text-xs text-navy-400 text-center">
                משך:{" "}
                <span className="text-signal-400 font-medium">
                  {h > 0 ? `${h} שעות` : ""}{h > 0 && m > 0 ? " ו-" : ""}{m > 0 ? `${m} דקות` : ""}
                </span>
              </p>
            );
          })()}

          {/* Recurring */}
          <button
            type="button"
            onClick={() => setRecurring((r) => !r)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all",
              recurring
                ? "border-signal-400/50 bg-signal-400/10 text-signal-300"
                : "border-surface-border bg-navy-950/40 text-navy-400 hover:border-navy-500"
            )}
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            <div className="text-start">
              <p className="font-medium">{recurring ? "אימון חוזר כל שבוע ✓" : "הפוך לאימון חוזר"}</p>
              {recurring && <p className="text-xs opacity-70 mt-0.5">יווצרו 12 שבועות קדימה</p>}
            </div>
          </button>

          {error && (
            <p className="text-sm text-danger-400 bg-danger-500/10 border border-danger-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" variant="signal" className="flex-1" loading={loading}>
              שמור
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
