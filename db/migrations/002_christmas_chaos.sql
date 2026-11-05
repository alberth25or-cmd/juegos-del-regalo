-- =====================================================================
-- Christmas Chaos — esquema `cc` (Fase 0 y 1)
-- El esquema viejo `jdr` queda intacto. Aquí solo lo que usan las fases 0–1;
-- lo demás llega en migraciones pequeñas cuando exista la función que lo usa.
-- El navegador nunca toca estas tablas: todo pasa por el servidor.
-- =====================================================================

create schema if not exists cc;

-- ------------------------------------------------------------ temporadas
create table cc.seasons (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 2 and 60),
  slug          text not null unique,
  description   text,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  timezone      text not null default 'America/Lima',
  status        text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  invite_code   text not null unique,
  settings      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- --------------------------------------------------------------- equipos
create table cc.teams (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid not null references cc.seasons (id) on delete cascade,
  name        text not null check (char_length(name) between 2 and 40),
  slug        text not null,
  color       text not null,
  emblem      text not null,
  created_at  timestamptz not null default now(),
  unique (season_id, slug)
);

-- -------------------------------------------------------------- jugadores
-- Sin Supabase Auth: el perfil y la pertenencia a la temporada viven juntos.
create table cc.players (
  id                    uuid primary key default gen_random_uuid(),
  season_id             uuid not null references cc.seasons (id) on delete cascade,
  username              text not null check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name          text not null check (char_length(display_name) between 2 and 30),
  avatar                jsonb not null default '{}'::jsonb,
  bio                   text check (char_length(bio) <= 140),
  role                  text not null default 'player' check (role in ('player', 'admin')),
  status                text not null default 'pending' check (status in ('pending', 'active', 'inactive', 'rejected')),
  team_id               uuid references cc.teams (id) on delete set null,
  pin_hash              text not null,
  pin_failed            int not null default 0,
  pin_locked_until      timestamptz,
  humor_level           text not null default 'friends' check (humor_level in ('light', 'friends', 'chaos')),
  allow_roast           boolean not null default true,
  allow_public_sharing  boolean not null default false,
  avatar_visibility     text not null default 'group' check (avatar_visibility in ('group', 'public', 'private')),
  created_at            timestamptz not null default now(),
  approved_at           timestamptz,
  last_seen_at          timestamptz,
  unique (season_id, username)
);
create index players_season_idx on cc.players (season_id, status);
create index players_team_idx on cc.players (team_id);

-- ---------------------------------------------------------------- sesiones
create table cc.sessions (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references cc.players (id) on delete cascade,
  token_hash    text not null unique,
  user_agent    text,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz not null default now(),
  expires_at    timestamptz not null default now() + interval '60 days'
);
create index sessions_player_idx on cc.sessions (player_id);

-- ------------------------------------------------------------------ juegos
create table cc.games (
  slug         text primary key,
  name         text not null,
  description  text not null,
  game_type    text not null check (game_type in ('arcade', 'trivia', 'memory', 'cooperative', 'social')),
  zone         text not null,
  is_active    boolean not null default true,
  config       jsonb not null default '{}'::jsonb
);

-- Partida: la crea el servidor (semilla + hora de inicio) y la valida al terminar.
create table cc.game_attempts (
  id            uuid primary key default gen_random_uuid(),
  season_id     uuid not null references cc.seasons (id) on delete cascade,
  game_slug     text not null references cc.games (slug),
  player_id     uuid not null references cc.players (id) on delete cascade,
  team_id       uuid references cc.teams (id) on delete set null,
  seed          int not null,
  local_day     date not null,
  status        text not null default 'started' check (status in ('started', 'validated', 'rejected')),
  score         int,
  duration_ms   int,
  result        jsonb,
  reject_reason text,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz
);
create index attempts_player_day_idx on cc.game_attempts (player_id, game_slug, local_day);
create index attempts_season_idx on cc.game_attempts (season_id, status);

-- ------------------------------------------------- libro de puntos (append-only)
create table cc.score_ledger (
  id               uuid primary key default gen_random_uuid(),
  season_id        uuid not null references cc.seasons (id) on delete cascade,
  player_id        uuid not null references cc.players (id) on delete cascade,
  team_id          uuid references cc.teams (id) on delete set null,
  source_type      text not null,
  source_id        text,
  points           int not null default 0,
  xp               int not null default 0,
  coins            int not null default 0,
  reason           text not null,
  idempotency_key  text not null unique,
  created_by       uuid references cc.players (id),
  created_at       timestamptz not null default now()
);
create index ledger_player_idx on cc.score_ledger (season_id, player_id);

create or replace function cc.ledger_inmutable() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then
    return old; -- borrado en cascada de una temporada completa: permitido
  end if;
  raise exception 'score_ledger es append-only: usa un movimiento compensatorio';
end $$;
create trigger ledger_sin_update before update on cc.score_ledger
  for each row execute function cc.ledger_inmutable();
create trigger ledger_sin_delete before delete on cc.score_ledger
  for each row execute function cc.ledger_inmutable();

create view cc.v_totals as
select p.season_id, p.id as player_id, p.team_id,
       coalesce(sum(l.points), 0)::int as points,
       coalesce(sum(l.xp), 0)::int as xp,
       coalesce(sum(l.coins), 0)::int as coins
from cc.players p
left join cc.score_ledger l on l.player_id = p.id
group by p.season_id, p.id, p.team_id;

-- ------------------------------------------------------ calendario editable
create table cc.season_events (
  id           uuid primary key default gen_random_uuid(),
  season_id    uuid not null references cc.seasons (id) on delete cascade,
  day          int not null check (day between 1 and 60),
  title        text not null,
  description  text not null default '',
  kind         text not null default 'event',
  unique (season_id, day, title)
);

-- ------------------------------------------------------ noticias del mundo
create table cc.chaos_events (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid not null references cc.seasons (id) on delete cascade,
  player_id   uuid references cc.players (id) on delete cascade,
  event_type  text not null,
  payload     jsonb not null default '{}'::jsonb,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index chaos_events_season_idx on cc.chaos_events (season_id, created_at desc);

-- -------------------------------------------------------- límite de intentos
create table cc.rate_limits (
  key           text primary key,
  window_start  timestamptz not null,
  hits          int not null
);

-- ------------------------------------------------------ auditoría de admin
create table cc.admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid references cc.seasons (id) on delete cascade,
  actor_id    uuid references cc.players (id) on delete set null,
  action      text not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------- catálogo
insert into cc.games (slug, name, description, game_type, zone, config) values
  ('gift-catcher', 'Gift Catcher', 'Santa en bancarrota: atrapa regalos, esquiva facturas.', 'arcade', 'arcade',
   '{"durationMs": 60000, "minDurationMs": 55000, "maxOpenMs": 180000, "dailyPointsCap": 100}'::jsonb)
on conflict (slug) do nothing;

-- ---------------------------------------------------------- blindaje total
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'cc' loop
    execute format('alter table cc.%I enable row level security', t.tablename);
  end loop;
end $$;

revoke all on schema cc from public;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema cc from anon';
    execute 'revoke all on all tables in schema cc from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on schema cc from authenticated';
    execute 'revoke all on all tables in schema cc from authenticated';
  end if;
end $$;
