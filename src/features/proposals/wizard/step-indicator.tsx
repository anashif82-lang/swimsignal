import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const done = idx < current;
        const active = idx === current;
        const last = idx === steps.length - 1;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  done && "bg-violet-600 text-white",
                  active && "bg-violet-600 text-white ring-4 ring-violet-100",
                  !done && !active && "bg-gray-100 text-gray-400"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <div
                className={cn(
                  "mt-1.5 text-xs font-medium whitespace-nowrap",
                  active ? "text-violet-700" : done ? "text-gray-600" : "text-gray-400"
                )}
              >
                {step.label}
              </div>
            </div>
            {!last && (
              <div
                className={cn(
                  "h-px w-12 mx-2 mb-5",
                  idx < current ? "bg-violet-400" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
