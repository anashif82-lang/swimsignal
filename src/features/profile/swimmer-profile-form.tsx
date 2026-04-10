"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check } from "lucide-react";
import { updateSwimmerProfileSchema, type UpdateSwimmerProfileInput } from "@/lib/validations/profile";
import { SWIM_EVENTS, STROKE_LABELS, type StrokeType, type Profile, type SwimmerProfile } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STROKES: StrokeType[] = ["freestyle", "backstroke", "breaststroke", "butterfly", "individual_medley"];

const GENDER_OPTIONS = [
  { value: "male",              label: "זכר"           },
  { value: "female",            label: "נקבה"         },
  { value: "other",             label: "אחר"          },
  { value: "prefer_not_to_say", label: "מעדיף שלא לציין" },
] as const;

interface Props {
  profile:        Profile;
  swimmerProfile: SwimmerProfile | null;
}

export function SwimmerProfileForm({ profile, swimmerProfile }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateSwimmerProfileInput>({
    resolver: zodResolver(updateSwimmerProfileSchema),
    defaultValues: {
      full_name:   profile.full_name  ?? "",
      club_name:   swimmerProfile?.club_name_raw ?? "",
      birth_year:  swimmerProfile?.birth_year ?? undefined,
      gender:      swimmerProfile?.gender ?? undefined,
      strokes:     swimmerProfile?.strokes ?? [],
      main_events: swimmerProfile?.main_events ?? [],
      goals:       swimmerProfile?.goals ?? "",
    },
  });

  async function onSubmit(data: UpdateSwimmerProfileInput) {
    setServerError(null);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "Failed to save.");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg bg-danger-950 border border-danger-800 px-4 py-3 text-sm text-danger-300">
          {serverError}
        </div>
      )}

      {/* ── Basic info ──────────────────────────────────── */}
      <div className="card-surface rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">פרטים בסיסיים</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="שם מלא"
            {...register("full_name")}
            error={errors.full_name?.message}
          />
          <Input
            label="מועדון"
            placeholder="לדוגמה: הפועל תל אביב"
            {...register("club_name")}
            error={errors.club_name?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="שנת לידה"
            type="number"
            placeholder="לדוגמה: 2005"
            {...register("birth_year", { valueAsNumber: true })}
            error={errors.birth_year?.message}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy-200">מין</label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {GENDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        "py-2 rounded-lg text-sm border transition-colors text-center",
                        field.value === opt.value
                          ? "bg-signal-400/10 border-signal-400/60 text-signal-300"
                          : "bg-navy-900 border-surface-border text-navy-400 hover:text-navy-200"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* ── Strokes ─────────────────────────────────────── */}
      <div className="card-surface rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">סגנונות שחייה</h2>
        {errors.strokes && (
          <p className="text-xs text-danger-400">{errors.strokes.message}</p>
        )}
        <Controller
          control={control}
          name="strokes"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {STROKES.map((stroke) => {
                const active = field.value.includes(stroke);
                return (
                  <button
                    key={stroke}
                    type="button"
                    onClick={() => {
                      if (active) field.onChange(field.value.filter((s) => s !== stroke));
                      else        field.onChange([...field.value, stroke]);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm border transition-colors",
                      active
                        ? "bg-signal-400/10 border-signal-400/60 text-signal-300"
                        : "bg-navy-900 border-surface-border text-navy-400 hover:text-navy-200"
                    )}
                  >
                    {STROKE_LABELS[stroke].en}
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      {/* ── Main events ─────────────────────────────────── */}
      <div className="card-surface rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">אירועים עיקריים</h2>
        {errors.main_events && (
          <p className="text-xs text-danger-400">{errors.main_events.message}</p>
        )}
        <Controller
          control={control}
          name="main_events"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {SWIM_EVENTS.map((evt) => {
                const active = field.value.includes(evt.key);
                return (
                  <button
                    key={evt.key}
                    type="button"
                    onClick={() => {
                      if (active) field.onChange(field.value.filter((k) => k !== evt.key));
                      else        field.onChange([...field.value, evt.key]);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs border transition-colors",
                      active
                        ? "bg-signal-400/10 border-signal-400/60 text-signal-300"
                        : "bg-navy-900 border-surface-border text-navy-400 hover:text-navy-200"
                    )}
                  >
                    {evt.label}
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      {/* ── Goals ───────────────────────────────────────── */}
      <div className="card-surface rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">יעדים</h2>
        <Textarea
          placeholder="מהם יעדי השחייה שלך העונה?"
          rows={3}
          {...register("goals")}
        />
      </div>

      {/* ── Actions ─────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-success-400">
            <Check className="h-4 w-4" />
            נשמר
          </span>
        )}
        <Button
          type="submit"
          variant="signal"
          disabled={isSubmitting || !isDirty}
          className="gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          שמור שינויים
        </Button>
      </div>
    </form>
  );
}
