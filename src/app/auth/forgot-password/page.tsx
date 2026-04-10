"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-signal-400/10 border border-signal-400/30 flex items-center justify-center mx-auto mb-4">
          <Mail className="h-7 w-7 text-signal-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">בדוק את תיבת הדואר</h2>
        <p className="text-navy-300 text-sm mb-6">
          אם קיים חשבון עם האימייל הזה, תקבל קישור לאיפוס בקרוב.
        </p>
        <Link href="/auth/login" className="text-signal-400 text-sm hover:text-signal-300 transition-colors">
          חזור להתחברות
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">איפוס סיסמה</h1>
        <p className="text-navy-300 text-sm mt-1">
          הכנס את האימייל שלך ונשלח קישור לאיפוס
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="אימייל"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          startIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        {serverError && (
          <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-3 py-2 text-sm text-danger-400">
            {serverError}
          </div>
        )}

        <Button type="submit" variant="signal" size="lg" className="w-full" loading={isSubmitting}>
          שלח קישור לאיפוס
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-400">
        זוכר את הסיסמה?{" "}
        <Link href="/auth/login" className="text-signal-400 hover:text-signal-300 font-medium transition-colors">
          כניסה
        </Link>
      </p>
    </>
  );
}
