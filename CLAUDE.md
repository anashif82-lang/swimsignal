# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (Next.js 16)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit (no test suite exists)
```

## Stack

- **Next.js 16.2.2** with App Router + React 19 — check `node_modules/next/dist/docs/` before using any APIs
- **Tailwind CSS v4** — configured via `@theme` in `src/app/globals.css`, **no `tailwind.config.js`**. Adding `--spacing-*` tokens overrides `max-w-*` / `w-*` utilities globally — avoid named spacing tokens.
- **Supabase** — browser client at `src/lib/supabase/client.ts`, server client at `src/lib/supabase/server.ts` (async, cookie-aware)
- **Zod v4** for validation — swim times use `MM:SS.cc` format stored as text + milliseconds

## Architecture

The app serves two roles: **swimmers** (`/dashboard`) and **coaches** (`/coach`). Middleware at `src/middleware.ts` enforces auth, onboarding, and role-based route guards.

**Data layer** lives entirely in `src/lib/db/` (server-only). Never query Supabase directly from components — use these functions. Key files:
- `profiles.ts` — user profiles, coach-swimmer connections, search (uses RPC `search_coaches`)
- `training.ts` — sessions + sets + tags, streak calculation
- `competitions.ts` — competitions + results, auto-upserts `personal_bests` on official PBs
- `notifications.ts`, `analytics.ts`, `schedule.ts`

**API routes** at `src/app/api/` follow: validate with Zod → auth check via `supabase.auth.getUser()` → call `lib/db/` → return `NextResponse.json()`.

**Component structure:**
- `src/components/ui/` — Radix UI primitives + custom (`time-wheel-picker.tsx` for MM:SS.cc input)
- `src/components/layout/` — Mobile header, bottom nav (swimmer + coach), desktop sidebar
- `src/features/` — Feature-scoped components, e.g. `features/dashboard/`, `features/training/`

## RTL / Hebrew

Root layout sets `<html lang="he" dir="rtl">`. Use logical CSS properties (`margin-inline`, `start`/`end`) instead of `left`/`right`. The `.flip-rtl` class mirrors icons that need horizontal flipping.

## Design System

Defined in `src/app/globals.css` under `@theme`. Key token groups:
- `--color-navy-*` — dark navy brand palette (legacy dark theme)
- `--color-signal-*` — cyan accent
- `--color-bg-primary/secondary`, `--color-card`, `--color-text-*`, `--color-water-*` — Apple Light UI tokens
- `--shadow-card/elevated/hero`, `--radius-card/large/pill`

Gradient utilities: `.bg-gradient-water`, `.bg-gradient-card`

**Important:** avoid `style={{ color: '...' }}` inline — prefer `@theme` tokens and Tailwind classes. When Tailwind purges a class unexpectedly, `style={}` is the escape hatch.

Dashboard background uses animated radial gradients (`.animate-sky-breathe`, `.animate-water-drift`) defined as separate `fixed inset-0` divs with `z-0`; content wraps in `<div className="relative z-10">`.

## Key Types

All in `src/types/index.ts`. Notable:
- `PoolLength` — `"25m" | "50m"`
- `StrokeType` — freestyle/backstroke/breaststroke/butterfly/individual_medley
- `TrainingSession` includes optional `sets: TrainingSet[]` and `tags: Tag[]`
- `SWIM_EVENTS[]` — catalog of 25 events with Hebrew labels

## AI Integration

`/api/chat` uses `@anthropic-ai/sdk` for the AI coach feature. Service layer at `src/services/ai/coach.ts`.
