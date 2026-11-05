import "server-only";
import { DURACION_MS, MOTIVOS, validarPartida } from "@/features/games/giftCatcher";
import { deltaPuntos, puntosDelDia, recompensaPartida } from "@/features/scoring/reglas";
import { estadoTemporada } from "@/features/season/calendario";
import { ErrorDeUsuario } from "./api";
import { conTope, db } from "./db";
import { LIMITES, permitir } from "./limites";
import { newSeed } from "./seguridad";
import type { Jugador } from "./sesion";

const JUEGO = "gift-catcher";

/** El servidor crea la partida: semilla aleatoria + hora de inicio del servidor. */
export async function iniciarPartida(yo: Jugador) {
  if (!(await permitir(`partida:${yo.id}`, LIMITES.partidasPorDia.max, LIMITES.partidasPorDia.ventana))) {
    throw new ErrorDeUsuario("Ya jugaste muchísimo hoy. Descansa los dedos y vuelve mañana.", 429);
  }
  const seed = newSeed();
  const [a] = await conTope(db()`
    insert into cc.game_attempts (season_id, game_slug, player_id, team_id, seed, local_day)
    values (${yo.seasonId}, ${JUEGO}, ${yo.id}, ${yo.teamId}, ${seed}, (now() at time zone 'America/Lima')::date)
    returning id
  `);
  return { attemptId: a.id as string, seed, duracionMs: DURACION_MS };
}

export interface ResultadoPartida {
  valida: boolean;
  motivo?: string;
  puntaje: number;
  mejorDelDia: number;
  record: number;
  xp: number;
  coins: number;
  puntos: number;
  puntosHoy: number;
  topeHoy: number;
  pretemporada: boolean;
  atrapados?: Record<string, number>;
  rachaMax?: number;
}

/**
 * Termina y valida la partida en UNA transacción:
 * - solo se puede cerrar una vez (status 'started' → 'validated'/'rejected'),
 * - XP y monedas por partida, puntos solo por el mejor resultado del día,
 * - claves de idempotencia en el ledger: reintentar no duplica nada,
 * - un candado por jugador evita carreras si manda dos resultados a la vez.
 */
export async function terminarPartida(yo: Jugador, attemptId: string, datos: { puntaje: unknown; duracionMs: unknown; atrapados: unknown }): Promise<ResultadoPartida> {
  if (!/^[0-9a-f-]{36}$/i.test(attemptId)) throw new ErrorDeUsuario("Partida no encontrada.", 404);
  const sql = db();
  return conTope(
    sql.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(hashtext(${yo.id}))`;
      const [a] = await tx`
        select id, seed, status, local_day::text as dia, score,
               (extract(epoch from (now() - started_at)) * 1000)::int as transcurrido
        from cc.game_attempts
        where id = ${attemptId} and player_id = ${yo.id} and game_slug = ${JUEGO}
        for update
      `;
      if (!a) throw new ErrorDeUsuario("Partida no encontrada.", 404);
      if (a.status !== "started") throw new ErrorDeUsuario("Esta partida ya fue registrada.", 409);

      const v = validarPartida({ seed: a.seed, transcurridoMs: a.transcurrido, duracionMs: datos.duracionMs, atrapados: datos.atrapados, puntaje: datos.puntaje });
      const estado = estadoTemporada(new Date(), yo.startsAt, yo.endsAt);
      const pretemporada = estado.fase === "pretemporada";

      if (!v.ok) {
        await tx`update cc.game_attempts set status = 'rejected', reject_reason = ${v.motivo}, finished_at = now() where id = ${a.id}`;
        const [r] = await tx`select coalesce(max(score), 0)::int as record from cc.game_attempts where player_id = ${yo.id} and game_slug = ${JUEGO} and status = 'validated'`;
        return { valida: false, motivo: MOTIVOS[v.motivo], puntaje: 0, mejorDelDia: 0, record: r.record, xp: 0, coins: 0, puntos: 0, puntosHoy: 0, topeHoy: puntosDelDia(1e9), pretemporada };
      }

      const puntaje = v.resumen.puntaje;
      await tx`
        update cc.game_attempts
        set status = 'validated', score = ${puntaje}, duration_ms = ${datos.duracionMs as number},
            result = ${tx.json({ atrapados: v.resumen.atrapados, rachaMax: v.resumen.rachaMax })}, finished_at = now()
        where id = ${a.id}
      `;

      const recompensa = recompensaPartida(puntaje);
      await tx`
        insert into cc.score_ledger (season_id, player_id, team_id, source_type, source_id, xp, coins, reason, idempotency_key)
        values (${yo.seasonId}, ${yo.id}, ${yo.teamId}, 'partida', ${a.id}, ${recompensa.xp}, ${recompensa.coins}, 'Gift Catcher: partida', ${`partida:${a.id}`})
        on conflict (idempotency_key) do nothing
      `;

      const [{ mejor }] = await tx`
        select coalesce(max(score), 0)::int as mejor from cc.game_attempts
        where player_id = ${yo.id} and game_slug = ${JUEGO} and local_day = ${a.dia}::date and status = 'validated'
      `;
      const dia = `${JUEGO}:${a.dia}`;
      const [{ otorgado }] = await tx`
        select coalesce(sum(points), 0)::int as otorgado from cc.score_ledger
        where player_id = ${yo.id} and source_type = 'juego-dia' and source_id = ${dia}
      `;
      let puntos = 0;
      if (!pretemporada && estado.fase === "en-curso") {
        puntos = deltaPuntos(mejor, otorgado);
        if (puntos > 0) {
          await tx`
            insert into cc.score_ledger (season_id, player_id, team_id, source_type, source_id, points, reason, idempotency_key)
            values (${yo.seasonId}, ${yo.id}, ${yo.teamId}, 'juego-dia', ${dia}, ${puntos}, 'Gift Catcher: mejor del día', ${`dia:${dia}:${yo.id}:${a.id}`})
          `;
        }
      }
      const [{ record }] = await tx`
        select coalesce(max(score), 0)::int as record from cc.game_attempts
        where player_id = ${yo.id} and game_slug = ${JUEGO} and status = 'validated'
      `;
      if (puntaje > 0 && puntaje >= record) {
        await tx`insert into cc.chaos_events (season_id, player_id, event_type, payload) values (${yo.seasonId}, ${yo.id}, 'record_personal', ${tx.json({ juego: JUEGO, puntaje, nombre: yo.displayName })})`;
      }
      return {
        valida: true,
        puntaje,
        mejorDelDia: mejor,
        record,
        xp: recompensa.xp,
        coins: recompensa.coins,
        puntos,
        puntosHoy: otorgado + puntos,
        topeHoy: puntosDelDia(1e9),
        pretemporada,
        atrapados: v.resumen.atrapados,
        rachaMax: v.resumen.rachaMax,
      };
    }),
    12_000,
    "validación de la partida",
  );
}
