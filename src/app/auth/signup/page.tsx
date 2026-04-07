import type { Metadata } from "next";
import { SignupForm } from "@/features/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignupPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-navy-300 text-sm mt-1">Start tracking your performance today</p>
      </div>
      <SignupForm />
    </>
  );
}
