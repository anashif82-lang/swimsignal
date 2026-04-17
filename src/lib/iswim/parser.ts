// ============================================================
// iswim player page parser
// ============================================================
// Fetches https://loglig.com:2053/Players/Details/{id}?tab=seasonalbests
// and extracts the "שיאים אישיים" (personal bests) table.
//
// The table columns (RTL) are:
//   מקצוע | אורך הבריכה | תוצאה | תאריך | שם תחרות
// e.g. "100 גב | 50 | 01:53.92 | 20/07/2025 | אליפות ישראל ארנה..."

import * as cheerio from "cheerio";
import type { StrokeType, PoolLength } from "@/types";
import {
  parseEventLabel,
  parsePoolLength,
  parseTimeToMs,
  parseDateDMY,
} from "./events";

export interface ParsedPersonalBest {
  event_name:       string;
  stroke:           StrokeType;
  distance:         number;
  pool_length:      PoolLength;
  time_text:        string;
  time_ms:          number;
  achieved_at:      string;           // ISO date
  competition_name: string | null;
}

export interface ParsedPlayerPage {
  full_name:   string | null;
  birth_year:  number | null;
  club:        string | null;
  personal_bests: ParsedPersonalBest[];
}

const ISWIM_PLAYER_URL = "https://loglig.com:2053/Players/Details";

// Keep headers minimal: ASP.NET MVC apps sometimes 500 when they see the
// modern Sec-Fetch-* family (e.g. Kestrel treats them as malformed headers
// in certain versions). We send just what 2015-era browsers would send.
const BASE_HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate",
  "Connection":      "keep-alive",
};

