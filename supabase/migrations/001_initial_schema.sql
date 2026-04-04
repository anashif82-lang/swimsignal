-- ============================================================
-- ScopeProp – Initial Schema
-- Run in Supabase SQL Editor or via supabase db push
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Organizations ───────────────────────────────────────────────────────────

create table if not exists organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  plan        text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Profiles ────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  email           text not null,
  full_name       text,
  avatar_url      text,
  role            text not null default 'owner' check (role in ('owner', 'member')),
  created_at      timestamptz not null default now()
);

-- ─── Clients ─────────────────────────────────────────────────────────────────

create table if not exists clients (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  email           text,
  company         text,
  phone           text,
  created_at      timestamptz not null default now()
);

create index if not exists clients_org_idx on clients(organization_id);
create index if not exists clients_email_idx on clients(email);

-- ─── Proposals ───────────────────────────────────────────────────────────────

create table if not exists proposals (
  id                  uuid primary key default uuid_generate_v4(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  client_id           uuid references clients(id) on delete set null,
  title               text not null,
  status              text not null default 'draft'
                      check (status in ('draft', 'sent', 'viewed', 'accepted', 'declined')),
  project_type        text not null default '',
  project_description text not null default '',
  pricing_model       text not null default 'fixed'
                      check (pricing_model in ('fixed', 'hourly', 'retainer', 'milestone')),
  currency            text not null default 'USD',
  total_amount        numeric(12, 2),
  hourly_rate         numeric(12, 2),
  timeline            text,
  tone                text not null default 'professional'
                      check (tone in ('professional', 'friendly', 'formal', 'creative')),
  public_slug         text not null unique,
  sent_at             timestamptz,
  viewed_at           timestamptz,
  accepted_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists proposals_org_idx  on proposals(organization_id);
create index if not exists proposals_slug_idx on proposals(public_slug);
create index if not exists proposals_status_idx on proposals(status);

-- ─── Proposal Sections ───────────────────────────────────────────────────────

create table if not exists proposal_sections (
  id              uuid primary key default uuid_generate_v4(),
  proposal_id     uuid not null references proposals(id) on delete cascade,
  section_key     text not null,
  section_label   text not null,
  section_content text not null default '',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(proposal_id, section_key)
);

create index if not exists sections_proposal_idx on proposal_sections(proposal_id);

-- ─── Proposal Events ─────────────────────────────────────────────────────────

create table if not exists proposal_events (
  id          uuid primary key default uuid_generate_v4(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  event_type  text not null
              check (event_type in ('created', 'updated', 'viewed', 'shared', 'accepted', 'declined')),
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists events_proposal_idx on proposal_events(proposal_id);
create index if not exists events_type_idx     on proposal_events(event_type);

-- ─── Row Level Security ──────────────────────────────────────────────────────

alter table organizations      enable row level security;
alter table profiles           enable row level security;
alter table clients            enable row level security;
alter table proposals          enable row level security;
alter table proposal_sections  enable row level security;
alter table proposal_events    enable row level security;

-- Helper: get current user's organization_id
create or replace function get_my_org_id()
returns uuid language sql stable security definer as $$
  select organization_id from profiles where id = auth.uid()
$$;

-- Organizations: owner can do everything
create policy "org_owner_all" on organizations
  for all using (owner_id = auth.uid());

-- Profiles: own row only
create policy "profile_self" on profiles
  for all using (id = auth.uid());

-- Clients: own org only
create policy "clients_org" on clients
  for all using (organization_id = get_my_org_id());

-- Proposals: own org only (private)
create policy "proposals_org_private" on proposals
  for all using (organization_id = get_my_org_id());

-- Proposals: public read by slug (no auth required)
create policy "proposals_public_read" on proposals
  for select using (true);

-- Proposal sections: auth users access via proposal
create policy "sections_via_proposal" on proposal_sections
  for all using (
    proposal_id in (
      select id from proposals where organization_id = get_my_org_id()
    )
  );

-- Sections: public read (for public proposal page)
create policy "sections_public_read" on proposal_sections
  for select using (true);

-- Events: org members only
create policy "events_org" on proposal_events
  for all using (
    proposal_id in (
      select id from proposals where organization_id = get_my_org_id()
    )
  );

-- ─── Auto-update updated_at ──────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_organizations
  before update on organizations
  for each row execute function update_updated_at();

create trigger set_updated_at_proposals
  before update on proposals
  for each row execute function update_updated_at();

create trigger set_updated_at_sections
  before update on proposal_sections
  for each row execute function update_updated_at();

-- ─── Auto-create profile on signup ──────────────────────────────────────────

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
