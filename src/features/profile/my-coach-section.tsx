"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, UserCheck, UserX, UserPlus } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CoachInfo {
  connectionId: string;
  coachId:      string;
  name:         string | null;
  avatar:       string | null;
  club:         string | null;
  status:       string;
}

interface CoachResult {
  id:         string;
  full_name:  string | null;
  avatar_url: string | null;
  club_name:  string | null;
}

interface Props {
  coach: CoachInfo | null;
}

export function MyCoachSection({ coach: initialCoach }: Props) {
  const router = useRouter();
  const [coach, setCoach]       = useState(initialCoach);
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<CoachResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [error, setError]         = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res  = await fetch(`/api/coaches/search?q=${encodeURIComponent(value)}`);
      const json = await res.json();
      setResults(json.results ?? []);
      setSearching(false);
    }, 350);
  }

  async function requestCoach(coachId: string) {
    setRequesting(coachId);
    setError(null);
    const res = await fetch("/api/swimmer/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coach_id: coachId }),
    });
    setRequesting(null);
    if (res.ok) {
      setRequested((prev) => new Set(prev).add(coachId));
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "שליחת הבקשה נכשלה.");
    }
  }

  async function disconnect() {
    if (!coach) return;
    if (!confirm("להסיר את החיבור למאמן?")) return;
    setDisconnecting(true);
    const res = await fetch(`/api/swimmer/coach?id=${coach.connectionId}`, { method: "DELETE" });
    setDisconnecting(false);
    if (res.ok) {
      setCoach(null);
      router.refresh();
    }
  }

  return (
    <div className="card-surface rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">המאמן שלי</h2>

      {/* Current coach */}
      {coach ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-navy-900/60 border border-surface-border">
          <div className="w-10 h-10 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-navy-200">
            {coach.avatar
              ? <img src={coach.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              : getInitials(coach.name)
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">{coach.name ?? "מאמן"}</p>
              {coach.status === "approved"
                ? <span className="flex items-center gap-1 text-xs text-success-400"><UserCheck className="h-3 w-3" />מחובר</span>
                : <span className="flex items-center gap-1 text-xs text-warning-400"><Loader2 className="h-3 w-3" />ממתין לאישור</span>
              }
            </div>
            {coach.club && <p className="text-xs text-navy-400">{coach.club}</p>}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-navy-500 hover:text-danger-400 gap-1.5 shrink-0"
            disabled={disconnecting}
            onClick={disconnect}
          >
            <UserX className="h-4 w-4" />
            הסר
          </Button>
        </div>
      ) : (
        <p className="text-sm text-navy-500">אין מאמן מחובר</p>
      )}

      {/* Search for a coach */}
      {!coach && (
        <>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="חפש מאמן לפי שם..."
              className="input-dark ps-9 w-full"
            />
            {searching && (
              <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-500 animate-spin" />
            )}
          </div>

          {error && <p className="text-xs text-danger-400">{error}</p>}

          {results.length > 0 && (
            <ul className="space-y-2">
              {results.map((c) => (
                <li key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-navy-900/60 border border-surface-border">
                  <div className="w-9 h-9 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-navy-200">
                    {c.avatar_url
                      ? <img src={c.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                      : getInitials(c.full_name)
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{c.full_name ?? "מאמן"}</p>
                    {c.club_name && <p className="text-xs text-navy-400">{c.club_name}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant={requested.has(c.id) ? "ghost" : "outline"}
                    disabled={requested.has(c.id) || requesting === c.id}
                    onClick={() => requestCoach(c.id)}
                    className="gap-1.5 shrink-0"
                  >
                    {requesting === c.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : requested.has(c.id)
                        ? "בקשה נשלחה ✓"
                        : <><UserPlus className="h-3.5 w-3.5" />התחבר</>
                    }
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {query.trim().length >= 2 && results.length === 0 && !searching && (
            <p className="text-sm text-navy-500">לא נמצאו מאמנים עבור &ldquo;{query}&rdquo;</p>
          )}
        </>
      )}
    </div>
  );
}
