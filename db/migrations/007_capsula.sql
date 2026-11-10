-- Cápsula del tiempo (pedido de Luis, 2026-11-09): cada agente le deja un mensaje a su amigo
-- secreto. Se puede editar hasta el último día; ese día lo lee quien lo recibe.
-- Nadie más lo ve: ni el organizador ni ningún otro endpoint.
create table if not exists cc.capsulas (
  season_id    uuid not null references cc.seasons (id) on delete cascade,
  giver_id     uuid not null references cc.players (id) on delete cascade,
  receiver_id  uuid not null references cc.players (id) on delete cascade,
  mensaje      text not null check (char_length(mensaje) between 1 and 400),
  updated_at   timestamptz not null default now(),
  primary key (season_id, giver_id)
);
create index if not exists capsulas_receptor_idx on cc.capsulas (receiver_id);

alter table cc.capsulas enable row level security;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on cc.capsulas from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on cc.capsulas from authenticated';
  end if;
end $$;
