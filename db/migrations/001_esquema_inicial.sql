-- Los Juegos del Regalo · esquema inicial
-- Todo vive en el esquema `jdr`, que la API pública de Supabase no expone.
-- Además cada tabla tiene RLS activado SIN políticas: solo el servidor
-- (conexión directa como dueño) puede leer o escribir.

create schema if not exists jdr;

-- ---------------------------------------------------------------- grupos
create table jdr.groups (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 2 and 60),
  invite_code   text not null unique,
  theme         text not null default 'navidad-espia',
  fee_total     numeric(10,2) not null default 50 check (fee_total >= 0),
  gift_amount   numeric(10,2) not null default 40 check (gift_amount >= 0),
  pot_split     jsonb not null default '[60, 27, 13]',
  starts_on     date,
  gift_day      date,
  timezone      text not null default 'America/Lima',
  status        text not null default 'setup' check (status in ('setup', 'active', 'finished')),
  rules_locked  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- --------------------------------------------------------------- agentes
create table jdr.members (
  id                uuid primary key default gen_random_uuid(),
  group_id          uuid not null references jdr.groups (id) on delete cascade,
  alias             text not null check (char_length(alias) between 1 and 40),
  codename          text not null check (char_length(codename) between 2 and 40),
  avatar            text not null default 'cuy',
  role              text not null default 'player' check (role in ('organizer', 'player')),
  status            text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  pin_hash          text not null,
  pin_failed        int not null default 0,
  pin_locked_until  timestamptz,
  rescue_code_hash  text not null unique,
  paid              boolean not null default false,
  is_custodian      boolean not null default false,
  created_at        timestamptz not null default now(),
  approved_at       timestamptz,
  last_seen_at      timestamptz,
  unique (group_id, codename)
);
create index members_group_idx on jdr.members (group_id);

-- Un dispositivo = una sesión. La cookie guarda el token; aquí solo su hash.
create table jdr.sessions (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references jdr.members (id) on delete cascade,
  token_hash    text not null unique,
  user_agent    text,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz not null default now()
);
create index sessions_member_idx on jdr.sessions (member_id);

