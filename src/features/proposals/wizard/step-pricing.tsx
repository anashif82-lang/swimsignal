"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pricingStepSchema, type PricingStepValues } from "@/lib/validations/proposal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRICING_MODELS = [
  { value: "fixed", label: "Fixed price" },
  { value: "hourly", label: "Hourly rate" },
  { value: "retainer", label: "Monthly retainer" },
  { value: "milestone", label: "Milestone-based" },
];

const CURRENCIES = [
  { value: "USD", label: "USD – US Dollar" },
  { value: "EUR", label: "EUR – Euro" },
  { value: "GBP", label: "GBP – British Pound" },
  { value: "ILS", label: "ILS – Israeli Shekel" },
  { value: "AED", label: "AED – UAE Dirham" },
  { value: "CAD", label: "CAD – Canadian Dollar" },
  { value: "AUD", label: "AUD – Australian Dollar" },
];

interface StepPricingProps {
  defaultValues: Partial<PricingStepValues>;
  onNext: (data: PricingStepValues) => void;
  onBack: () => void;
}

export function StepPricing({ defaultValues, onNext, onBack }: StepPricingProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<PricingStepValues>({
    resolver: zodResolver(pricingStepSchema) as any,
    defaultValues: { currency: "USD", pricing_model: "fixed", ...defaultValues },
  });

  const model = watch("pricing_model");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Pricing & timeline</h2>
        <p className="text-sm text-gray-500">
          How will you charge? The AI will format a full pricing section from this.
        </p>
      </div>

      {/* Pricing model picker */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Pricing model *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRICING_MODELS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("pricing_model", opt.value as PricingStepValues["pricing_model"])}
              className={cn(
                "rounded-lg border px-4 py-3 text-sm font-medium text-left transition-all",
                model === opt.value
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Currency *"
          options={CURRENCIES}
          value={watch("currency")}
          onChange={(e) => setValue("currency", e.target.value)}
          error={errors.currency?.message}
        />

        {model === "hourly" ? (
          <Input
            label="Hourly rate *"
            type="number"
            placeholder="150"
            error={errors.hourly_rate?.message}
            {...register("hourly_rate")}
          />
        ) : (
          <Input
            label={model === "retainer" ? "Monthly amount *" : "Total amount *"}
            type="number"
            placeholder="5000"
            error={errors.price_amount?.message}
            {...register("price_amount")}
          />
        )}
      </div>

      <Input
        label="Timeline *"
        placeholder="e.g. 3 weeks, 2 months"
        error={errors.timeline?.message}
        hint="How long will this project take?"
        {...register("timeline")}
      />

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>← Back</Button>
        <Button type="submit">Continue →</Button>
      </div>
    </form>
  );
}
