-- Juego de las casas (decisiones de Luis y Cesar, nov 2026): agentes anónimos, ficha de
-- inscripción, sorteo del amigo secreto, preguntas diarias por casa y fisgoneo con monedas.
-- Todo lo escribe el servidor; el navegador nunca habla con la base de datos.

-- Alias anónimo "Agente <plato>", único por temporada (lo asigna el servidor al azar).
alter table cc.players add column if not exists alias text;
create unique index if not exists players_alias_unico on cc.players (season_id, alias) where alias is not null;

-- Picante es opcional: null = todavía no decidió · true = juega · false = no juega.
alter table cc.players add column if not exists juega_picante boolean;

-- Ficha de inscripción: opciones de regalo y datos breves (solo la ve quien le regala).
create table if not exists cc.fichas (
  player_id   uuid primary key references cc.players (id) on delete cascade,
  season_id   uuid not null references cc.seasons (id) on delete cascade,
  regalos     jsonb not null,
  datos       jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Sorteo: quién le regala a quién. Nadie lo lee desde ningún endpoint del organizador.
create table if not exists cc.amigo_secreto (
  season_id    uuid not null references cc.seasons (id) on delete cascade,
  giver_id     uuid not null references cc.players (id) on delete cascade,
  receiver_id  uuid not null references cc.players (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (season_id, giver_id),
  unique (season_id, receiver_id),
  check (giver_id <> receiver_id)
);

-- Respuestas a las preguntas del día. respondida · paso · vencida (no respondió a tiempo).
create table if not exists cc.respuestas (
  id           uuid primary key default gen_random_uuid(),
  season_id    uuid not null references cc.seasons (id) on delete cascade,
  player_id    uuid not null references cc.players (id) on delete cascade,
  casa         smallint not null check (casa in (2, 3, 4, 5)),
  pregunta_id  text not null,
  dia          int not null check (dia between 1 and 90),
  estado       text not null check (estado in ('respondida', 'paso', 'vencida')),
  respuesta    text check (char_length(respuesta) <= 60),
  created_at   timestamptz not null default now(),
  unique (player_id, pregunta_id)
);
create index if not exists respuestas_pregunta_idx on cc.respuestas (season_id, pregunta_id);
create index if not exists respuestas_jugador_idx on cc.respuestas (season_id, player_id, dia);

-- Sobres abiertos de la ficha del amigo secreto (gratis o pagando monedas).
create table if not exists cc.fisgoneos (
  id            uuid primary key default gen_random_uuid(),
  season_id     uuid not null references cc.seasons (id) on delete cascade,
  buyer_id      uuid not null references cc.players (id) on delete cascade,
  respuesta_id  uuid not null references cc.respuestas (id) on delete cascade,
  monedas       int not null default 0,
  gratis        boolean not null default false,
  dia           int not null,
  created_at    timestamptz not null default now(),
  unique (buyer_id, respuesta_id)
);
create index if not exists fisgoneos_respuesta_idx on cc.fisgoneos (respuesta_id);

alter table cc.fichas enable row level security;
alter table cc.amigo_secreto enable row level security;
alter table cc.respuestas enable row level security;
alter table cc.fisgoneos enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on cc.fichas, cc.amigo_secreto, cc.respuestas, cc.fisgoneos from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on cc.fichas, cc.amigo_secreto, cc.respuestas, cc.fisgoneos from authenticated';
  end if;
end $$;
