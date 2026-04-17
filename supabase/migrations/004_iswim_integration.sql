-- ============================================================
-- SwimSignal – Israeli Swimming Federation (iswim) integration
-- ============================================================
-- Adds the fields needed to link a swimmer's SwimSignal profile to
-- their public page on loglig.com:2053/Players/Details/{id} and to
-- persist personal bests synced from that source.
--
-- Run this in Supabase SQL editor (or CLI) after 003.
-- ============================================================

-- 1. Add fields to swimmer_profiles ---------------------------------------
alter table swimmer_profiles
  add column if not exists iswim_player_id     integer,
  add column if not exists iswim_last_sync_at  timestamptz;

create index if not exists swimmer_profiles_iswim_player_idx
  on swimmer_profiles (iswim_player_id)
  where iswim_player_id is not null;

-- 2. Extend pb_source enum -------------------------------------------------
-- Old values:   'official' | 'unofficial'
-- New value:    'iswim'    (synced from Israeli Swimming Federation)
do $$
begin
  if not exists (
    select 1 from pg_enum
      join pg_type on pg_type.oid = pg_enum.enumtypid
      where pg_type.typname = 'pb_source'
        and pg_enum.enumlabel = 'iswim'
  ) then
    alter type pb_source add value 'iswim';
  end if;
end$$;
