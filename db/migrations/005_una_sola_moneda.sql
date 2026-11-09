-- Una sola moneda (decisión de Luis, 2026-11-09).
-- Todo se gana y se gasta en MONEDAS y el ranking es la suma de monedas. No se reescribe el
-- ledger (es append-only): lo que antes eran puntos de ranking cuenta como monedas, y desde
-- ahora el servidor escribe solo en `coins`. La XP de antes queda como historia y no cuenta.
create or replace view cc.v_totals as
select p.season_id, p.id as player_id, p.team_id,
       coalesce(sum(l.points), 0)::int as points,
       coalesce(sum(l.xp), 0)::int as xp,
       coalesce(sum(l.coins), 0)::int as coins,
       coalesce(sum(l.points + l.coins), 0)::int as monedas
from cc.players p
left join cc.score_ledger l on l.player_id = p.id
group by p.season_id, p.id, p.team_id;
