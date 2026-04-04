"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectStepSchema, type ProjectStepValues } from "@/lib/validations/proposal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const PROJECT_TYPES = [
  { value: "Web Design & Development", label: "Web Design & Development" },
  { value: "Mobile App Development", label: "Mobile App Development" },
  { value: "Branding & Identity", label: "Branding & Identity" },
  { value: "SEO & Content Marketing", label: "SEO & Content Marketing" },
  { value: "UI/UX Design", label: "UI/UX Design" },
  { value: "E-commerce Development", label: "E-commerce Development" },
  { value: "Copywriting", label: "Copywriting" },
  { value: "Video Production", label: "Video Production" },
  { value: "Consulting", label: "Consulting" },
  { value: "Software Development", label: "Software Development" },
  { value: "Digital Marketing", label: "Digital Marketing" },
  { value: "Other", label: "Other" },
];

interface StepProjectProps {
  defaultValues: Partial<ProjectStepValues>;
  onNext: (data: ProjectStepValues) => void;
  onBack: () => void;
}

export function StepProject({ defaultValues, onNext, onBack }: StepProjectProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ProjectStepValues>({
    resolver: zodResolver(projectStepSchema) as any,
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Project details</h2>
        <p className="text-sm text-gray-500">
          Tell the AI what this project is about. More detail = better output.
        </p>
      </div>

      <Select
        label="Project type *"
        options={PROJECT_TYPES}
        placeholder="Select type..."
        value={watch("project_type") ?? ""}
        onChange={(e) => setValue("project_type", e.target.value)}
        error={errors.project_type?.message}
      />

      <Textarea
        label="Project description *"
        placeholder="Describe what the client needs. What are they trying to build or achieve? Be specific."
        rows={4}
        error={errors.project_description?.message}
        {...register("project_description")}
      />

      <Textarea
        label="Client goals *"
        placeholder="What outcomes does the client want? E.g. increase conversions, launch MVP, rebrand..."
        rows={3}
        error={errors.goals?.message}
        {...register("goals")}
      />

      <Textarea
        label="Challenges or pain points"
        placeholder="What problems are they facing? This helps AI write a stronger problem statement."
        rows={2}
        error={errors.challenges?.message}
        {...register("challenges")}
      />

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>← Back</Button>
        <Button type="submit">Continue →</Button>
      </div>
    </form>
  );
}
