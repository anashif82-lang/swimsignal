"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role:    "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "איך אני יכול לשפר את זמן ה-100 מטר חופשי שלי?",
  "על מה כדאי לי להתמקד השבוע?",
  "נתח את עומס האימון האחרון שלי",
  "תן לי אימון יבשה להיום",
  "איך אני עובד על טכניקת הפנייה שלי?",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    setError(null);

    const userMsg: Message = { role: "user", content: text.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setStreaming(true);

    // Add empty assistant message that we'll fill in
    const assistantIdx = history.length;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;

          try {
            const json = JSON.parse(payload);
            if (json.error) throw new Error(json.error);
            if (json.text) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[assistantIdx] = {
                  role:    "assistant",
                  content: updated[assistantIdx].content + json.text,
                };
                return updated;
              });
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((_, i) => i !== assistantIdx));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
            <div className="w-14 h-14 rounded-xl bg-signal-400/10 border border-signal-400/20 flex items-center justify-center">
              <Waves className="h-7 w-7 text-signal-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">מאמן AI</h2>
              <p className="text-sm text-navy-400 mt-1 max-w-xs">
                שאל אותי כל דבר על האימונים, הטכניקה או הביצועים שלך. יש לי גישה לאימונים ולשיאים האישיים שלך.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-surface-border text-navy-300 hover:text-white hover:border-signal-400/40 hover:bg-signal-400/5 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              msg.role === "user"
                ? "bg-signal-400/10 border border-signal-400/30"
                : "bg-navy-800 border border-surface-border"
            )}>
              {msg.role === "user"
                ? <User className="h-4 w-4 text-signal-400" />
                : <Bot  className="h-4 w-4 text-navy-300" />
              }
            </div>

            {/* Bubble */}
            <div className={cn(
              "max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-signal-400/10 border border-signal-400/20 text-white"
                : "bg-navy-900 border border-surface-border text-navy-100"
            )}>
              {msg.content
                ? msg.content.split("\n").map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < msg.content.split("\n").length - 1 && <br />}
                    </span>
                  ))
                : streaming && i === messages.length - 1
                  ? <span className="inline-block w-2 h-4 bg-navy-400 animate-pulse rounded-sm" />
                  : null
              }
            </div>
          </div>
        ))}

        {error && (
          <div className="text-sm text-danger-400 text-center py-2">{error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-surface-border pt-4">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="שאל את מאמן ה-AI שלך…"
            rows={1}
            disabled={streaming}
            className="flex-1 input-dark resize-none py-2.5 min-h-[42px] max-h-32 overflow-y-auto leading-relaxed"
            style={{ height: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className={cn(
              "h-[42px] w-[42px] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
              input.trim() && !streaming
                ? "bg-signal-400 hover:bg-signal-300 text-navy-950"
                : "bg-navy-800 text-navy-600 cursor-not-allowed"
            )}
          >
            {streaming
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </button>
        </div>
        <p className="text-xs text-navy-600 mt-2">Enter לשליחה · Shift+Enter לשורה חדשה</p>
      </div>
    </div>
  );
}
