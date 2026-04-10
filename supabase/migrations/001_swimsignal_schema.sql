-- ============================================================
-- SwimSignal – Phase 1 Schema
-- Production-grade schema for competitive swimming platform
-- Apply via: supabase db push  OR  Supabase SQL Editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- fuzzy search for coach lookup

-- ─── ENUMS ────────────────────────────────────────────────────────────────────

create type user_role as enum ('swimmer', 'coach');
create type gender_type as enum ('male', 'female', 'other', 'prefer_not_to_say');
create type connection_status as enum ('pending', 'approved', 'rejected', 'removed');
create type pool_length as enum ('25m', '50m');
create type stroke_type as enum ('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'individual_medley');
create type training_type as enum ('water', 'dryland', 'gym', 'other');
create type session_status as enum ('completed', 'not_completed', 'partial');
create type competition_level as enum ('local', 'regional', 'national', 'international');
create type pb_source as enum ('official', 'unofficial');
create type notification_type as enum ('connection_request', 'connection_approved', 'workout_assigned', 'reminder', 'system');

-- ─── CLUBS ────────────────────────────────────────────────────────────────────

create table if not exists clubs (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  city        text,
  country     text not null default 'IL', -- Israel as default
  is_verified boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists clubs_name_trgm_idx on clubs using gin (name gin_trgm_ops);
create index if not exists clubs_name_idx on clubs (lower(name));

-- ─── PROFILES ─────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text,
  avatar_url      text,
  role            user_role not null default 'swimmer',
  preferred_lang  text not null default 'he', -- Hebrew-first
  onboarding_done boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── SWIMMER PROFILES ─────────────────────────────────────────────────────────

create table if not exists swimmer_profiles (
  id              uuid primary key references profiles(id) on delete cascade,
  birth_year      integer check (birth_year >= 1940 and birth_year <= 2020),
  gender          gender_type,
  club_id         uuid references clubs(id) on delete set null,
  club_name_raw   text, -- free-text if club not in DB yet
  strokes         stroke_type[] not null default '{}',
  main_events     text[] not null default '{}', -- e.g. ['100m_freestyle', '200m_backstroke']
  goals           text,
  is_profile_public boolean not null default false,
  updated_at      timestamptz not null default now()
);

-- ─── COACH PROFILES ───────────────────────────────────────────────────────────

create table if not exists coach_profiles (
  id              uuid primary key references profiles(id) on delete cascade,
  club_id         uuid references clubs(id) on delete set null,
  club_name_raw   text,
  bio             text,
  credentials     text,
  updated_at      timestamptz not null default now()
);

-- ─── COACH ↔ SWIMMER CONNECTIONS ──────────────────────────────────────────────

create table if not exists coach_swimmer_connections (
  id              uuid primary key default uuid_generate_v4(),
  coach_id        uuid not null references profiles(id) on delete cascade,
  swimmer_id      uuid not null references profiles(id) on delete cascade,
  status          connection_status not null default 'pending',
  initiated_by    uuid not null references profiles(id), -- who sent the request
  message         text, -- optional message from swimmer
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint unique_coach_swimmer unique (coach_id, swimmer_id),
  constraint no_self_connection check (coach_id != swimmer_id)
);

create index if not exists csc_coach_idx on coach_swimmer_connections (coach_id, status);
create index if not exists csc_swimmer_idx on coach_swimmer_connections (swimmer_id, status);

-- ─── SWIMMER GROUPS (for coach) ───────────────────────────────────────────────

create table if not exists swimmer_groups (
  id          uuid primary key default uuid_generate_v4(),
  coach_id    uuid not null references profiles(id) on delete cascade,
  name        text not null,
  description text,
  color       text default '#00D4FF',
  created_at  timestamptz not null default now()
);

create table if not exists swimmer_group_members (
  group_id    uuid not null references swimmer_groups(id) on delete cascade,
  swimmer_id  uuid not null references profiles(id) on delete cascade,
  added_at    timestamptz not null default now(),
  primary key (group_id, swimmer_id)
);

-- ─── TAGS ─────────────────────────────────────────────────────────────────────

create table if not exists tags (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  color       text default '#64748B',
  created_by  uuid not null references profiles(id) on delete cascade,
  is_global   boolean not null default false, -- coach-defined global tags
  created_at  timestamptz not null default now(),

  constraint unique_tag_per_user unique (name, created_by)
);

create index if not exists tags_creator_idx on tags (created_by);

-- ─── TRAINING SESSIONS ────────────────────────────────────────────────────────

create table if not exists training_sessions (
  id              uuid primary key default uuid_generate_v4(),
  swimmer_id      uuid not null references profiles(id) on delete cascade,
  coach_id        uuid references profiles(id) on delete set null, -- if session was coached

  -- Session metadata
  session_date    date not null,
  training_type   training_type not null default 'water',
  pool_length     pool_length, -- null for dryland
  status          session_status not null default 'completed',

  -- Volume metrics
  total_distance  integer, -- in meters
  total_duration  integer, -- in minutes
  rpe             integer check (rpe >= 1 and rpe <= 10),

  -- Content
  title           text,
  notes           text,

  -- Planned workout reference (if based on coach plan)
  planned_workout_id uuid, -- FK added after planned_workouts table

  -- Timestamps
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists ts_swimmer_date_idx on training_sessions (swimmer_id, session_date desc);
create index if not exists ts_coach_idx on training_sessions (coach_id, session_date desc);

-- ─── TRAINING SETS ────────────────────────────────────────────────────────────

create table if not exists training_sets (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null references training_sessions(id) on delete cascade,
  set_order       integer not null default 0,

  -- Set structure
  repetitions     integer not null default 1,    -- e.g. 4 (in 4x100m)
  distance        integer,                        -- per rep in meters
  stroke          stroke_type,
  equipment       text,                           -- e.g. 'paddles', 'fins'

  -- Time data
  target_time     text,                           -- e.g. '1:05.00'
  actual_time     text,                           -- recorded time

  -- Rest
  rest_seconds    integer,

  -- Notes
  description     text,                           -- e.g. 'easy warm-up', 'threshold pace'

  created_at      timestamptz not null default now()
);

create index if not exists tsets_session_idx on training_sets (session_id, set_order);

-- ─── TRAINING SESSION TAGS ────────────────────────────────────────────────────

create table if not exists training_session_tags (
  session_id  uuid not null references training_sessions(id) on delete cascade,
  tag_id      uuid not null references tags(id) on delete cascade,
  primary key (session_id, tag_id)
);

-- ─── PLANNED WORKOUTS (Coach-assigned) ────────────────────────────────────────

create table if not exists planned_workouts (
  id              uuid primary key default uuid_generate_v4(),
  coach_id        uuid not null references profiles(id) on delete cascade,
  title           text not null,
  description     text,
  training_type   training_type not null default 'water',
  pool_length     pool_length,
  estimated_distance integer, -- meters
  estimated_duration integer, -- minutes
  is_template     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists planned_workout_sets (
  id              uuid primary key default uuid_generate_v4(),
  workout_id      uuid not null references planned_workouts(id) on delete cascade,
  set_order       integer not null default 0,
  repetitions     integer not null default 1,
  distance        integer,
  stroke          stroke_type,
  target_time     text,
  rest_seconds    integer,
  description     text,
  created_at      timestamptz not null default now()
);

create table if not exists planned_workout_assignments (
  id              uuid primary key default uuid_generate_v4(),
  workout_id      uuid not null references planned_workouts(id) on delete cascade,
  assigned_to_swimmer uuid references profiles(id) on delete cascade,
  assigned_to_group   uuid references swimmer_groups(id) on delete cascade,
  scheduled_date  date,
  created_at      timestamptz not null default now(),

  constraint must_have_target check (
    assigned_to_swimmer is not null or assigned_to_group is not null
  )
);

-- Add FK for planned_workout_id in training_sessions
alter table training_sessions
  add constraint ts_planned_workout_fk
  foreign key (planned_workout_id)
  references planned_workouts(id)
  on delete set null;

-- ─── COMPETITIONS ─────────────────────────────────────────────────────────────

create table if not exists competitions (
  id              uuid primary key default uuid_generate_v4(),
  swimmer_id      uuid not null references profiles(id) on delete cascade,
  name            text not null,
  competition_date date not null,
  location        text,
  level           competition_level,
  pool_length     pool_length not null default '50m',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists comp_swimmer_date_idx on competitions (swimmer_id, competition_date desc);

-- ─── COMPETITION RESULTS ──────────────────────────────────────────────────────

create table if not exists competition_results (
  id              uuid primary key default uuid_generate_v4(),
  competition_id  uuid not null references competitions(id) on delete cascade,
  swimmer_id      uuid not null references profiles(id) on delete cascade,
  event_name      text not null,    -- e.g. '100m_freestyle'
  stroke          stroke_type,
  distance        integer,          -- meters
  pool_length     pool_length not null,
  final_time      text not null,    -- format: 'MM:SS.cc'
  final_time_ms   integer not null, -- time in milliseconds for sorting/comparison
  heat_time       text,
  heat_time_ms    integer,
  place           integer,
  goal_time       text,
  goal_time_ms    integer,
  is_personal_best boolean not null default false,
  is_official     boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists cr_swimmer_event_idx on competition_results (swimmer_id, event_name, pool_length);

-- ─── PERSONAL BESTS ───────────────────────────────────────────────────────────

create table if not exists personal_bests (
  id              uuid primary key default uuid_generate_v4(),
  swimmer_id      uuid not null references profiles(id) on delete cascade,
  event_name      text not null,
  stroke          stroke_type not null,
  distance        integer not null,
  pool_length     pool_length not null,
  time_text       text not null,    -- e.g. '58.34'
  time_ms         integer not null, -- milliseconds
  achieved_at     date not null,
  source          pb_source not null default 'official',
  competition_id  uuid references competitions(id) on delete set null,
  result_id       uuid references competition_results(id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- One official PB per event/pool combination
  constraint unique_official_pb unique (swimmer_id, event_name, pool_length, source)
    deferrable initially deferred
);

create index if not exists pb_swimmer_event_idx on personal_bests (swimmer_id, event_name, pool_length);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

create table if not exists notifications (
  id              uuid primary key default uuid_generate_v4(),
  recipient_id    uuid not null references profiles(id) on delete cascade,
  sender_id       uuid references profiles(id) on delete set null,
  type            notification_type not null,
  title           text not null,
  body            text,
  data            jsonb default '{}',
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists notif_recipient_idx on notifications (recipient_id, is_read, created_at desc);

-- ─── SEASONS ──────────────────────────────────────────────────────────────────

create table if not exists seasons (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,             -- e.g. 'Season 2024-2025'
  start_date  date not null,
  end_date    date not null,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now(),
  constraint seasons_dates_check check (end_date > start_date)
);

-- Seed standard seasons
insert into seasons (name, start_date, end_date, is_current)
values
  ('2023-2024', '2023-10-01', '2024-09-30', false),
  ('2024-2025', '2024-10-01', '2025-09-30', false),
  ('2025-2026', '2025-10-01', '2026-09-30', true)
on conflict do nothing;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table clubs enable row level security;
alter table profiles enable row level security;
alter table swimmer_profiles enable row level security;
alter table coach_profiles enable row level security;
alter table coach_swimmer_connections enable row level security;
alter table swimmer_groups enable row level security;
alter table swimmer_group_members enable row level security;
alter table tags enable row level security;
alter table training_sessions enable row level security;
alter table training_sets enable row level security;
alter table training_session_tags enable row level security;
alter table planned_workouts enable row level security;
alter table planned_workout_sets enable row level security;
alter table planned_workout_assignments enable row level security;
alter table competitions enable row level security;
alter table competition_results enable row level security;
alter table personal_bests enable row level security;
alter table notifications enable row level security;

-- ─── RLS POLICIES ─────────────────────────────────────────────────────────────

-- CLUBS: public read, admin write
create policy "clubs_public_read" on clubs for select using (true);

-- PROFILES: users manage own profile, coaches see their swimmers
create policy "profiles_own" on profiles
  for all using (auth.uid() = id);

create policy "profiles_coach_read" on profiles
  for select using (
    exists (
      select 1 from coach_swimmer_connections csc
      where csc.coach_id = auth.uid()
        and csc.swimmer_id = profiles.id
        and csc.status = 'approved'
    )
  );

create policy "profiles_swimmer_read_coach" on profiles
  for select using (
    exists (
      select 1 from coach_swimmer_connections csc
      where csc.swimmer_id = auth.uid()
        and csc.coach_id = profiles.id
        and csc.status = 'approved'
    )
  );

-- SWIMMER PROFILES
create policy "swimmer_profiles_own" on swimmer_profiles
  for all using (auth.uid() = id);

create policy "swimmer_profiles_coach_read" on swimmer_profiles
  for select using (
    exists (
      select 1 from coach_swimmer_connections csc
      where csc.coach_id = auth.uid()
        and csc.swimmer_id = swimmer_profiles.id
        and csc.status = 'approved'
    )
  );

-- COACH PROFILES
create policy "coach_profiles_own" on coach_profiles
  for all using (auth.uid() = id);

create policy "coach_profiles_swimmer_read" on coach_profiles
  for select using (
    exists (
      select 1 from coach_swimmer_connections csc
      where csc.swimmer_id = auth.uid()
        and csc.coach_id = coach_profiles.id
    )
  );

-- CONNECTIONS
create policy "connections_own" on coach_swimmer_connections
  for all using (
    auth.uid() = coach_id or auth.uid() = swimmer_id
  );

-- SWIMMER GROUPS
create policy "groups_coach_manage" on swimmer_groups
  for all using (auth.uid() = coach_id);

create policy "groups_swimmer_read" on swimmer_groups
  for select using (
    exists (
      select 1 from swimmer_group_members sgm
      join coach_swimmer_connections csc on csc.coach_id = swimmer_groups.coach_id
      where sgm.swimmer_id = auth.uid()
        and sgm.group_id = swimmer_groups.id
        and csc.swimmer_id = auth.uid()
        and csc.status = 'approved'
    )
  );

-- TAGS
create policy "tags_manage_own" on tags
  for all using (auth.uid() = created_by);

create policy "tags_read_global" on tags
  for select using (is_global = true);

-- TRAINING SESSIONS
create policy "sessions_own" on training_sessions
  for all using (auth.uid() = swimmer_id);

create policy "sessions_coach_read" on training_sessions
  for select using (
    exists (
      select 1 from coach_swimmer_connections csc
      where csc.coach_id = auth.uid()
        and csc.swimmer_id = training_sessions.swimmer_id
        and csc.status = 'approved'
    )
  );

-- TRAINING SETS
create policy "sets_via_session" on training_sets
  for all using (
    exists (
      select 1 from training_sessions ts
      where ts.id = training_sets.session_id
        and ts.swimmer_id = auth.uid()
    )
  );

create policy "sets_coach_read" on training_sets
  for select using (
    exists (
      select 1 from training_sessions ts
      join coach_swimmer_connections csc on csc.swimmer_id = ts.swimmer_id
      where ts.id = training_sets.session_id
        and csc.coach_id = auth.uid()
        and csc.status = 'approved'
    )
  );

-- PLANNED WORKOUTS
create policy "workouts_coach_manage" on planned_workouts
  for all using (auth.uid() = coach_id);

create policy "workouts_swimmer_read" on planned_workouts
  for select using (
    exists (
      select 1 from planned_workout_assignments pwa
      join coach_swimmer_connections csc on csc.coach_id = planned_workouts.coach_id
      where (pwa.assigned_to_swimmer = auth.uid() or exists (
        select 1 from swimmer_group_members sgm
        where sgm.group_id = pwa.assigned_to_group
          and sgm.swimmer_id = auth.uid()
      ))
      and csc.swimmer_id = auth.uid()
      and csc.status = 'approved'
    )
  );

-- COMPETITIONS
create policy "competitions_own" on competitions
  for all using (auth.uid() = swimmer_id);

create policy "competitions_coach_read" on competitions
  for select using (
    exists (
      select 1 from coach_swimmer_connections csc
      where csc.coach_id = auth.uid()
        and csc.swimmer_id = competitions.swimmer_id
        and csc.status = 'approved'
    )
  );

-- COMPETITION RESULTS
create policy "results_own" on competition_results
  for all using (auth.uid() = swimmer_id);

create policy "results_coach_read" on competition_results
  for select using (
    exists (
      select 1 from coach_swimmer_connections csc
      where csc.coach_id = auth.uid()
        and csc.swimmer_id = competition_results.swimmer_id
        and csc.status = 'approved'
    )
  );

-- PERSONAL BESTS
create policy "pbs_own" on personal_bests
  for all using (auth.uid() = swimmer_id);

create policy "pbs_coach_read" on personal_bests
  for select using (
    exists (
      select 1 from coach_swimmer_connections csc
      where csc.coach_id = auth.uid()
        and csc.swimmer_id = personal_bests.swimmer_id
        and csc.status = 'approved'
    )
  );

-- NOTIFICATIONS
create policy "notifications_own" on notifications
  for all using (auth.uid() = recipient_id);

-- ─── FUNCTIONS & TRIGGERS ─────────────────────────────────────────────────────

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger swimmer_profiles_updated_at
  before update on swimmer_profiles
  for each row execute function update_updated_at();

create trigger coach_profiles_updated_at
  before update on coach_profiles
  for each row execute function update_updated_at();

create trigger training_sessions_updated_at
  before update on training_sessions
  for each row execute function update_updated_at();

create trigger planned_workouts_updated_at
  before update on planned_workouts
  for each row execute function update_updated_at();

-- Auto-create profile on sign-up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Function: search coaches by name (for onboarding)
create or replace function search_coaches(search_query text, result_limit int default 10)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  club_name text
) language plpgsql security definer as $$
begin
  return query
    select
      p.id,
      p.full_name,
      p.avatar_url,
      coalesce(c.name, cp.club_name_raw) as club_name
    from profiles p
    join coach_profiles cp on cp.id = p.id
    left join clubs c on c.id = cp.club_id
    where p.role = 'coach'
      and p.onboarding_done = true
      and p.full_name ilike '%' || search_query || '%'
    order by similarity(p.full_name, search_query) desc
    limit result_limit;
end;
$$;

-- Function: get swimmer stats summary
create or replace function get_swimmer_stats(p_swimmer_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'total_sessions', count(distinct ts.id),
    'total_distance_km', round(coalesce(sum(ts.total_distance), 0)::numeric / 1000, 1),
    'total_duration_hours', round(coalesce(sum(ts.total_duration), 0)::numeric / 60, 1),
    'sessions_this_week', count(distinct ts.id) filter (
      where ts.session_date >= date_trunc('week', current_date)
    ),
    'sessions_this_month', count(distinct ts.id) filter (
      where ts.session_date >= date_trunc('month', current_date)
    ),
    'pb_count', (select count(*) from personal_bests pb where pb.swimmer_id = p_swimmer_id)
  )
  into v_result
  from training_sessions ts
  where ts.swimmer_id = p_swimmer_id
    and ts.status = 'completed';

  return v_result;
end;
$$;