function parseSetCookie(res: Response): string {
  // Response.headers.getSetCookie() is standard in Node 20+. Fall back to
  // the raw Set-Cookie header when the API isn't available.
  type WithGetSetCookie = { getSetCookie?: () => string[] };
  const list =
    (res.headers as unknown as WithGetSetCookie).getSetCookie?.() ??
    (res.headers.get("set-cookie")?.split(/,(?=[^;]+=)/) ?? []);
  return list
    .map((c) => c.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

async function fetchUrl(url: string, opts: { referer?: string; cookie?: string }): Promise<Response> {
  const headers: Record<string, string> = { ...BASE_HEADERS };
  if (opts.referer) headers["Referer"] = opts.referer;
  if (opts.cookie)  headers["Cookie"]  = opts.cookie;

  return fetch(url, { headers, cache: "no-store", redirect: "follow" });
}

interface WarmupState {
  cookie:       string;
  diagnostics:  string;
}

async function warmup(): Promise<WarmupState> {
  // Player pages are normally loaded inside an iframe embedded on
  // isr.org.il, so loglig expects a Referer from that parent. We hit a
  // LeagueTable endpoint directly (same pattern as the iframe) to get
  // session cookies issued.
  const url = "https://loglig.com:2053/LeagueTable/AthleticsDisciplines/13507";
  try {
    const res = await fetchUrl(url, { referer: "https://isr.org.il/" });
    const cookie = parseSetCookie(res);
    return {
      cookie,
      diagnostics: `warmup ${url} → ${res.status} ${res.statusText}, cookies=${cookie ? cookie.split(";").length : 0}`,
    };
  } catch (e) {
    return {
      cookie:      "",
      diagnostics: `warmup ${url} → exception: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }
}

export async function fetchPlayerPage(
  playerId: number,
  options?: { rawUrl?: string | null },
): Promise<string> {
  // Step 1: warm up and collect session cookies. Without this, the player
  // details endpoint 500s on ASP.NET's session lookup.
  const { cookie, diagnostics } = await warmup();

  // Step 2: try candidate URLs with the iframe-parent Referer (isr.org.il).
  // loglig pages are normally loaded inside <iframe src="..."> embedded on
  // isr.org.il, and the app appears to require that context.
  const candidates = [
    `${ISWIM_PLAYER_URL}/${playerId}?tab=seasonalbests`,
    `${ISWIM_PLAYER_URL}/${playerId}`,
    options?.rawUrl,
  ].filter((u): u is string => Boolean(u));

  const attempts: string[] = [];
  for (const url of candidates) {
    try {
      const res = await fetchUrl(url, {
        referer: "https://isr.org.il/",
        cookie,
      });
      if (res.ok) {
        const html = await res.text();
        if (html.length > 500 && (html.includes("Players/Details") || /שיאים|Personal|season/i.test(html))) {
          return html;
        }
        attempts.push(`${url} → 200 body=${html.length}B (not a player page)`);
        continue;
      }
      const server   = res.headers.get("server") ?? "?";
      const cfRay    = res.headers.get("cf-ray") ?? "";
      const cfCache  = res.headers.get("cf-cache-status") ?? "";
      const via      = [server, cfRay && `ray:${cfRay}`, cfCache && `cache:${cfCache}`].filter(Boolean).join(" ");
      attempts.push(`${url} → ${res.status} ${res.statusText} [${via}]`);
    } catch (e) {
      const cause = e instanceof Error ? (e.cause as { code?: string } | undefined)?.code ?? e.message : "fetch exception";
      attempts.push(`${url} → ${cause}`);
    }
  }

  throw new Error(`iswim fetch failed — ${diagnostics} | ${attempts.join(" | ")}`);
}

export function parsePlayerPage(html: string): ParsedPlayerPage {
  const $ = cheerio.load(html);

  // ─── Header: name, birth year, club ──────────────────────────
  const full_name  = firstNonEmpty($, ["h1", "h2", ".player-name"]);
  const birth_year = parseBirthYear($);
  const club       = parseClub($);

  // ─── Personal bests table ────────────────────────────────────
  const pbs: ParsedPersonalBest[] = [];
  const pbTable = findPersonalBestsTable($);
  if (pbTable) {
    const cols = mapColumns($, pbTable);
    pbTable.find("tbody tr, tr").each((_, tr) => {
      const $tr = $(tr);
      const cells = $tr.find("td").toArray().map((td) => $(td).text().trim());
      if (cells.length < 5) return;

      const eventRaw       = cells[cols.event]!;
      const poolRaw        = cells[cols.pool]!;
      const timeRaw        = cells[cols.time]!;
      const dateRaw        = cells[cols.date]!;
      const competitionRaw = cells[cols.competition]!;

      const event       = parseEventLabel(eventRaw);
      if (!event || event.is_relay) return;

      const pool_length = parsePoolLength(poolRaw);
      if (!pool_length) return;

      const time        = parseTimeToMs(timeRaw);
      if (!time) return;

      const achieved_at = parseDateDMY(dateRaw);
      if (!achieved_at) return;

      pbs.push({
        event_name:       event.event_name,
        stroke:           event.stroke,
        distance:         event.distance,
        pool_length,
        time_text:        time.text,
        time_ms:          time.ms,
        achieved_at,
        competition_name: competitionRaw || null,
      });
    });
  }

  return { full_name, birth_year, club, personal_bests: dedupeBest(pbs) };
}

// ─── Helpers ───────────────────────────────────────────────────

function firstNonEmpty($: cheerio.CheerioAPI, selectors: string[]): string | null {
  for (const s of selectors) {
    const t = $(s).first().text().trim();
    if (t) return t;
  }
  return null;
}

function parseBirthYear($: cheerio.CheerioAPI): number | null {
  // Look for "שנת לידה:" followed by a 4-digit year anywhere on the page.
  const body = $("body").text();
  const m = body.match(/שנת\s*לידה\s*:?[\s\u200e]*?(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

function parseClub($: cheerio.CheerioAPI): string | null {
  const body = $("body").text();
  const m = body.match(/אגודה\s*:?\s*([^\n\r]+?)(?:\s{2,}|$|מאמן)/);
  return m ? m[1].trim() : null;
}

interface ColumnMap {
  event:       number;
  pool:        number;
  time:        number;
  date:        number;
  competition: number;
}

function findPersonalBestsTable($: cheerio.CheerioAPI): cheerio.Cheerio<never> | null {
  let found: cheerio.Cheerio<never> | null = null;
  $("table").each((_, table) => {
    const headers = $(table).find("thead th, th").toArray().map((th) => $(th).text().trim());
    const joined  = headers.join(" | ");
    if (/מקצוע/.test(joined) && /תוצאה/.test(joined) && /תאריך/.test(joined)) {
      found = $(table) as unknown as cheerio.Cheerio<never>;
      return false;
    }
  });
  return found;
}

function mapColumns($: cheerio.CheerioAPI, table: cheerio.Cheerio<never>): ColumnMap {
  const headers = (table as unknown as cheerio.Cheerio<never>).find("thead th, th").toArray()
    .map((th: unknown) => ($(th as never).text() as string).trim());

  const indexOf = (re: RegExp) => headers.findIndex((h) => re.test(h));

  return {
    event:       Math.max(indexOf(/מקצוע/), 0),
    pool:        Math.max(indexOf(/בריכה/), 1),
    time:        Math.max(indexOf(/תוצאה/), 2),
    date:        Math.max(indexOf(/תאריך/), 3),
    competition: Math.max(indexOf(/תחרות/), 4),
  };
}

/**
 * Keep only the fastest PB per (event_name, pool_length).
 * iswim sometimes shows multiple rows for the same event (e.g., same swim
 * from multiple seasons). We pick the row with the lowest time_ms.
 */
function dedupeBest(rows: ParsedPersonalBest[]): ParsedPersonalBest[] {
  const bestByKey = new Map<string, ParsedPersonalBest>();
  for (const r of rows) {
    const key = `${r.event_name}::${r.pool_length}`;
    const existing = bestByKey.get(key);
    if (!existing || r.time_ms < existing.time_ms) {
      bestByKey.set(key, r);
    }
  }
  return Array.from(bestByKey.values());
}
