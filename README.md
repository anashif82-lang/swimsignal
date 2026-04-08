# SwimSignal

Premium performance platform for competitive swimmers and coaches. Track training, analyze results, identify trends, and reach the next level.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.2 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 (CSS-first config) |
| Auth & DB | Supabase (Auth + PostgreSQL + RLS) |
| Forms | React Hook Form + Zod v4 |
| UI Primitives | Radix UI |
| Icons | Lucide React |
| Deployment | Vercel |

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# fill in .env.local with your Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | App URL, no trailing slash |

## Database Setup

1. Create a project at [supabase.com](https://supabase.com)
2. In SQL Editor, run `supabase/migrations/001_swimsignal_schema.sql`
3. In Authentication → URL Configuration, set:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
4. Optionally enable Google OAuth in Authentication → Providers

## Project Structure

```
src/
  app/                          Next.js App Router pages + API routes
    page.tsx                    Landing page
    layout.tsx                  Root layout (RTL, Inter font, metadata)
    globals.css                 Tailwind v4 design system
    auth/                       Login, signup, forgot-password, callback
    onboarding/                 Swimmer + coach onboarding wizards
    dashboard/                  Swimmer dashboard + sub-pages
      page.tsx                  Main dashboard (stats, sessions, PBs)
      layout.tsx                Sidebar layout
      training/                 Training log (list, new, detail, edit)
      competitions/             Competitions + Personal Bests
      analytics/                Analytics (Phase 3)
      calendar/                 Calendar (Phase 3)
      profile/                  Profile settings
    coach/                      Coach dashboard + sub-pages
      page.tsx                  Coach overview (pending requests, swimmers)
      layout.tsx                Coach sidebar layout
      swimmers/                 Swimmer management
      groups/                   Swimmer groups (Phase 3)
      analytics/                Analytics (Phase 3)
    api/
      onboarding/swimmer/       POST: complete swimmer onboarding
      onboarding/coach/         POST: complete coach onboarding
      training/                 POST: create session
      training/[id]/            PATCH, DELETE: update/delete session
      competitions/             POST: log competition + results
      competitions/[id]/        DELETE: remove competition
      coach/connections/[id]/   PATCH: approve/reject connection request

  components/
    ui/                         Button, Input, Card, Badge, Select,
                                Dialog, Tabs, Progress, Toast, Textarea, Label
    layout/                     SwimmerSidebar, CoachSidebar

  features/
    auth/                       LoginForm, SignupForm
    onboarding/                 SwimmerOnboarding (4-step), CoachOnboarding
    dashboard/                  StatsCard, RecentSessions
    training/                   SessionList, SessionForm
    competitions/               CompetitionsView, CompetitionsList,
                                PbGrid, LogCompetitionDialog
    coach/                      PendingRequests, SwimmersList

  lib/
    supabase/                   client.ts (browser), server.ts (SSR)
    db/                         profiles.ts, training.ts, competitions.ts
    validations/                auth.ts, onboarding.ts, training.ts, competition.ts
    utils.ts                    formatSwimTime, formatDistance, etc.

  middleware.ts                  Auth + onboarding enforcement, role guards
  types/index.ts                 All TypeScript types

supabase/
  migrations/
    001_swimsignal_schema.sql    Full DB schema with RLS, triggers, RPCs
```

## Routes

| Route | Auth | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/auth/login` | Public | Login |
| `/auth/signup` | Public | Signup (swimmer or coach) |
| `/auth/forgot-password` | Public | Password reset |
| `/onboarding` | Authed | Role-based onboarding wizard |
| `/dashboard` | Swimmer | Main stats dashboard |
| `/dashboard/training` | Swimmer | Training log list |
| `/dashboard/training/new` | Swimmer | Log new session |
| `/dashboard/training/[id]` | Swimmer | Session detail |
| `/dashboard/training/[id]/edit` | Swimmer | Edit session |
| `/dashboard/competitions` | Swimmer | Competitions & PBs |
| `/coach` | Coach | Coach overview |
| `/coach/swimmers` | Coach | Swimmer management |

## Design System

- **Colors**: Navy 50–950 scale + Signal (cyan) 50–600 scale
- **Layout**: RTL-first (`dir="rtl" lang="he"`), logical CSS properties
- **Typography**: Inter font
- **Dark theme**: Navy-950 background, surface tokens for cards
- **Components**: `.card-surface`, `.card-raised`, `.card-signal`, `.badge-*`, `.input-dark`, `.gradient-text`

## Feature Status

| Feature | Phase | Status |
|---|---|---|
| Auth (email + Google OAuth) | 1 | Complete |
| Role-based onboarding (swimmer + coach) | 1 | Complete |
| Swimmer dashboard | 1 | Complete |
| Coach dashboard (basic) | 1 | Complete |
| Landing page | 1 | Complete |
| Training log CRUD | 2 | In progress |
| Competitions + PBs | 2 | In progress |
| Analytics & charts | 3 | Planned |
| Coach workout builder | 3 | Planned |
| AI coach (ISA integration) | 5 | Planned |
