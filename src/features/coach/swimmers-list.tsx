import Link from "next/link";
import { ArrowRight, Waves, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getInitials, ageFromBirthYear, formatDate } from "@/lib/utils";
import type { CoachSwimmerConnection } from "@/types";

interface SwimmersListProps {
  connections: CoachSwimmerConnection[];
}

export function SwimmersList({ connections }: SwimmersListProps) {
  if (connections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-navy-800 border border-surface-border flex items-center justify-center mx-auto mb-3">
          <Waves className="h-6 w-6 text-navy-500" />
        </div>
        <p className="text-navy-400 text-sm">No swimmers yet</p>
        <p className="text-navy-500 text-xs mt-1">
          Swimmers will appear here once they request to connect with you
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {connections.map((conn) => {
        const swimmer = conn.swimmer;
        const sp = (conn as any).swimmer?.swimmer_profiles?.[0];
        const age = sp?.birth_year ? ageFromBirthYear(sp.birth_year) : null;

        return (
          <Link
            key={conn.id}
            href={`/coach/swimmers/${swimmer?.id}`}
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface-raised border border-transparent hover:border-surface-border transition-all group"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center shrink-0">
              {swimmer?.avatar_url ? (
                <img src={swimmer.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-navy-200">
                  {getInitials(swimmer?.full_name)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                {swimmer?.full_name ?? "Unknown"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {age && <span className="text-xs text-navy-400">Age {age}</span>}
                {sp?.club_name_raw && (
                  <span className="text-xs text-navy-400">{sp.club_name_raw}</span>
                )}
              </div>
            </div>

            {/* Events */}
            {sp?.main_events && sp.main_events.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                {sp.main_events.slice(0, 2).map((e: string) => (
                  <span
                    key={e}
                    className="text-[10px] bg-navy-800 text-navy-300 px-2 py-1 rounded font-mono"
                  >
                    {e.replace(/_/g, " ")}
                  </span>
                ))}
                {sp.main_events.length > 2 && (
                  <span className="text-[10px] text-navy-500">
                    +{sp.main_events.length - 2}
                  </span>
                )}
              </div>
            )}

            <ArrowRight className="h-4 w-4 text-navy-600 group-hover:text-navy-400 transition-colors shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
