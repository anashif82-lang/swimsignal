"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProposalFormData } from "@/types";
import { StepIndicator } from "./step-indicator";
import { StepClient } from "./step-client";
import { StepProject } from "./step-project";
import { StepScope } from "./step-scope";
import { StepPricing } from "./step-pricing";
import { StepTone } from "./step-tone";
import { StepReview } from "./step-review";
import { useToast } from "@/components/ui/toast";

const STEPS = [
  { label: "Client", description: "Who is this for?" },
  { label: "Project", description: "What are you building?" },
  { label: "Scope", description: "What will you deliver?" },
  { label: "Pricing", description: "How much will it cost?" },
  { label: "Style", description: "Tone and branding" },
  { label: "Generate", description: "Review and create" },
];

export function ProposalWizard() {
  const router = useRouter();
  const { show, ToastComponent } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ProposalFormData>>({
    currency: "USD",
    pricing_model: "fixed",
    tone: "professional",
  });

  function mergeAndNext<T extends Partial<ProposalFormData>>(data: T) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((s) => s + 1);
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }

      const { proposal } = await res.json();
      router.push(`/dashboard/proposals/${proposal.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      show(message, "error");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {ToastComponent}

      {/* Step indicator */}
      <div className="flex justify-center mb-10 overflow-x-auto pb-2">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      {/* Step panels */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {step === 0 && (
          <StepClient
            defaultValues={formData}
            onNext={(data) => mergeAndNext(data)}
          />
        )}
        {step === 1 && (
          <StepProject
            defaultValues={formData}
            onNext={(data) => mergeAndNext(data)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepScope
            defaultValues={formData}
            onNext={(data) => mergeAndNext(data)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepPricing
            defaultValues={formData}
            onNext={(data) => mergeAndNext(data)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepTone
            defaultValues={formData}
            onNext={(data) => mergeAndNext(data)}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <StepReview
            data={formData}
            onGenerate={handleGenerate}
            onBack={() => setStep(4)}
            loading={loading}
          />
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-6 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">
        Step {step + 1} of {STEPS.length}
      </p>
    </div>
  );
}
