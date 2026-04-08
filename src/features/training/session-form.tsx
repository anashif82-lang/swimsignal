"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { trainingSessionSchema, type TrainingSessionInput } from "@/lib/validations/training";
import { todayISO } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STROKE_OPTIONS = [
  { value: "freestyle",         label: "Freestyle" },
  { value: "backstroke",        label: "Backstroke" },
  { value: "breaststroke",      label: "Breaststroke" },
  { value: "butterfly",         label: "Butterfly" },
  { value: "individual_medley", label: "IM" },
];

const STATUS_OPTIONS = [
  { value: "completed",     label: "Completed" },
  { value: "partial",       label: "Partial" },
  { value: "not_completed", label: "Not completed" },
];

interface Props {
  /** Pre-filled values for edit mode */
  defaultValues?: Partial<TrainingSessionInput>;
  sessionId?: string;
}

export function SessionForm({ defaultValues, sessionId }: Props) {
  const router = useRouter();
  const [showSets, setShowSets] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TrainingSessionInput>({
    resolver: zodResolver(trainingSessionSchema),
    defaultValues: {
      session_date:   defaultValues?.session_date ?? todayISO(),
      training_type:  defaultValues?.training_type ?? "water",
      status:         defaultValues?.status ?? "completed",
      pool_length:    defaultValues?.pool_length,
      title:          defaultValues?.title ?? "",
      total_distance: defaultValues?.total_distance,
      total_duration: defaultValues?.total_duration,
      rpe:            defaultValues?.rpe,
      notes:          defaultValues?.notes ?? "",
      sets:           defaultValues?.sets ?? [],
      tag_ids:        defaultValues?.tag_ids ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "sets" });
  const trainingType = watch("training_type");

  async function onSubmit(data: TrainingSessionInput) {
    setServerError(null);
    const url    = sessionId ? `/api/training/${sessionId}` : "/api/training";
    const method = sessionId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "Failed to save session.");
      return;
    }

    const json = await res.json();
    router.push(`/dashboard/training/${json.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg bg-danger-950 border border-danger-800 px-4 py-3 text-sm text-danger-300">
          {serverError}
        </div>
      )}

      {/* ── Section 1: Basic Info ─────────────────────────────────── */}
      <div className="card-surface rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">
          Session Info
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <Input
            label="Date"
            type="date"
            {...register("session_date")}
            error={errors.session_date?.message}
          />

          {/* Title */}
          <Input
            label="Title (optional)"
            placeholder="e.g. Morning endurance"
            {...register("title")}
            error={errors.title?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy-200">Type</label>
            <Controller
              control={control}
              name="training_type"
              render={({ field }) => (
                <div className="flex gap-2 flex-wrap">
                  {(["water", "dryland", "gym", "other"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => field.onChange(t)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                        field.value === t
                          ? "bg-signal-400/10 border-signal-400/60 text-signal-300"
                          : "bg-navy-900 border-surface-border text-navy-400 hover:text-navy-200"
                      )}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.training_type && (
              <p className="text-xs text-danger-400">{errors.training_type.message}</p>
            )}
          </div>

          {/* Pool Length — only for water */}
          {trainingType === "water" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-navy-200">Pool Length</label>
              <Controller
                control={control}
                name="pool_length"
                render={({ field }) => (
                  <div className="flex gap-2">
                    {(["25m", "50m"] as const).map((pl) => (
                      <button
                        key={pl}
                        type="button"
                        onClick={() => field.onChange(pl)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors",
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
              {errors.pool_length && (
                <p className="text-xs text-danger-400">{errors.pool_length.message}</p>
              )}
            </div>
          )}

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy-200">Status</label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  options={STATUS_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Stats ──────────────────────────────────────── */}
      <div className="card-surface rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">
          Stats
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Input
            label="Distance (m)"
            type="number"
            placeholder="e.g. 3500"
            {...register("total_distance", { valueAsNumber: true })}
            error={errors.total_distance?.message}
          />
          <Input
            label="Duration (min)"
            type="number"
            placeholder="e.g. 90"
            {...register("total_duration", { valueAsNumber: true })}
            error={errors.total_duration?.message}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy-200">
              RPE <span className="text-navy-500">(1–10)</span>
            </label>
            <Controller
              control={control}
              name="rpe"
              render={({ field }) => (
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => field.onChange(n)}
                      className={cn(
                        "w-7 h-7 rounded text-xs font-medium border transition-colors",
                        field.value === n
                          ? "bg-signal-400/20 border-signal-400/60 text-signal-300"
                          : "bg-navy-900 border-surface-border text-navy-500 hover:text-navy-300"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Notes ─────────────────────────────────────── */}
      <div className="card-surface rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">Notes</h2>
        <Textarea
          label=""
          placeholder="How did the session go? Any observations..."
          rows={4}
          {...register("notes")}
          error={errors.notes?.message}
        />
      </div>

      {/* ── Section 4: Sets (collapsible) ────────────────────────── */}
      <div className="card-surface rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSets(!showSets)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-navy-900/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">
              Sets
            </h2>
            {fields.length > 0 && (
              <span className="text-xs text-signal-400 font-medium bg-signal-400/10 px-1.5 py-0.5 rounded">
                {fields.length}
              </span>
            )}
          </div>
          {showSets
            ? <ChevronUp className="h-4 w-4 text-navy-400" />
            : <ChevronDown className="h-4 w-4 text-navy-400" />}
        </button>

        {showSets && (
          <div className="px-5 pb-5 space-y-3 border-t border-surface-border">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="bg-navy-900/60 rounded-lg p-4 space-y-3 border border-surface-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-navy-400">Set {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-navy-500 hover:text-danger-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input
                    label="Reps"
                    type="number"
                    min={1}
                    {...register(`sets.${idx}.repetitions`, { valueAsNumber: true })}
                    error={errors.sets?.[idx]?.repetitions?.message}
                  />
                  <Input
                    label="Distance (m)"
                    type="number"
                    placeholder="e.g. 100"
                    {...register(`sets.${idx}.distance`, { valueAsNumber: true })}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-navy-200">Stroke</label>
                    <Controller
                      control={control}
                      name={`sets.${idx}.stroke`}
                      render={({ field: f }) => (
                        <Select
                          options={[{ value: "", label: "Any" }, ...STROKE_OPTIONS]}
                          value={f.value ?? ""}
                          onChange={(v) => f.onChange(v || undefined)}
                        />
                      )}
                    />
                  </div>
                  <Input
                    label="Rest (sec)"
                    type="number"
                    placeholder="30"
                    {...register(`sets.${idx}.rest_seconds`, { valueAsNumber: true })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Target time"
                    placeholder="1:02.34"
                    {...register(`sets.${idx}.target_time`)}
                    error={errors.sets?.[idx]?.target_time?.message}
                  />
                  <Input
                    label="Actual time"
                    placeholder="1:02.50"
                    {...register(`sets.${idx}.actual_time`)}
                    error={errors.sets?.[idx]?.actual_time?.message}
                  />
                </div>

                <Input
                  label="Description"
                  placeholder="e.g. Descend pace each 50m"
                  {...register(`sets.${idx}.description`)}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                append({
                  set_order:   fields.length,
                  repetitions: 1,
                  distance:    undefined,
                  stroke:      undefined,
                  rest_seconds: undefined,
                  target_time: "",
                  actual_time: "",
                  description: "",
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add Set
            </Button>
          </div>
        )}
      </div>

      {/* ── Submit ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="signal" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {sessionId ? "Save changes" : "Log session"}
        </Button>
      </div>
    </form>
  );
}
