"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      {/* Google sign-in */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-surface-border bg-surface-card text-sm font-medium text-navy-100 hover:bg-surface-raised hover:text-white transition-colors mb-6"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        המשך עם Google
      </button>

      <div className="relative flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-surface-border" />
        <span className="text-xs text-navy-400">or</span>
        <div className="flex-1 h-px bg-surface-border" />
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

        <Input
          label="סיסמה"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="הכנס את הסיסמה שלך"
          startIcon={<Lock className="h-4 w-4" />}
          endIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-xs text-signal-400 hover:text-signal-300 transition-colors"
          >
            שכחת סיסמה?
          </Link>
        </div>

        {serverError && (
          <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-3 py-2 text-sm text-danger-400">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          variant="signal"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          כניסה
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-400">
        אין לך חשבון?{" "}
        <Link href="/auth/signup" className="text-signal-400 hover:text-signal-300 font-medium transition-colors">
          צור חשבון
        </Link>
      </p>
    </div>
  );
}
