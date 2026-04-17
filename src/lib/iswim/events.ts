// ============================================================
// iswim event mapper: Hebrew event labels → canonical SwimEvent
// ============================================================
// Hebrew labels seen on loglig.com player pages:
//   "100 גב"    → 100m backstroke
//   "50 חופשי"  → 50m freestyle
//   "200 חזה"   → 200m breaststroke
//   "50 פרפר"   → 50m butterfly
//   "200 אישי"  → 200m individual medley
// Relay labels (must be skipped for personal bests):
//   "4X50 חופשי שליחים", "50 חופשי שליחים 4X50", etc.

import type { StrokeType, PoolLength } from "@/types";

export interface ParsedEvent {
  event_name: string;     // canonical key, e.g. "100m_backstroke"
  stroke:     StrokeType;
  distance:   number;     // meters
  is_relay:   boolean;
}

const STROKE_KEYWORDS: { keyword: RegExp; stroke: StrokeType }[] = [
  { keyword: /חופשי/, stroke: "freestyle"         },
  { keyword: /גב/,    stroke: "backstroke"        },
  { keyword: /חזה/,   stroke: "breaststroke"      },
  { keyword: /פרפר/,  stroke: "butterfly"         },
  { keyword: /אישי|מעורב|קומבינציה/, stroke: "individual_medley" },
];

export function parseEventLabel(raw: string): ParsedEvent | null {
  const label = raw.trim();
  if (!label) return null;

  const is_relay = /שליחים|4\s*[xX]\s*\d+|relay/i.test(label);

  const stroke = STROKE_KEYWORDS.find(({ keyword }) => keyword.test(label))?.stroke;
  if (!stroke) return null;

  const distMatch = label.match(/(\d{2,4})/);
  if (!distMatch) return null;
  const distance = parseInt(distMatch[1], 10);

  const VALID_DIST: Record<StrokeType, number[]> = {
    freestyle:         [50, 100, 200, 400, 800, 1500],
    backstroke:        [50, 100, 200],
    breaststroke:      [50, 100, 200],
    butterfly:         [50, 100, 200],
    individual_medley: [100, 200, 400],
  };
  if (!VALID_DIST[stroke].includes(distance)) return null;

  const suffix: Record<StrokeType, string> = {
    freestyle:         "freestyle",
    backstroke:        "backstroke",
    breaststroke:      "breaststroke",
    butterfly:         "butterfly",
    individual_medley: "im",
  };

  return {
    event_name: `${distance}m_${suffix[stroke]}`,
    stroke,
    distance,
    is_relay,
  };
}

export function parsePoolLength(raw: string): PoolLength | null {
  const n = parseInt(raw.trim(), 10);
  if (n === 25) return "25m";
  if (n === 50) return "50m";
  return null;
}

/**
 * Parse a time string like "01:53.92" or "53.89" or "1:53.92" → milliseconds.
 * Returns null for "NT" (no time), "DQ" (disqualified) or invalid input.
 */
export function parseTimeToMs(raw: string): { text: string; ms: number } | null {
  const t = raw.trim();
  if (!t || /^(NT|DQ|DNS|DNF|—|-)$/i.test(t)) return null;

  const m = t.match(/^(?:(\d{1,2}):)?(\d{1,2})\.(\d{1,2})$/);
  if (!m) return null;

  const minutes = m[1] ? parseInt(m[1], 10) : 0;
  const seconds = parseInt(m[2], 10);
  const centis  = parseInt(m[3].padEnd(2, "0").slice(0, 2), 10);
  const ms      = (minutes * 60 + seconds) * 1000 + centis * 10;

  const text = minutes > 0
    ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`
    : `${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;

  return { text, ms };
}

/**
 * Parse "DD/MM/YYYY" → ISO "YYYY-MM-DD".
 */
export function parseDateDMY(raw: string): string | null {
  const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}
