import type { Metadata } from "next";

export const metadata: Metadata = { title: "Log Training Session" };

export default function NewTrainingPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Log Training Session</h1>
      <p className="text-navy-400 text-sm">Training wizard coming in Phase 2.</p>
    </div>
  );
}
