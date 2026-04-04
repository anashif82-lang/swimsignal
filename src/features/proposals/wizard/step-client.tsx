"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientStepSchema, type ClientStepValues } from "@/lib/validations/proposal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StepClientProps {
  defaultValues: Partial<ClientStepValues>;
  onNext: (data: ClientStepValues) => void;
}

export function StepClient({ defaultValues, onNext }: StepClientProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ClientStepValues>({
    resolver: zodResolver(clientStepSchema) as any,
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Client information</h2>
        <p className="text-sm text-gray-500">Who is this proposal for?</p>
      </div>

      <Input
        label="Client name *"
        placeholder="Jane Smith"
        error={errors.client_name?.message}
        {...register("client_name")}
      />
      <Input
        label="Client email"
        type="email"
        placeholder="jane@acmecorp.com"
        error={errors.client_email?.message}
        hint="Used to pre-fill the shareable proposal page"
        {...register("client_email")}
      />
      <Input
        label="Company name"
        placeholder="Acme Corp"
        error={errors.client_company?.message}
        {...register("client_company")}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit">Continue →</Button>
      </div>
    </form>
  );
}
