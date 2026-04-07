"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { swimmerOnboardingSchema, type SwimmerOnboardingInput } from "@/lib/validations/onboarding";
import { SWIM_EVENTS, STROKE_LABELS, type StrokeType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STROKES: StrokeType[] = ["freestyle", "backstroke", "breaststroke", "butterfly", "individual_medley"];
const TOTAL_STEPS = 4;

interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
}

function StepIndicator({ current, total, labels }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-navy-400">Step {current + 1} of {total}</span>
        <span className="text-xs text-navy-400">{labels[current]}</span>
      </div>
      <Progress value={((current + 1) / total) * 100} />
    </div>
  );
}

export function SwimmerOnboarding({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SwimmerOnboardingInput>({
    resolver: zodResolver(swimmerOnboardingSchema),
    defaultValues: {
      strokes: [],
      main_events: [],
    },
  });

  const strokes = watch("strokes") ?? [];
  const events = watch("main_events") ?? [];

  const toggleStroke = (s: StrokeType) => {
    if (strokes.includes(s)) {
      setValue("strokes", strokes.filter((x) => x !== s), { shouldValidate: true });
    } else {
      setValue("strokes", [...strokes, s], { shouldValidate: true });
    }
  };

  const toggleEvent = (key: string) => {
    if (events.includes(key)) {
      setValue("main_events", events.filter((x) => x !== key), { shouldValidate: true });
    } else {
      setValue("main_events", [...events, key], { shouldValidate: true });
    }
  };

  const stepLabels = ["Basic Info", "Club & Coach", "Swimming", "Goals"];

  const nextStep = async () => {
    const fieldsPerStep: (keyof SwimmerOnboardingInput)[][] = [
      ["full_name", "birth_year", "gender"],
      ["club_name"],
      ["strokes", "main_events"],
      [],
    ];
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const onSubmit = async (data: SwimmerOnboardingInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/onboarding/swimmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const genderOptions = [
    { value: "male",              label: "Male",            labelHe: "זכר"   },
    { value: "female",            label: "Female",          labelHe: "נקבה"  },
    { value: "other",             label: "Other",           labelHe: "אחר"   },
    { value: "prefer_not_to_say", label: "Prefer not to say", labelHe: "לא לציין" },
  ] as const;

  return (
    <div className="w-full max-w-lg animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Set up your swimmer profile</h1>
        <p className="text-navy-300 text-sm mt-1">
          Let&apos;s personalize your SwimSignal experience
        </p>
      </div>

      <div className="card-signal p-6 sm:p-8">
        <StepIndicator current={step} total={TOTAL_STEPS} labels={stepLabels} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* ── Step 0: Basic Info ─────────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <Input
                label="Full Name"
                placeholder="Your full name"
                autoFocus
                error={errors.full_name?.message}
                {...register("full_name")}
              />

              <Input
                label="Birth Year"
                type="number"
                placeholder="e.g. 2005"
                min={1940}
                max={new Date().getFullYear() - 4}
                error={errors.birth_year?.message}
                {...register("birth_year", { valueAsNumber: true })}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-navy-100">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {genderOptions.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setValue("gender", g.value, { shouldValidate: true })}
                      className={cn(
                        "py-2.5 px-3 rounded-lg border text-sm font-medium transition-all",
                        watch("gender") === g.value
                          ? "border-signal-400 bg-signal-400/10 text-signal-400"
                          : "border-surface-border bg-navy-900/50 text-navy-300 hover:border-navy-500 hover:text-white"
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                {errors.gender && <p className="text-xs text-danger-400">{errors.gender.message}</p>}
              </div>
            </div>
          )}

          {/* ── Step 1: Club & Coach ───────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <Input
                label="Swimming Club"
                placeholder="e.g. Hapoel Tel Aviv Swimming"
                autoFocus
                error={errors.club_name?.message}
                {...register("club_name")}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-navy-100">
                  Coach <span className="text-navy-500 font-normal">(optional)</span>
                </label>
                <p className="text-xs text-navy-400">
                  You can search for your coach by name. They&apos;ll need to approve the connection.
                </p>
                <Input
                  placeholder="Search coach by name..."
                  hint="Leave blank to skip — you can add a coach later"
                  {...register("coach_id")}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Strokes & Events ───────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="text-sm font-medium text-navy-100 mb-3 block">
                  Your strokes
                  <span className="text-navy-400 font-normal ms-1">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {STROKES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStroke(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                        strokes.includes(s)
                          ? "border-signal-400 bg-signal-400/10 text-signal-400"
                          : "border-surface-border bg-navy-900/50 text-navy-300 hover:border-navy-500 hover:text-white"
                      )}
                    >
                      {STROKE_LABELS[s].en}
                    </button>
                  ))}
                </div>
                {errors.strokes && <p className="text-xs text-danger-400 mt-2">{errors.strokes.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-navy-100 mb-3 block">
                  Main events
                  <span className="text-navy-400 font-normal ms-1">(select your key races)</span>
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pe-1">
                  {SWIM_EVENTS.filter((e) =>
                    strokes.length === 0 || strokes.some((s) => e.stroke === s)
                  ).map((e) => (
                    <button
                      key={e.key}
                      type="button"
                      onClick={() => toggleEvent(e.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm border transition-all",
                        events.includes(e.key)
                          ? "border-signal-400 bg-signal-400/10 text-signal-400"
                          : "border-surface-border bg-navy-900/50 text-navy-300 hover:border-navy-500 hover:text-white"
                      )}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
                {errors.main_events && (
                  <p className="text-xs text-danger-400 mt-2">{errors.main_events.message}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Goals ─────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <Textarea
                label="Your swimming goals"
                placeholder="e.g. Break 1:00 in the 100m freestyle by end of season, qualify for nationals..."
                hint="Optional – helps your coach understand what you're working toward"
                rows={5}
                {...register("goals")}
              />

              {serverError && (
                <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-3 py-2 text-sm text-danger-400">
                  {serverError}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-surface-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {step < TOTAL_STEPS - 1 ? (
              <Button type="button" variant="signal" onClick={nextStep} className="gap-1.5">
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" variant="signal" loading={isSubmitting} className="gap-1.5">
                <Check className="h-4 w-4" />
                Complete setup
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
