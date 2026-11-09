import "server-only";
import { avatarValido, type ConfigAvatar } from "@/features/avatar";
import { promedioEquipo } from "@/features/scoring/reglas";
import { conTope, db } from "./db";

/** Lecturas para pantallas. Todas con tope de tiempo y sin consultas N+1. */

export interface FilaJugador {
  id: string;
  username: string;
  displayName: string;
  avatar: ConfigAvatar;
  role: string;
  status: string;
  teamId: string | null;
  /** Saldo de monedas: la única moneda del juego y lo que ordena el ranking. */
  monedas: number;
  rank: number;
}

export interface FilaEquipo {
  id: string;
  name: string;
  slug: string;
  color: string;
  emblem: string;
  integrantes: number;
  total: number;
  promedio: number;
  rank: number;
}

export async function jugadoresDeTemporada(seasonId: string, soloActivos = true): Promise<FilaJugador[]> {
  const rows = await conTope(() => db()`
    select p.id, p.username, p.display_name, p.avatar, p.role, p.status, p.team_id, p.created_at,
           coalesce(t.monedas, 0)::int as monedas
    from cc.players p
    left join cc.v_totals t on t.player_id = p.id
    where p.season_id = ${seasonId} ${soloActivos ? db()`and p.status = 'active'` : db()``}
    order by monedas desc, p.created_at asc, p.display_name asc
  `);
  let rank = 0;
  let prev = Number.NaN;
  return rows.map((r, i) => {
    if (r.monedas !== prev) {
      rank = i + 1;
      prev = r.monedas;
    }
    return {
      id: r.id,
      username: r.username,
      displayName: r.display_name,
      avatar: avatarValido(r.avatar),
      role: r.role,
      status: r.status,
      teamId: r.team_id,
      monedas: r.monedas,
      rank,
    };
  });
}

export async function equiposDeTemporada(seasonId: string) {
  const rows = await conTope(() => db()`select id, name, slug, color, emblem from cc.teams where season_id = ${seasonId} order by created_at`);
  return rows.map((r) => ({ id: r.id as string, name: r.name as string, slug: r.slug as string, color: r.color as string, emblem: r.emblem as string }));
}

/** Ranking de equipos = promedio de monedas por integrante activo (regla visible en la pantalla). */
export function rankingEquipos(equipos: Awaited<ReturnType<typeof equiposDeTemporada>>, jugadores: FilaJugador[]): FilaEquipo[] {
  const filas = equipos.map((e) => {
    const miembros = jugadores.filter((j) => j.teamId === e.id);
    const pts = miembros.map((m) => m.monedas);
    return { ...e, integrantes: miembros.length, total: pts.reduce((a, b) => a + b, 0), promedio: promedioEquipo(pts), rank: 0 };
  });
  filas.sort((a, b) => b.promedio - a.promedio || b.integrantes - a.integrantes || a.name.localeCompare(b.name));
  filas.forEach((f, i) => (f.rank = i > 0 && f.promedio === filas[i - 1].promedio ? filas[i - 1].rank : i + 1));
  return filas;
}

export interface Noticia {
  id: string;
  tipo: string;
  payload: Record<string, unknown>;
  fecha: string;
}

export async function noticias(seasonId: string, limite = 12): Promise<Noticia[]> {
  const rows = await conTope(() => db()`
    select id, event_type, payload, created_at from cc.chaos_events
    where season_id = ${seasonId} and is_public
    order by created_at desc limit ${limite}
  `);
  return rows.map((r) => ({ id: r.id, tipo: r.event_type, payload: r.payload ?? {}, fecha: new Date(r.created_at).toISOString() }));
}

export async function eventosDeTemporada(seasonId: string) {
  const rows = await conTope(() => db()`select day, title, description, kind from cc.season_events where season_id = ${seasonId} order by day, title`);
  return rows.map((r) => ({ day: r.day as number, title: r.title as string, description: r.description as string, kind: r.kind as string }));
}

/** Resumen de mi progreso en Gift Catcher (hoy y récord). */
export async function miGiftCatcher(playerId: string) {
  return misStats(playerId, "gift-catcher");
}

