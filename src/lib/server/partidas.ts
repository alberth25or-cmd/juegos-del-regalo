import "server-only";
import { DURACION_MS, MOTIVOS, validarPartida } from "@/features/games/giftCatcher";
import { MOTIVOS_MEMORY, validarMemory } from "@/features/games/memory";
import { MOTIVOS_TRIVIA, N_PREGUNTAS, preguntasPublicas, SEGUNDOS_POR_PREGUNTA, validarTrivia } from "@/features/games/trivia";
import { deltaMonedas, GIFT_REFERENCIA, MEMORY_REFERENCIA, monedasDelDia, TRIVIA_REFERENCIA } from "@/features/scoring/reglas";
import { ErrorDeUsuario } from "./api";
import { conTope, db } from "./db";
import { LIMITES, permitir } from "./limites";
import { newSeed } from "./seguridad";
import { estadoDe, type Jugador } from "./sesion";

/**
 * Partidas de TODOS los juegos individuales con el mismo esquema seguro:
 * el servidor crea la partida (semilla + hora), el navegador juega, y al terminar el
 * servidor recalcula el puntaje con la semilla y el tiempo que él mismo midió.
 */
type Validacion = { ok: true; puntaje: number; detalle: Record<string, unknown> } | { ok: false; motivo: string };

interface DefJuego {
  nombre: string;
  referencia: number;
  /** datos extra para el navegador al empezar (p. ej. las preguntas de la trivia, sin respuestas) */
  alEmpezar: (seed: number) => Record<string, unknown>;
  validar: (seed: number, transcurridoMs: number, datos: Record<string, unknown>) => Validacion;
}

export const JUEGOS: Record<string, DefJuego> = {
  "gift-catcher": {
    nombre: "Gift Catcher",
    referencia: GIFT_REFERENCIA,
    alEmpezar: () => ({ duracionMs: DURACION_MS }),
    validar: (seed, transcurridoMs, d) => {
      const v = validarPartida({ seed, transcurridoMs, duracionMs: d.duracionMs, atrapados: d.atrapados, puntaje: d.puntaje });
      return v.ok ? { ok: true, puntaje: v.resumen.puntaje, detalle: { atrapados: v.resumen.atrapados, rachaMax: v.resumen.rachaMax } } : { ok: false, motivo: MOTIVOS[v.motivo] };
    },
  },
  memory: {
    nombre: "Memory Gifts",
    referencia: MEMORY_REFERENCIA,
    alEmpezar: () => ({}),
    validar: (seed, transcurridoMs, d) => {
      const v = validarMemory({ seed, transcurridoMs, volteos: d.volteos });
      return v.ok ? { ok: true, puntaje: v.resumen.puntaje, detalle: { movimientos: v.resumen.movimientos, segundos: v.resumen.segundos } } : { ok: false, motivo: MOTIVOS_MEMORY[v.motivo] };
    },
  },
  trivia: {
    nombre: "Juicio del Polo Norte",
    referencia: TRIVIA_REFERENCIA,
    alEmpezar: (seed) => ({ preguntas: preguntasPublicas(seed), segundosPorPregunta: SEGUNDOS_POR_PREGUNTA, total: N_PREGUNTAS }),
    validar: (seed, transcurridoMs, d) => {
      const v = validarTrivia({ seed, transcurridoMs, respuestas: d.respuestas });
      return v.ok ? { ok: true, puntaje: v.resumen.puntaje, detalle: { aciertos: v.resumen.aciertos, correctas: v.resumen.correctas } } : { ok: false, motivo: MOTIVOS_TRIVIA[v.motivo] };
    },
  },
};

export function juegoValido(slug: unknown): slug is keyof typeof JUEGOS {
  return typeof slug === "string" && Object.hasOwn(JUEGOS, slug);
}

/** El servidor crea la partida: semilla aleatoria + hora de inicio del servidor. */
export async function iniciarPartida(yo: Jugador, juego: string = "gift-catcher") {
  if (!juegoValido(juego)) throw new ErrorDeUsuario("Ese juego no existe.", 404);
  if (!(await permitir(`partida:${yo.id}`, LIMITES.partidasPorDia.max, LIMITES.partidasPorDia.ventana))) {
    throw new ErrorDeUsuario("Ya jugaste muchísimo hoy. Descansa los dedos y vuelve mañana.", 429);
  }
  const seed = newSeed();
  const [a] = await conTope(db()`
    insert into cc.game_attempts (season_id, game_slug, player_id, team_id, seed, local_day)
    values (${yo.seasonId}, ${juego}, ${yo.id}, ${yo.teamId}, ${seed}, (now() at time zone 'America/Lima')::date)
    returning id
  `);
  return { attemptId: a.id as string, seed, ...JUEGOS[juego].alEmpezar(seed) };
}

export interface ResultadoPartida {
  valida: boolean;
  motivo?: string;
  puntaje: number;
  mejorDelDia: number;
  record: number;
  /** Monedas que ganó esta partida (solo si mejoró su mejor del día). */
  monedas: number;
  /** Monedas acumuladas hoy en este juego. */
  monedasHoy: number;
  topeHoy: number;
  pretemporada: boolean;
  atrapados?: Record<string, number>;
  rachaMax?: number;
  detalle?: Record<string, unknown>;
}

