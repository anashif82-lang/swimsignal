"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SwimmerResult {
  id:         string;
  full_name:  string | null;
  avatar_url: string | null;
  club_name:  string | null;
}

export function InviteSwimmer() {
  const router = useRouter();
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SwimmerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [invited, setInvited]   = useState<Set<string>>(new Set());
  const [error, setError]       = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/swimmers/search?q=${encodeURIComponent(value)}`);
      const json = await res.json();
      setResults(json.results ?? []);
      setLoading(false);
    }, 350);
  }

  async function handleInvite(swimmerId: string) {
    setInviting(swimmerId);
    setError(null);
    const res = await fetch("/api/coach/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ swimmer_id: swimmerId }),
    });
    setInviting(null);
    if (res.ok) {
      setInvited((prev) => new Set(prev).add(swimmerId));
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to send invite.");
    }
  }

  return (
    <div className="card-surface rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-wide">Invite a Swimmer</h2>

      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name..."
          className="input-dark ps-9 w-full"
        />
        {loading && (
          <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-500 animate-spin" />
        )}
      </div>

      {error && <p className="text-xs text-danger-400">{error}</p>}

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((swimmer) => (
            <li
              key={swimmer.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-navy-900/60 border border-surface-border"
            >
              <div className="w-9 h-9 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-navy-200">
                {swimmer.avatar_url
                  ? <img src={swimmer.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                  : getInitials(swimmer.full_name)
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{swimmer.full_name ?? "Unknown"}</p>
                {swimmer.club_name && (
                  <p className="text-xs text-navy-400">{swimmer.club_name}</p>
                )}
              </div>
              <Button
                size="sm"
                variant={invited.has(swimmer.id) ? "ghost" : "outline"}
                disabled={invited.has(swimmer.id) || inviting === swimmer.id}
                onClick={() => handleInvite(swimmer.id)}
                className="gap-1.5 shrink-0"
              >
                {inviting === swimmer.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : invited.has(swimmer.id)
                    ? "Invited ✓"
                    : <><UserPlus className="h-3.5 w-3.5" />Invite</>
                }
              </Button>
            </li>
          ))}
        </ul>
      )}

      {query.trim().length >= 2 && results.length === 0 && !loading && (
        <p className="text-sm text-navy-500">No swimmers found for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  );
}
