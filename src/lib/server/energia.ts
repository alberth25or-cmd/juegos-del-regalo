import "server-only";
import { avatarValido, type ConfigAvatar } from "@/features/avatar";
import { BONO_ARBOL, hitosNuevos, MENSAJE_HITO, metaEnergia, porcentaje, type HITOS } from "@/features/social/energia";
import { conTope, db } from "./db";

export interface EstadoEnergia {
  energia: number;
  meta: number;
  pct: number;
  activos: number;
  equipos: { id: string; nombre: string; color: string; emblema: string; energia: number }[];
  top: { id: string; nombre: string; avatar: ConfigAvatar; energia: number }[];
  hitos: number[];
}

/**
 * Energía de la temporada = suma de la XP positiva de todos. Al leerla se anuncian los
 * hitos nuevos (25/50/75/100 %) una sola vez; al 100 % todos los activos reciben monedas.
 */
export async function energiaDe(seasonId: string): Promise<EstadoEnergia> {
  const [[r], equipos, top, anunciados] = await Promise.all([
    conTope(
      () => db()`
      select (select coalesce(sum(xp), 0)::int from cc.score_ledger where season_id = ${seasonId} and xp > 0) as energia,
             (select count(*)::int from cc.players where season_id = ${seasonId} and status = 'active') as activos
    `,
    ),
    conTope(
      () => db()`
      select t.id, t.name, t.color, t.emblem, coalesce(sum(l.xp) filter (where l.xp > 0), 0)::int as energia
      from cc.teams t left join cc.score_ledger l on l.team_id = t.id and l.season_id = ${seasonId}
      where t.season_id = ${seasonId}
      group by t.id, t.name, t.color, t.emblem
      order by energia desc, t.name
    `,
    ),
    conTope(
      () => db()`
      select p.id, p.display_name, p.avatar, coalesce(sum(l.xp), 0)::int as energia
      from cc.score_ledger l join cc.players p on p.id = l.player_id
      where l.season_id = ${seasonId} and l.xp > 0 and p.status = 'active'
      group by p.id, p.display_name, p.avatar
      order by energia desc limit 5
    `,
    ),
    conTope(() => db()`select (payload->>'hito')::int as hito from cc.chaos_events where season_id = ${seasonId} and event_type = 'energia_hito'`),
  ]);
  const meta = metaEnergia(r.activos);
  const pct = porcentaje(r.energia, meta);
  const ya = anunciados.map((a) => a.hito as number);
  const nuevos = hitosNuevos(pct, ya);
  if (nuevos.length) await anunciarHitos(seasonId, nuevos);
  return {
    energia: r.energia,
    meta,
    pct,
    activos: r.activos,
    equipos: equipos.map((e) => ({ id: e.id, nombre: e.name, color: e.color, emblema: e.emblem, energia: e.energia })),
    top: top.map((t) => ({ id: t.id, nombre: t.display_name, avatar: avatarValido(t.avatar), energia: t.energia })),
    hitos: [...new Set([...ya, ...nuevos])].sort((a, b) => a - b),
  };
}

async function anunciarHitos(seasonId: string, hitos: (typeof HITOS)[number][]) {
  const sql = db();
  await conTope(
    sql.begin(async (tx) => {
      // Un solo anuncio por hito aunque dos personas abran la pantalla a la vez.
      await tx`select pg_advisory_xact_lock(hashtext(${`energia:${seasonId}`}))`;
      for (const h of hitos) {
        const [ya] = await tx`select 1 from cc.chaos_events where season_id = ${seasonId} and event_type = 'energia_hito' and (payload->>'hito')::int = ${h}`;
        if (ya) continue;
        await tx`insert into cc.chaos_events (season_id, event_type, payload) values (${seasonId}, 'energia_hito', ${tx.json({ hito: h, mensaje: MENSAJE_HITO[h] })})`;
        if (h === 100) {
          await tx`
            insert into cc.score_ledger (season_id, player_id, team_id, source_type, source_id, coins, reason, idempotency_key)
            select season_id, id, team_id, 'energia', '100', ${BONO_ARBOL.coins}, 'Árbol de Snowville encendido', 'energia:' || season_id || ':100:' || id
            from cc.players where season_id = ${seasonId} and status = 'active'
            on conflict (idempotency_key) do nothing
          `;
        }
      }
    }),
    10_000,
    "anuncio de energía",
  );
}
