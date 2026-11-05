-- =====================================================================
-- Mundo explorable: chat corto moderado y reportes.
-- Las posiciones NO se guardan aquí: viajan por Supabase Realtime.
-- =====================================================================

create table cc.world_messages (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid not null references cc.seasons (id) on delete cascade,
  player_id   uuid not null references cc.players (id) on delete cascade,
  room        text not null,
  body        text not null check (char_length(body) between 1 and 60),
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);
create index world_messages_room_idx on cc.world_messages (season_id, room, created_at desc);

create table cc.moderation_reports (
  id           uuid primary key default gen_random_uuid(),
  season_id    uuid not null references cc.seasons (id) on delete cascade,
  reporter_id  uuid not null references cc.players (id) on delete cascade,
  target_type  text not null check (target_type in ('message', 'player')),
  target_id    uuid not null,
  reason       text not null check (char_length(reason) between 2 and 140),
  status       text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  reviewed_by  uuid references cc.players (id),
  created_at   timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);
create index reports_season_idx on cc.moderation_reports (season_id, status);

alter table cc.world_messages enable row level security;
alter table cc.moderation_reports enable row level security;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on cc.world_messages, cc.moderation_reports from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on cc.world_messages, cc.moderation_reports from authenticated';
  end if;
end $$;
