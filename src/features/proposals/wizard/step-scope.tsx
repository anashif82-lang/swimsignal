"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scopeStepSchema, type ScopeStepValues } from "@/lib/validations/proposal";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StepScopeProps {
  defaultValues: Partial<ScopeStepValues>;
  onNext: (data: ScopeStepValues) => void;
  onBack: () => void;
}

export function StepScope({ defaultValues, onNext, onBack }: StepScopeProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ScopeStepValues>({
    resolver: zodResolver(scopeStepSchema) as any,
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Scope & deliverables</h2>
        <p className="text-sm text-gray-500">
          What exactly will you deliver? List one item per line.
        </p>
      </div>

      <Textarea
        label="Deliverables *"
        placeholder={`Homepage design\nAbout page\nContact form\nMobile responsive layout\nSEO meta tags`}
        rows={6}
        hint="One deliverable per line. AI will format and expand these."
        error={errors.deliverables?.message}
        {...register("deliverables")}
      />

      <Textarea
        label="Out of scope"
        placeholder={`Copywriting\nServer hosting\nThird-party integrations`}
        rows={3}
        hint="Optional – helps prevent scope creep by making exclusions explicit"
        error={errors.out_of_scope?.message}
        {...register("out_of_scope")}
      />

      <Input
        label="Revision policy"
        placeholder="e.g. 2 rounds of revisions included"
        hint="Optional – helps set expectations with clients"
        error={errors.revisions?.message}
        {...register("revisions")}
      />

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>← Back</Button>
        <Button type="submit">Continue →</Button>
      </div>
    </form>
  );
}
