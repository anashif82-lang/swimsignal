"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Lucide doesn't have a whistle icon; use a fallback
const CoachIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
    <circle cx="12" cy="8" r="4" />
    <path d="M6 20v-2a6 6 0 0112 0v2" />
  </svg>
);

const SwimmerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
    <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
    <path d="M7 8c0-1.7 1.3-3 3-3s3 1.3 3 3" />
  </svg>
);

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "swimmer" },
  });

  const role = watch("role");

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { role: data.role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }
    setSuccess(true);
  };

  const handleGoogleSignup = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  };

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-success-500/10 border border-success-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
        <p className="text-navy-300 text-sm">
          We&apos;ve sent a confirmation link to your email. Click it to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      {/* Role selector */}
      <div className="mb-6">
        <p className="text-sm font-medium text-navy-100 mb-3">I am a...</p>
        <div className="grid grid-cols-2 gap-3">
          {(["swimmer", "coach"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setValue("role", r)}
              className={cn(
                "flex flex-col items-center gap-2 py-3 px-4 rounded-lg border transition-all duration-150",
                role === r
                  ? "border-signal-400 bg-signal-400/10 text-signal-400"
                  : "border-surface-border bg-surface-card text-navy-300 hover:border-navy-500 hover:text-white"
              )}
            >
              {r === "swimmer" ? <SwimmerIcon /> : <CoachIcon />}
              <span className="text-sm font-medium capitalize">{r}</span>
            </button>
          ))}
        </div>
        {errors.role && <p className="text-xs text-danger-400 mt-1">{errors.role.message}</p>}
      </div>

      <button
        type="button"
        onClick={handleGoogleSignup}
        className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-surface-border bg-surface-card text-sm font-medium text-navy-100 hover:bg-surface-raised hover:text-white transition-colors mb-6"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="relative flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-surface-border" />
        <span className="text-xs text-navy-400">or</span>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          startIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 8 characters"
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

        <Input
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your password"
          startIcon={<Lock className="h-4 w-4" />}
          error={errors.confirm_password?.message}
          {...register("confirm_password")}
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
          className="w-full"
          loading={isSubmitting}
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-signal-400 hover:text-signal-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-navy-500">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