-- ------------------------------------------------------- custodio del pozo
create table jdr.custodian_votes (
  group_id      uuid not null references jdr.groups (id) on delete cascade,
  voter_id      uuid not null references jdr.members (id) on delete cascade,
  candidate_id  uuid not null references jdr.members (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (group_id, voter_id),
  check (voter_id <> candidate_id)
);

-- ------------------------------------------------ amigo secreto (sorteo)
-- Nunca se expone a la interfaz: cada agente solo consulta a quién le regala.
create table jdr.secret_santa_pairs (
  group_id     uuid not null references jdr.groups (id) on delete cascade,
  giver_id     uuid not null references jdr.members (id) on delete cascade,
  receiver_id  uuid not null references jdr.members (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (group_id, giver_id),
  unique (group_id, receiver_id),
  check (giver_id <> receiver_id)
);

-- ------------------------------------------------------------------ retos
create table jdr.challenges (
  id              uuid primary key default gen_random_uuid(),
  group_id        uuid not null references jdr.groups (id) on delete cascade,
  day             int not null check (day >= 1),
  type            text not null,
  title           text not null,
  description     text not null default '',
  points          int not null default 10 check (points >= 0),
  opens_at        timestamptz not null,
  closes_at       timestamptz not null,
  vote_closes_at  timestamptz,
  config          jsonb not null default '{}',
  status          text not null default 'scheduled'
                  check (status in ('scheduled', 'open', 'voting', 'closed', 'void')),
  created_at      timestamptz not null default now(),
  unique (group_id, day, type),
  check (closes_at > opens_at)
);
create index challenges_group_day_idx on jdr.challenges (group_id, day);

create table jdr.submissions (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references jdr.challenges (id) on delete cascade,
  member_id     uuid not null references jdr.members (id) on delete cascade,
  content       jsonb not null default '{}',
  photo_path    text,
  created_at    timestamptz not null default now(),
  unique (challenge_id, member_id)
);

-- Un voto por persona y por reto (la regla "no votarse a sí mismo" se valida en el servidor).
create table jdr.votes (
  id             uuid primary key default gen_random_uuid(),
  challenge_id   uuid not null references jdr.challenges (id) on delete cascade,
  submission_id  uuid not null references jdr.submissions (id) on delete cascade,
  voter_id       uuid not null references jdr.members (id) on delete cascade,
  created_at     timestamptz not null default now(),
  unique (challenge_id, voter_id)
);

-- "¿Dijiste esta palabra?" / "Alguien me mandó un meme"
create table jdr.confirmations (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references jdr.submissions (id) on delete cascade,
  confirmer_id   uuid not null references jdr.members (id) on delete cascade,
  value          boolean not null,
  created_at     timestamptz not null default now(),
  unique (submission_id, confirmer_id)
);

-- ------------------------------------------------------- libro de puntos
-- El ranking SIEMPRE se calcula sumando este libro. Nada se edita a mano:
-- para corregir, el organizador anula (voided_at) un movimiento.
create table jdr.points_ledger (
  id               bigint generated always as identity primary key,
  group_id         uuid not null references jdr.groups (id) on delete cascade,
  member_id        uuid not null references jdr.members (id) on delete cascade,
  points           int not null check (points <> 0),
  reason           text not null,
  ref_type         text,
  ref_id           uuid,
  idempotency_key  text unique,
  voided_at        timestamptz,
  voided_by        uuid references jdr.members (id),
  created_at       timestamptz not null default now()
);
create index ledger_group_member_idx on jdr.points_ledger (group_id, member_id);

-- ----------------------------------------------- apuestas y comodines
create table jdr.bets (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid not null references jdr.groups (id) on delete cascade,
  member_id     uuid not null references jdr.members (id) on delete cascade,
  challenge_id  uuid references jdr.challenges (id) on delete set null,
  amount        int not null check (amount > 0),
  prediction    jsonb not null,
  result        text not null default 'pending' check (result in ('pending', 'won', 'lost', 'void')),
  bet_day       date not null,
  created_at    timestamptz not null default now(),
  unique (member_id, bet_day)
);

create table jdr.powerups (
  id                uuid primary key default gen_random_uuid(),
  member_id         uuid not null references jdr.members (id) on delete cascade,
  kind              text not null check (kind in ('escudo', 'robar', 'doble', 'espia')),
  status            text not null default 'available' check (status in ('available', 'used')),
  target_member_id  uuid references jdr.members (id) on delete set null,
  used_at           timestamptz,
  created_at        timestamptz not null default now()
);
create index powerups_member_idx on jdr.powerups (member_id);

-- ------------------------------------------- pistas, wishlist y cápsula
create table jdr.clues (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null references jdr.members (id) on delete cascade,
  text         text not null check (char_length(text) between 3 and 280),
  release_day  int,
  created_at   timestamptz not null default now()
);

create table jdr.wishlists (
  member_id    uuid primary key references jdr.members (id) on delete cascade,
  items        jsonb not null default '[]',
  price_note   text,
  updated_at   timestamptz not null default now()
);

create table jdr.time_capsule (
  member_id   uuid primary key references jdr.members (id) on delete cascade,
  message     text not null check (char_length(message) between 1 and 1000),
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------- juegos colaborativos
create table jdr.collab_contributions (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references jdr.groups (id) on delete cascade,
  goal        text not null,
  member_id   uuid not null references jdr.members (id) on delete cascade,
  day         date not null,
  created_at  timestamptz not null default now(),
  unique (group_id, goal, member_id, day)
);

-- ---------------------------------------------------------- gran final
create table jdr.final_votes (
  group_id      uuid not null references jdr.groups (id) on delete cascade,
  category      text not null,
  voter_id      uuid not null references jdr.members (id) on delete cascade,
  candidate_id  uuid not null references jdr.members (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (group_id, category, voter_id)
);

-- --------------------------------------------------- feed y auditoría
create table jdr.activity_feed (
  id          bigint generated always as identity primary key,
  group_id    uuid not null references jdr.groups (id) on delete cascade,
  kind        text not null,
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index feed_group_time_idx on jdr.activity_feed (group_id, created_at desc);

create table jdr.audit_log (
  id          bigint generated always as identity primary key,
  group_id    uuid references jdr.groups (id) on delete cascade,
  actor_id    uuid references jdr.members (id) on delete set null,
  action      text not null,
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------- ranking
create view jdr.v_ranking as
select
  m.group_id,
  m.id as member_id,
  m.codename,
  m.avatar,
  coalesce(sum(p.points) filter (where p.voided_at is null), 0)::int as points
from jdr.members m
left join jdr.points_ledger p on p.member_id = m.id
where m.status = 'approved'
group by m.group_id, m.id, m.codename, m.avatar;

-- ------------------------------------------------------- blindaje total
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'jdr' loop
    execute format('alter table jdr.%I enable row level security', t.tablename);
  end loop;
end $$;

revoke all on schema jdr from public;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema jdr from anon';
    execute 'revoke all on all tables in schema jdr from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on schema jdr from authenticated';
    execute 'revoke all on all tables in schema jdr from authenticated';
  end if;
end $$;