/** Mi progreso en un juego (hoy y récord). */
export async function misStats(playerId: string, juego: string) {
  const [r] = await conTope(() => db()`
    select
      coalesce(max(score) filter (where local_day = (now() at time zone 'America/Lima')::date), 0)::int as mejor_hoy,
      coalesce(max(score), 0)::int as record,
      count(*) filter (where local_day = (now() at time zone 'America/Lima')::date)::int as partidas_hoy,
      (select coalesce(sum(points + coins), 0)::int from cc.score_ledger
        where player_id = ${playerId} and source_type = 'juego-dia'
          and source_id = ${juego} || ':' || ((now() at time zone 'America/Lima')::date)::text) as monedas_hoy
    from cc.game_attempts
    where player_id = ${playerId} and game_slug = ${juego} and status = 'validated'
  `);
  return { mejorHoy: r.mejor_hoy as number, record: r.record as number, partidasHoy: r.partidas_hoy as number, monedasHoy: r.monedas_hoy as number };
}

/** Mejores puntajes de Gift Catcher de la temporada (récord de cada jugador). */
export async function recordsGiftCatcher(seasonId: string, limite = 5) {
  return records(seasonId, "gift-catcher", limite);
}

/** Récord de cada jugador en un juego, los mejores primero. */
export async function records(seasonId: string, juego: string, limite = 5) {
  const rows = await conTope(() => db()`
    select p.display_name, p.avatar, max(a.score)::int as record
    from cc.game_attempts a join cc.players p on p.id = a.player_id
    where a.season_id = ${seasonId} and a.game_slug = ${juego} and a.status = 'validated' and p.status = 'active'
    group by p.id, p.display_name, p.avatar
    order by record desc limit ${limite}
  `);
  return rows.map((r) => ({ nombre: r.display_name as string, avatar: avatarValido(r.avatar), record: r.record as number }));
}

/** Métricas básicas para el organizador (agregadas, sin datos privados). */
export async function metricas(seasonId: string) {
  const [r] = await conTope(() => db()`
    select
      (select count(*)::int from cc.players where season_id = ${seasonId} and status = 'active') as activos,
      (select count(*)::int from cc.players where season_id = ${seasonId} and status = 'pending') as pendientes,
      (select count(distinct player_id)::int from cc.game_attempts where season_id = ${seasonId}
        and local_day = (now() at time zone 'America/Lima')::date) as jugaron_hoy,
      (select count(*)::int from cc.game_attempts where season_id = ${seasonId} and status = 'validated') as partidas,
      (select count(*)::int from cc.game_attempts where season_id = ${seasonId} and status = 'rejected') as rechazadas,
      (select count(*)::int from cc.game_attempts where season_id = ${seasonId} and status = 'started'
        and started_at < now() - interval '10 minutes') as abandonadas
  `);
  return r as { activos: number; pendientes: number; jugaron_hoy: number; partidas: number; rechazadas: number; abandonadas: number };
}

/**
 * Trivia por equipos de HOY: promedio del mejor puntaje de cada integrante activo
 * (quien no jugó cuenta 0, para que gane el equipo que juega junto, no el que tiene un genio).
 */
export async function triviaEquiposHoy(seasonId: string) {
  const rows = await conTope(() => db()`
    select t.id, t.name, t.color, t.emblem,
           count(p.id)::int as integrantes,
           count(m.mejor)::int as jugaron,
           coalesce(round(sum(coalesce(m.mejor, 0))::numeric / nullif(count(p.id), 0), 1), 0)::float as promedio
    from cc.teams t
    left join cc.players p on p.team_id = t.id and p.status = 'active'
    left join (
      select player_id, max(score) as mejor from cc.game_attempts
      where season_id = ${seasonId} and game_slug = 'trivia' and status = 'validated'
        and local_day = (now() at time zone 'America/Lima')::date
      group by player_id
    ) m on m.player_id = p.id
    where t.season_id = ${seasonId}
    group by t.id, t.name, t.color, t.emblem
    order by promedio desc, t.name
  `);
  return rows.map((r) => ({ id: r.id as string, nombre: r.name as string, color: r.color as string, emblema: r.emblem as string, integrantes: r.integrantes as number, jugaron: r.jugaron as number, promedio: Number(r.promedio) }));
}
