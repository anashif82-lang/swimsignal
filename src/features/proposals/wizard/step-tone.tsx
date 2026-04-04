"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toneStepSchema, type ToneStepValues } from "@/lib/validations/proposal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TONES = [
  {
    value: "professional",
    label: "Professional",
    desc: "Polished, confident, business-standard",
  },
  {
    value: "friendly",
    label: "Friendly",
    desc: "Warm, approachable, conversational",
  },
  {
    value: "formal",
    label: "Formal",
    desc: "Structured, precise, corporate",
  },
  {
    value: "creative",
    label: "Creative",
    desc: "Bold, energetic, standout",
  },
];

interface StepToneProps {
  defaultValues: Partial<ToneStepValues>;
  onNext: (data: ToneStepValues) => void;
  onBack: () => void;
}

export function StepTone({ defaultValues, onNext, onBack }: StepToneProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ToneStepValues>({
    resolver: zodResolver(toneStepSchema) as any,
    defaultValues: { tone: "professional", ...defaultValues },
  });

  const tone = watch("tone");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Tone & your details</h2>
        <p className="text-sm text-gray-500">
          Pick a writing tone and tell us who is sending this proposal.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Proposal tone *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TONES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("tone", opt.value as ToneStepValues["tone"])}
              className={cn(
                "rounded-lg border px-4 py-3 text-left transition-all",
                tone === opt.value
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className={cn(
                "text-sm font-medium",
                tone === opt.value ? "text-violet-700" : "text-gray-800"
              )}>
                {opt.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Your name *"
          placeholder="Alex Johnson"
          error={errors.your_name?.message}
          {...register("your_name")}
        />
        <Input
          label="Your company"
          placeholder="Studio Alex"
          {...register("your_company")}
        />
      </div>

      <Textarea
        label="Additional notes for AI"
        placeholder="Any extra context? Special payment terms, specific tech stack, client background..."
        rows={3}
        hint="Optional – helps the AI write a more tailored proposal"
        {...register("extra_notes")}
      />

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>← Back</Button>
        <Button type="submit">Review & Generate →</Button>
      </div>
    </form>
  );
}
