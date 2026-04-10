"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check } from "lucide-react";
import { updateCoachProfileSchema, type UpdateCoachProfileInput } from "@/lib/validations/profile";
import type { Profile, CoachProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  profile:      Profile;
  coachProfile: CoachProfile | null;
}

export function CoachProfileForm({ profile, coachProfile }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateCoachProfileInput>({
    resolver: zodResolver(updateCoachProfileSchema),
    defaultValues: {
      full_name:   profile.full_name       ?? "",
      club_name:   coachProfile?.club_name_raw ?? "",
      bio:         coachProfile?.bio        ?? "",
      credentials: coachProfile?.credentials ?? "",
    },
  });

  async function onSubmit(data: UpdateCoachProfileInput) {
    setServerError(null);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "Failed to save.");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg bg-danger-950 border border-danger-800 px-4 py-3 text-sm text-danger-300">
          {serverError}
        </div>
      )}

      {/* ── Basic info ── */}
      <div className="card-surface rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">פרטים בסיסיים</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="שם מלא"
            {...register("full_name")}
            error={errors.full_name?.message}
          />
          <Input
            label="מועדון"
            placeholder="לדוגמה: מכבי חיפה"
            {...register("club_name")}
            error={errors.club_name?.message}
          />
        </div>
      </div>

      {/* ── About ── */}
      <div className="card-surface rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">אודות</h2>
        <Textarea
          label="ביוגרפיה (אופציונלי)"
          placeholder="תיאור קצר עליך ועל גישת האימון שלך..."
          rows={3}
          {...register("bio")}
        />
        <Textarea
          label="הסמכות (אופציונלי)"
          placeholder="תעודות, ניסיון, הישגים בולטים..."
          rows={2}
          {...register("credentials")}
        />
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-success-400">
            <Check className="h-4 w-4" />
            נשמר
          </span>
        )}
        <Button
          type="submit"
          variant="signal"
          disabled={isSubmitting || !isDirty}
          className="gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          שמור שינויים
        </Button>
      </div>
    </form>
  );
}
