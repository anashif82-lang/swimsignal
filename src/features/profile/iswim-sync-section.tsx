"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, RefreshCw, Check, AlertCircle, ExternalLink, Code } from "lucide-react";

interface Props {
  currentPlayerId: number | null;
  lastSyncAt:      string | null;
}

interface SyncResponse {
  ok?:           boolean;
  error?:        string;
  parsed_count?: number;
  inserted?:     number;
  full_name?:    string | null;
  last_sync_at?: string;
}

function extractPlayerId(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Full URL: https://loglig.com:2053/Players/Details/121634?...
  const urlMatch = trimmed.match(/\/Players\/Details\/(\d+)/i);
  if (urlMatch) return parseInt(urlMatch[1], 10);

  // Plain numeric id
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);

  return null;
}

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function IswimSyncSection({ currentPlayerId, lastSyncAt }: Props) {
  const router = useRouter();
  const [input,      setInput]      = useState("");
  const [html,       setHtml]       = useState("");
  const [showHtml,   setShowHtml]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState<SyncResponse | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  async function handleSync() {
    setError(null);
    setResult(null);

    const playerId = extractPlayerId(input) ?? currentPlayerId;
    if (!playerId) {
      setError("הדבק URL של הדף שלך באיגוד השחייה או מזהה השחיין");
      return;
    }

    setLoading(true);
    try {
      const rawUrl = /^https?:\/\//i.test(input.trim()) ? input.trim() : null;
      const res  = await fetch("/api/sync/iswim/player", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ iswim_player_id: playerId, iswim_url: rawUrl }),
      });
      const json: SyncResponse = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "שגיאה בסנכרון");
        setShowHtml(true); // automatically reveal the HTML paste fallback
        return;
      }
      setResult(json);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
      setShowHtml(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncHtml() {
    setError(null);
    setResult(null);

    if (html.trim().length < 200) {
      setError("הדבק את ה-HTML המלא של הדף שלך (בדרך כלל יותר מ-1000 תווים)");
      return;
    }

    const playerId = extractPlayerId(input) ?? currentPlayerId;
    if (!playerId && !/\/Players\/Details\/\d+/.test(html)) {
      setError("לא הצלחתי לזהות מזהה שחיין. הדבק את ה-URL בשדה למעלה או את ה-HTML המלא.");
      return;
    }

    setLoading(true);
    try {
      const rawUrl = /^https?:\/\//i.test(input.trim()) ? input.trim() : null;
      const res  = await fetch("/api/sync/iswim/html", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ iswim_player_id: playerId, iswim_url: rawUrl, html }),
      });
      const json: SyncResponse = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "שגיאה בעיבוד ה-HTML");
        return;
      }
      setResult(json);
      setHtml("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  }

  const lastSyncLabel = fmtDate(lastSyncAt);

  return (
    <div className="mat-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(0,122,255,0.10)" }}
        >
          <Link2 className="h-4 w-4" style={{ color: "#007AFF" }} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold" style={{ color: "#0F172A" }}>
            סנכרון עם איגוד השחייה
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#667085" }}>
            שלוף אוטומטית את כל השיאים האישיים שלך מ-loglig
          </p>
        </div>
      </div>

      {/* Current status */}
      {currentPlayerId && (
        <div className="mat-cell px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide" style={{ color: "#94A3B8" }}>מחובר</p>
            <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>
              מזהה {currentPlayerId}
            </p>
            {lastSyncLabel && (
              <p className="text-[10px] mt-0.5" style={{ color: "#94A3B8" }}>
                סונכרן לאחרונה: {lastSyncLabel}
              </p>
            )}
          </div>
          <a
            href={`https://loglig.com:2053/Players/Details/${currentPlayerId}?tab=seasonalbests`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold transition-all active:opacity-60"
            style={{ color: "#007AFF" }}
          >
            פתח באתר
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide block" style={{ color: "#94A3B8" }}>
          {currentPlayerId ? "שנה חיבור (אופציונלי)" : "הדבק URL או מזהה שחיין"}
        </label>
        <input
          type="text"
          placeholder="https://loglig.com:2053/Players/Details/121634..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-[120ms]"
          style={{
            background: "#F6F9FC",
            border: "1px solid rgba(226,232,240,0.80)",
            color: "#0F172A",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#007AFF"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,122,255,0.10)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(226,232,240,0.80)"; e.currentTarget.style.boxShadow = "none"; }}
        />
        <p className="text-[11px] leading-snug" style={{ color: "#94A3B8" }}>
          איך מוצאים? באתר איגוד השחייה → תחרויות → בחר מקצה → &quot;נרשמים&quot; → לחץ על השם שלך → העתק את ה-URL
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <div
          className="flex items-start gap-2 rounded-xl px-4 py-3 text-xs"
          style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid rgba(239,68,68,0.20)" }}
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {result?.ok && (
        <div
          className="flex items-start gap-2 rounded-xl px-4 py-3 text-xs"
          style={{ background: "rgba(52,199,89,0.08)", color: "#34C759", border: "1px solid rgba(52,199,89,0.20)" }}
        >
          <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            סונכרן בהצלחה{result.full_name ? ` — ${result.full_name}` : ""}. נטענו {result.inserted ?? 0} שיאים.
          </span>
        </div>
      )}

      {/* Actions */}
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-[120ms] active:scale-[0.97] disabled:opacity-60"
        style={{ background: "#007AFF", boxShadow: "0 2px 12px rgba(0,122,255,0.30)" }}
      >
        <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        {loading ? "מסנכרן…" : currentPlayerId ? "סנכרן מחדש" : "חבר וסנכרן"}
      </button>

      {/* HTML paste fallback */}
      <button
        type="button"
        onClick={() => setShowHtml((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium transition-all active:opacity-60"
        style={{ color: "#007AFF" }}
      >
        <Code className="h-3 w-3" />
        {showHtml ? "הסתר חלופה ידנית" : "לא עובד? נסה להדביק HTML ידנית"}
      </button>

      {showHtml && (
        <div className="space-y-2 rounded-xl p-3" style={{ background: "rgba(88,86,214,0.05)", border: "1px dashed rgba(88,86,214,0.25)" }}>
          <p className="text-[11px] leading-snug" style={{ color: "#5856D6" }}>
            <strong>חלופה למקרה של כשל סנכרון:</strong>
            <br />
            1. פתח את הדף שלך באיגוד השחייה בטאב חדש
            <br />
            2. לחץ <code className="font-mono" style={{ background: "rgba(88,86,214,0.10)", padding: "0 4px", borderRadius: 3 }}>Cmd+Option+U</code> (מק) או <code className="font-mono" style={{ background: "rgba(88,86,214,0.10)", padding: "0 4px", borderRadius: 3 }}>Ctrl+U</code> (PC) לראיית המקור
            <br />
            3. <code className="font-mono" style={{ background: "rgba(88,86,214,0.10)", padding: "0 4px", borderRadius: 3 }}>Cmd+A → Cmd+C</code> והדבק למטה
          </p>

          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={4}
            placeholder="הדבק כאן את ה-HTML המלא של הדף שלך..."
            className="w-full rounded-lg px-3 py-2 text-xs font-mono outline-none resize-y"
            style={{
              background: "#fff",
              border: "1px solid rgba(226,232,240,0.80)",
              color: "#0F172A",
              minHeight: 80,
            }}
          />

          <button
            type="button"
            onClick={handleSyncHtml}
            disabled={loading || html.length < 200}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ background: "#5856D6", boxShadow: "0 2px 8px rgba(88,86,214,0.30)" }}
          >
            <Code className="h-3.5 w-3.5" />
            {loading ? "מעבד…" : "עבד HTML וסנכרן"}
          </button>
        </div>
      )}
    </div>
  );
}
