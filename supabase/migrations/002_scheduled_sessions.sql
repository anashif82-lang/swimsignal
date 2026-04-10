-- ─────────────────────────────────────────────────────────────────────────────
-- 002_scheduled_sessions.sql
-- Swimmer personal training schedule (planned future sessions)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists scheduled_sessions (
  id                  uuid        primary key default gen_random_uuid(),
  swimmer_id          uuid        not null references profiles(id) on delete cascade,
  title               text        not null,
  training_type       text        not null default 'water'
                                  check (training_type in ('water', 'dryland', 'gym', 'other')),
  start_time          timestamptz not null,
  end_time            timestamptz not null,
  is_recurring        boolean     not null default false,
  recurrence_group_id uuid,                          -- shared by all instances of a recurring event
  notes               text,
  created_at          timestamptz not null default now()
);

alter table scheduled_sessions enable row level security;

create policy "swimmers_manage_own_schedule"
  on scheduled_sessions for all
  using  (swimmer_id = auth.uid())
  with check (swimmer_id = auth.uid());

create index if not exists scheduled_sessions_swimmer_time_idx
  on scheduled_sessions (swimmer_id, start_time);
