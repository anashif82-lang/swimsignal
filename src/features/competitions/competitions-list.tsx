"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Calendar, MapPin, ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";
import type { Competition, CompetitionLevel } from "@/types";
import { formatDate, formatSwimTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LEVEL_BADGE: Record<CompetitionLevel, string> = {
  local:         "badge-muted",
  regional:      "badge-navy",
  national:      "badge-signal",
  international: "badge-warning",
};

const LEVEL_LABEL: Record<CompetitionLevel, string> = {
  local:         "Local",
  regional:      "Regional",
  national:      "National",
  international: "International",
};

const STROKE_SHORT: Record<string, string> = {
  freestyle:         "FR",
  backstroke:        "BK",
  breaststroke:      "BR",
  butterfly:         "FLY",
  individual_medley: "IM",
};

interface Props {
  competitions: Competition[];
  onAdd: () => void;
}

export function CompetitionsList({ competitions, onAdd }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleDelete(id: string) {
    if (!confirm("Delete this competition and all its results?")) return;
    setDeleting(id);
    const res = await fetch(`/api/competitions/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      startTransition(() => router.refresh());
    } else {
      alert("Failed to delete competition.");
    }
  }

  if (competitions.length === 0) {
    return (
      <div className="card-surface rounded-xl p-12 text-center">
        <Trophy className="h-10 w-10 text-navy-600 mx-auto mb-3" />
        <p className="text-navy-300 font-medium">No competitions logged</p>
        <p className="text-navy-500 text-sm mt-1">Record your first competition result to start tracking.</p>
        <button onClick={onAdd} className="mt-4 inline-block">
          <Button variant="signal" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Log Competition
          </Button>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {competitions.map((comp) => {
        const isOpen = expanded === comp.id;
        const results = comp.results ?? [];

        return (
          <div key={comp.id} className="card-surface rounded-xl overflow-hidden">
            {/* Header row */}
            <div
              className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-navy-900/40 transition-colors group"
              onClick={() => setExpanded(isOpen ? null : comp.id)}
            >
              {/* Trophy icon */}
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-navy-900 border border-surface-border flex items-center justify-center">
                <Trophy className="h-4 w-4 text-warning-400" />
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm truncate">{comp.name}</span>
                  {comp.level && (
                    <Badge variant={LEVEL_BADGE[comp.level] as "muted" | "navy" | "signal" | "warning"}>
                      {LEVEL_LABEL[comp.level]}
                    </Badge>
                  )}
                  <Badge variant="navy">{comp.pool_length}</Badge>
                  {results.some((r) => r.is_personal_best) && (
                    <Badge variant="success">PB</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-navy-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(comp.competition_date)}
                  </span>
                  {comp.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {comp.location}
                    </span>
                  )}
                  <span>{results.length} {results.length === 1 ? "event" : "events"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-danger-400 hover:text-danger-300 hover:bg-danger-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); handleDelete(comp.id); }}
                  disabled={deleting === comp.id}
                  title="Delete competition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                {isOpen
                  ? <ChevronUp className="h-4 w-4 text-navy-400" />
                  : <ChevronDown className="h-4 w-4 text-navy-400" />}
              </div>
            </div>

            {/* Results */}
            {isOpen && results.length > 0 && (
              <div className="border-t border-surface-border divide-y divide-surface-border">
                {/* Table header */}
                <div className="px-5 py-2 grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs text-navy-500 font-medium uppercase tracking-wide">
                  <span>Event</span>
                  <span className="text-center">Time</span>
                  <span className="text-center">Place</span>
                  <span className="text-center">PB</span>
                </div>
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="px-5 py-3 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center"
                  >
                    <div>
                      <span className="text-sm text-white font-medium">{result.event_name}</span>
                      {result.stroke && (
                        <span className="ms-2 text-xs text-navy-500">{STROKE_SHORT[result.stroke] ?? result.stroke}</span>
                      )}
                    </div>
                    <span className="font-mono text-sm text-signal-300 text-center">
                      {result.final_time}
                    </span>
                    <span className="text-sm text-navy-400 text-center">
                      {result.place != null ? `#${result.place}` : "–"}
                    </span>
                    <div className="flex justify-center">
                      {result.is_personal_best ? (
                        <Badge variant="success">PB</Badge>
                      ) : (
                        <span className="text-navy-600 text-xs">–</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isOpen && results.length === 0 && (
              <div className="border-t border-surface-border px-5 py-4">
                <p className="text-sm text-navy-500">No results logged for this competition.</p>
              </div>
            )}

            {isOpen && comp.notes && (
              <div className="border-t border-surface-border px-5 py-3">
                <p className="text-xs text-navy-400 leading-relaxed">{comp.notes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
