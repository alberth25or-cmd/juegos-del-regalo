/**
 * Trivia «Juicio del Polo Norte» (reglas puras, SOLO servidor: el navegador nunca
 * importa el catálogo, así no puede ver las respuestas correctas).
 *
 * La semilla elige 8 preguntas y el orden de sus opciones. El navegador recibe textos y
 * opciones, responde, y el servidor recalcula aciertos con la misma semilla.
 */
import { crearAzar, mezclar } from "../azar.ts";
import { PREGUNTAS_TRIVIA } from "../contenido/trivia.ts";

export const N_PREGUNTAS = 8;
export const SEGUNDOS_POR_PREGUNTA = 15;
export const MIN_MS_POR_PREGUNTA = 700;
export const MAX_MS = N_PREGUNTAS * SEGUNDOS_POR_PREGUNTA * 1000 + 60_000;

export interface PreguntaJuego {
  id: string;
  texto: string;
  opciones: string[];
  /** índice correcto DESPUÉS de mezclar las opciones (nunca se manda al navegador) */
  ok: number;
}

export function preguntasDe(seed: number): PreguntaJuego[] {
  const azar = crearAzar(seed);
  return mezclar(PREGUNTAS_TRIVIA, azar)
    .slice(0, N_PREGUNTAS)
    .map((p) => {
      const orden = mezclar([0, 1, 2, 3], azar);
      return { id: p.id, texto: p.texto, opciones: orden.map((i) => p.opciones[i]), ok: orden.indexOf(p.ok) };
    });
}

/** Lo que ve el navegador: sin la respuesta correcta. */
export function preguntasPublicas(seed: number) {
  return preguntasDe(seed).map(({ id, texto, opciones }) => ({ id, texto, opciones }));
}

export function puntuarTrivia(aciertos: number, ms: number) {
  const total = N_PREGUNTAS * SEGUNDOS_POR_PREGUNTA;
  const sobra = Math.max(0, Math.min(total, total - Math.round(ms / 1000)));
  return aciertos * 100 + Math.round((aciertos / N_PREGUNTAS) * sobra * 1.5);
}

export interface ResumenTrivia {
  puntaje: number;
  aciertos: number;
  correctas: number[];
}

export type RechazoTrivia = "respuestas-invalidas" | "partida-corta" | "partida-vencida";

/** `respuestas[i]` = opción elegida (0–3) o -1 si se acabó el tiempo. */
export function validarTrivia(input: { seed: number; transcurridoMs: number; respuestas: unknown }): { ok: true; resumen: ResumenTrivia } | { ok: false; motivo: RechazoTrivia } {
  if (input.transcurridoMs > MAX_MS) return { ok: false, motivo: "partida-vencida" };
  const r = input.respuestas;
  if (!Array.isArray(r) || r.length !== N_PREGUNTAS || !r.every((n) => Number.isInteger(n) && n >= -1 && n <= 3)) return { ok: false, motivo: "respuestas-invalidas" };
  if (input.transcurridoMs < N_PREGUNTAS * MIN_MS_POR_PREGUNTA) return { ok: false, motivo: "partida-corta" };
  const ps = preguntasDe(input.seed);
  const aciertos = ps.filter((p, i) => r[i] === p.ok).length;
  return { ok: true, resumen: { puntaje: puntuarTrivia(aciertos, input.transcurridoMs), aciertos, correctas: ps.map((p) => p.ok) } };
}

export const MOTIVOS_TRIVIA: Record<RechazoTrivia, string> = {
  "respuestas-invalidas": "Las respuestas no llegaron bien.",
  "partida-corta": "Respondiste más rápido que la luz. El Auditor no lo acepta.",
  "partida-vencida": "La partida estuvo abierta demasiado tiempo.",
};
