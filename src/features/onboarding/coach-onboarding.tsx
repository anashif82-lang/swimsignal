"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { coachOnboardingSchema, type CoachOnboardingInput } from "@/lib/validations/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function CoachOnboarding() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CoachOnboardingInput>({
    resolver: zodResolver(coachOnboardingSchema),
  });

  const onSubmit = async (data: CoachOnboardingInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/onboarding/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      router.push("/coach");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-lg animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">הגדר את פרופיל המאמן שלך</h1>
        <p className="text-navy-300 text-sm mt-1">
          שחיינים ימצאו אותך לפי שם כשהם יצטרפו
        </p>
      </div>

      <div className="card-signal p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Input
            label="שם מלא"
            placeholder="השם המלא שלך"
            autoFocus
            error={errors.full_name?.message}
            {...register("full_name")}
          />

          <Input
            label="מועדון / קבוצה"
            placeholder="לדוגמה מכבי חיפה שחייה"
            error={errors.club_name?.message}
            {...register("club_name")}
          />

          <Textarea
            label="ביוגרפיה"
            placeholder="תיאור קצר של הרקע האימוני שלך..."
            hint="אופציונלי – גלוי לשחיינים שמחפשים אותך"
            rows={3}
            {...register("bio")}
          />

          <Textarea
            label="הסמכות"
            placeholder="תעודות, ניסיון, רישיונות..."
            hint="אופציונלי"
            rows={2}
            {...register("credentials")}
          />

          {serverError && (
            <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-3 py-2 text-sm text-danger-400">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            variant="signal"
            size="lg"
            className="w-full gap-2 mt-2"
            loading={isSubmitting}
          >
            <Check className="h-4 w-4" />
            סיים הגדרה
          </Button>
        </form>
      </div>
    </div>
  );
}
