-- =====================================================================
-- Fase 2 adelantada (pedido de Luis, 6 nov): votaciones, trivia, memoria.
-- La energía navideña no necesita tabla: sale del libro de puntos.
-- =====================================================================

-- ------------------------------------------- «¿Quién es más probable…?»
-- Un voto por persona y ronda. La ronda es el día (temporada real) o una
-- franja corta (temporada de prueba). Nunca se vota por uno mismo.
create table cc.votes (
  id           uuid primary key default gen_random_uuid(),
  season_id    uuid not null references cc.seasons (id) on delete cascade,
  round_key    text not null,
  question_id  text not null,
  voter_id     uuid not null references cc.players (id) on delete cascade,
  target_id    uuid not null references cc.players (id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (season_id, round_key, voter_id),
  check (voter_id <> target_id)
);
create index votes_round_idx on cc.votes (season_id, round_key);

-- ------------------------------------------------------------- catálogo
insert into cc.games (slug, name, description, game_type, zone, config) values
  ('trivia', 'Juicio del Polo Norte', 'Trivia absurda: 8 preguntas, cuenta el promedio del equipo.', 'trivia', 'arena',
   '{"preguntas": 8, "segundosPorPregunta": 15, "dailyPointsCap": 100}'::jsonb),
  ('memory', 'Memory Gifts', 'Memoria del desastre: encuentra los pares con pocos movimientos.', 'memory', 'arcade',
   '{"pares": 8, "dailyPointsCap": 100}'::jsonb)
on conflict (slug) do nothing;

alter table cc.votes enable row level security;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on cc.votes from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on cc.votes from authenticated';
  end if;
end $$;
