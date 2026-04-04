# ScopeProp

AI-powered proposal generation SaaS for freelancers and agencies. Generate a full scope of work, pricing breakdown, timeline, and client-ready proposal in under 2 minutes.

## Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Auth + DB**: Supabase (PostgreSQL + Row Level Security)
- **AI**: OpenAI `gpt-4o` with offline stub fallback
- **Validation**: Zod + React Hook Form
- **Payments**: Stripe (stubbed)
- **Email**: Resend (stubbed)
- **Deployment**: Vercel

## Quick Start

```bash
npm install
cp .env.example .env.local
# fill in .env.local (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `OPENAI_API_KEY` | Optional | GPT-4o (stub provider used if absent) |
| `NEXT_PUBLIC_APP_URL` | Yes | Full app URL, no trailing slash |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe Phase 2 |
| `STRIPE_SECRET_KEY` | Optional | Stripe Phase 2 |
| `RESEND_API_KEY` | Optional | Email Phase 2 |

## Database Setup

1. Create a project at [supabase.com](https://supabase.com)
2. In SQL Editor, run `supabase/migrations/001_initial_schema.sql`
3. In Authentication → URL Configuration, set:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
4. Optionally enable Google OAuth in Authentication → Providers

## Project Structure

```
src/
  app/                         Next.js pages + API routes
    page.tsx                   Landing page
    auth/{login,signup}/       Auth pages
    auth/callback/route.ts     OAuth callback
    dashboard/                 Protected dashboard + proposal editor
    proposals/                 Proposal list + wizard
    p/[slug]/                  Public shareable proposal page
    api/proposals/             Generate, section update, status update
  components/ui/               Button, Input, Textarea, Select, Badge, Card, Toast
  components/layout/           Navbar, Sidebar
  features/proposals/          Wizard steps, editor, table row
  lib/ai/provider.ts           AI provider abstraction (OpenAI + Stub)
  lib/db/                      proposals.ts, clients.ts, organizations.ts
  lib/supabase/                client.ts, server.ts
  lib/validations/             Zod schemas
  types/index.ts               All TypeScript types
supabase/migrations/           SQL schema
```

## How Auth Works

- Email/password via Supabase Auth
- Google OAuth (enable in Supabase dashboard)
- `middleware.ts` protects `/dashboard` and `/proposals` routes
- On first dashboard load, an `organizations` row is auto-created per user
- Public proposal pages (`/p/[slug]`) require no authentication

## How Proposal Generation Works

1. User fills 6-step wizard: client → project → scope → pricing → tone → review
2. Wizard POSTs structured input to `/api/proposals/generate`
3. Zod validates input; `clients` row is upserted; `proposals` row is created
4. `createAIProvider()` selects OpenAI if `OPENAI_API_KEY` is set, otherwise uses the offline stub
5. 9 sections are generated and saved to `proposal_sections`
6. User lands on the proposal editor at `/dashboard/proposals/[id]`
7. Each section is individually editable; changes PATCH `/api/proposals/[id]/section`
8. A shareable link `/p/[slug]` is available immediately

## Feature Status

| Feature | Status |
|---|---|
| Auth (email + Google OAuth) | Complete |
| Dashboard with stats | Complete |
| 6-step proposal wizard | Complete |
| AI generation (OpenAI gpt-4o) | Complete |
| Offline stub AI provider | Complete |
| Inline proposal editor | Complete |
| Public shareable proposal page | Complete |
| Proposal event tracking | Complete |
| Supabase schema + RLS | Complete |
| Stripe billing | Stubbed |
| Resend email | Stubbed |
| PDF export | Phase 2 |
| E-signature | Phase 2 |
| Multi-user team seats | Schema ready, UI Phase 2 |
| White-label | Phase 2 |

## Deploy to Vercel

```bash
vercel deploy
```

Set all env vars in the Vercel project dashboard. Update `NEXT_PUBLIC_APP_URL` to your production domain.
