import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/features/chat/chat-interface";

export const metadata: Metadata = { title: "AI Coach" };

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">AI Coach</h1>
        <p className="text-navy-400 text-sm mt-0.5">
          Personalized coaching advice based on your training data and PBs
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
