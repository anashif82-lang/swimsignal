import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-navy-300 text-sm mt-1">Sign in to your SwimSignal account</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
