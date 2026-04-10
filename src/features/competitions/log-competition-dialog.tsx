"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { competitionSchema, type CompetitionInput } from "@/lib/validations/competition";
import { SWIM_EVENTS } from "@/types";
import { parseSwimTime, todayISO, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const LEVEL_OPTIONS = [
  { value: "",              label: "רמה (אופציונלי)" },
  { value: "local",         label: "מקומי" },
  { value: "regional",      label: "אזורי" },
  { value: "national",      label: "ארצי" },
  { value: "international", label: "בינלאומי" },
];

const EVENT_OPTIONS = [
  { value: "", label: "בחר אירוע..." },
  ...SWIM_EVENTS.map((e) => ({ value: e.key, label: e.label })),
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LogCompetitionDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompetitionInput>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      name:             "",
      competition_date: todayISO(),
      location:         "",
      pool_length:      "50m",
      notes:            "",
      results: [
        {
          event_name:       "",
          final_time:       "",
          final_time_ms:    0,
          is_personal_best: false,
          is_official:      true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "results" });
  const poolLength = watch("pool_length");

  function handleClose() {
    reset();
    setServerError(null);
    onClose();
  }

  async function onSubmit(data: CompetitionInput) {
    setServerError(null);

    // Parse time strings → ms for each result
    const results = data.results.map((r) => ({
      ...r,
      final_time_ms:  parseSwimTime(r.final_time) ?? 0,
      heat_time_ms:   r.heat_time ? (parseSwimTime(r.heat_time) ?? undefined) : undefined,
      goal_time_ms:   r.goal_time ? (parseSwimTime(r.goal_time) ?? undefined) : undefined,
      // Derive stroke + distance from SWIM_EVENTS catalog
      stroke:   SWIM_EVENTS.find((e) => e.key === r.event_name)?.stroke,
      distance: SWIM_EVENTS.find((e) => e.key === r.event_name)?.distance,
    }));

    const payload = {
      ...data,
      level:   data.level || undefined,
      location: data.location || undefined,
      notes:   data.notes || undefined,
      results,
    };

    const res = await fetch("/api/competitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "שמירת התחרות נכשלה.");
      return;
    }

    handleClose();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto max-w-xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">תעד תחרות</h2>
          <p className="text-sm text-navy-400 mt-0.5">תיעוד תוצאות מתחרות</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div className="rounded-lg bg-danger-950 border border-danger-800 px-4 py-3 text-sm text-danger-300">
              {serverError}
            </div>
          )}

          {/* ── Competition details ────────────────────────────────── */}
          <div className="space-y-3">
            <Input
              label="שם התחרות"
              placeholder="לדוג. אליפות ישראל 2025"
              {...register("name")}
              error={errors.name?.message}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="תאריך"
                type="date"
                {...register("competition_date")}
                error={errors.competition_date?.message}
              />
              <Input
                label="מיקום"
                placeholder="לדוג. תל אביב"
                {...register("location")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Pool length */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-navy-200">בריכה</label>
                <Controller
                  control={control}
                  name="pool_length"
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {(["50m", "25m"] as const).map((pl) => (
                        <button
                          key={pl}
                          type="button"
                          onClick={() => field.onChange(pl)}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                            field.value === pl
                              ? "bg-signal-400/10 border-signal-400/60 text-signal-300"
                              : "bg-navy-900 border-surface-border text-navy-400 hover:text-navy-200"
                          )}
                        >
                          {pl}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Level */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-navy-200">רמה</label>
                <Controller
                  control={control}
                  name="level"
                  render={({ field }) => (
                    <Select
                      options={LEVEL_OPTIONS}
                      value={field.value ?? ""}
                      onChange={(v) => field.onChange(v || undefined)}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* ── Results ───────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-navy-300 uppercase tracking-wide">
                תוצאות
              </label>
              {errors.results?.root && (
                <span className="text-xs text-danger-400">{errors.results.root.message}</span>
              )}
            </div>

            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="bg-navy-900/60 rounded-lg p-4 space-y-3 border border-surface-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-navy-400 font-medium">תוצאה {idx + 1}</span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="text-navy-500 hover:text-danger-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Event + time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-navy-200">אירוע</label>
                    <Controller
                      control={control}
                      name={`results.${idx}.event_name`}
                      render={({ field: f }) => (
                        <Select
                          options={EVENT_OPTIONS}
                          value={f.value}
                          onChange={f.onChange}
                        />
                      )}
                    />
                    {errors.results?.[idx]?.event_name && (
                      <p className="text-xs text-danger-400">{errors.results[idx].event_name.message}</p>
                    )}
                  </div>

                  <Input
                    label="זמן סופי"
                    placeholder="1:02.34"
                    {...register(`results.${idx}.final_time`)}
                    error={errors.results?.[idx]?.final_time?.message}
                  />
                </div>

                {/* Optional: place, goal time */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="מקום (אופציונלי)"
                    type="number"
                    placeholder="לדוג. 3"
                    min={1}
                    {...register(`results.${idx}.place`, { valueAsNumber: true })}
                  />
                  <Input
                    label="זמן יעד (אופציונלי)"
                    placeholder="1:01.50"
                    {...register(`results.${idx}.goal_time`)}
                  />
                </div>

                {/* Flags */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Controller
                      control={control}
                      name={`results.${idx}.is_personal_best`}
                      render={({ field: f }) => (
                        <input
                          type="checkbox"
                          checked={f.value}
                          onChange={(e) => f.onChange(e.target.checked)}
                          className="w-4 h-4 rounded border-surface-border bg-navy-900 accent-signal-400"
                        />
                      )}
                    />
                    <span className="text-sm text-navy-300">שיא אישי</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Controller
                      control={control}
                      name={`results.${idx}.is_official`}
                      render={({ field: f }) => (
                        <input
                          type="checkbox"
                          checked={f.value}
                          onChange={(e) => f.onChange(e.target.checked)}
                          className="w-4 h-4 rounded border-surface-border bg-navy-900 accent-signal-400"
                        />
                      )}
                    />
                    <span className="text-sm text-navy-300">תוצאה רשמית</span>
                  </label>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                append({
                  event_name:       "",
                  final_time:       "",
                  final_time_ms:    0,
                  is_personal_best: false,
                  is_official:      true,
                })
              }
            >
              <Plus className="h-4 w-4" />
              הוסף אירוע
            </Button>
          </div>

          {/* Notes */}
          <Textarea
            label="הערות (אופציונלי)"
            placeholder="הערות על התחרות..."
            rows={2}
            {...register("notes")}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              ביטול
            </Button>
            <Button type="submit" variant="signal" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              שמור תחרות
            </Button>
          </div>
        </form>
      </div>
      </DialogContent>
    </Dialog>
  );
}