/**
 * Termina y valida la partida en UNA transacción:
 * - solo se puede cerrar una vez (status 'started' → 'validated'/'rejected'),
 * - monedas solo por el mejor resultado del día (por juego): repetir sube el récord, no las monedas,
 * - claves de idempotencia en el ledger: reintentar no duplica nada,
 * - un candado por jugador evita carreras si manda dos resultados a la vez.
 */
export async function terminarPartida(yo: Jugador, attemptId: string, datos: Record<string, unknown>): Promise<ResultadoPartida> {
  if (!/^[0-9a-f-]{36}$/i.test(attemptId)) throw new ErrorDeUsuario("Partida no encontrada.", 404);
  const sql = db();
  return conTope(
    sql.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(hashtext(${yo.id}))`;
      const [a] = await tx`
        select id, seed, status, game_slug, local_day::text as dia, score,
               (extract(epoch from (now() - started_at)) * 1000)::int as transcurrido
        from cc.game_attempts
        where id = ${attemptId} and player_id = ${yo.id}
        for update
      `;
      if (!a || !juegoValido(a.game_slug)) throw new ErrorDeUsuario("Partida no encontrada.", 404);
      if (a.status !== "started") throw new ErrorDeUsuario("Esta partida ya fue registrada.", 409);
      const slug = a.game_slug as string;
      const def = JUEGOS[slug];

      const v = def.validar(a.seed, a.transcurrido, datos);
      const estado = estadoDe(yo);
      const pretemporada = estado.fase === "pretemporada";

      if (!v.ok) {
        await tx`update cc.game_attempts set status = 'rejected', reject_reason = ${v.motivo.slice(0, 120)}, finished_at = now() where id = ${a.id}`;
        const [r] = await tx`select coalesce(max(score), 0)::int as record from cc.game_attempts where player_id = ${yo.id} and game_slug = ${slug} and status = 'validated'`;
        return { valida: false, motivo: v.motivo, puntaje: 0, mejorDelDia: 0, record: r.record, monedas: 0, monedasHoy: 0, topeHoy: monedasDelDia(1e9), pretemporada };
      }

      const puntaje = v.puntaje;
      const duracion = typeof datos.duracionMs === "number" && Number.isFinite(datos.duracionMs) ? Math.round(datos.duracionMs) : a.transcurrido;
      await tx`
        update cc.game_attempts
        set status = 'validated', score = ${puntaje}, duration_ms = ${duracion}, result = ${tx.json(v.detalle as never)}, finished_at = now()
        where id = ${a.id}
      `;

      const [{ mejor }] = await tx`
        select coalesce(max(score), 0)::int as mejor from cc.game_attempts
        where player_id = ${yo.id} and game_slug = ${slug} and local_day = ${a.dia}::date and status = 'validated'
      `;
      const dia = `${slug}:${a.dia}`;
      const [{ otorgado }] = await tx`
        select coalesce(sum(points + coins), 0)::int as otorgado from cc.score_ledger
        where player_id = ${yo.id} and source_type = 'juego-dia' and source_id = ${dia}
      `;
      let monedas = 0;
      if (!pretemporada && estado.fase === "en-curso") {
        // En prueba no hay tope diario: cada partida suma sus monedas (para probar rápido).
        monedas = yo.prueba ? monedasDelDia(puntaje, def.referencia) : deltaMonedas(mejor, otorgado, def.referencia);
        if (monedas > 0) {
          await tx`
            insert into cc.score_ledger (season_id, player_id, team_id, source_type, source_id, coins, reason, idempotency_key)
            values (${yo.seasonId}, ${yo.id}, ${yo.teamId}, 'juego-dia', ${dia}, ${monedas}, ${yo.prueba ? `${def.nombre} (prueba)` : `${def.nombre}: mejor del día`}, ${`dia:${dia}:${yo.id}:${a.id}`})
          `;
        }
      }
      const [{ record }] = await tx`
        select coalesce(max(score), 0)::int as record from cc.game_attempts
        where player_id = ${yo.id} and game_slug = ${slug} and status = 'validated'
      `;
      if (puntaje > 0 && puntaje >= record) {
        await tx`insert into cc.chaos_events (season_id, player_id, event_type, payload) values (${yo.seasonId}, ${yo.id}, 'record_personal', ${tx.json({ juego: slug, puntaje, nombre: yo.displayName })})`;
      }
      return {
        valida: true,
        puntaje,
        mejorDelDia: mejor,
        record,
        monedas,
        monedasHoy: otorgado + monedas,
        topeHoy: yo.prueba ? 0 : monedasDelDia(1e9),
        pretemporada,
        atrapados: v.detalle.atrapados as Record<string, number> | undefined,
        rachaMax: v.detalle.rachaMax as number | undefined,
        detalle: v.detalle,
      };
    }),
    12_000,
    "validación de la partida",
  );
}
