/**
 * Reglas puras de «¿Quién es más probable…?» (sin BD, con tests).
 *
 * - Temporada real: una pregunta por día (hora de Lima). Cierra a medianoche.
 * - Temporada de prueba: una pregunta cada FRANJA_PRUEBA_MS, para jugar en vivo.
 * - Los resultados se ocultan hasta el cierre… o hasta que vota todo el grupo
 *   (así, jugando juntos, no hay que esperar al día siguiente).
 */
import { COMENTARIOS_AUDITOR, COMENTARIOS_EMPATE, PREGUNTAS_VOTO, type PreguntaVoto } from "../contenido/votaciones.ts";

export const FRANJA_PRUEBA_MS = 4 * 60_000;
const DIA_MS = 86_400_000;
/** Lima está en UTC-5 todo el año (sin horario de verano). */
const LIMA_MS = -5 * 3_600_000;

export interface Ronda {
  clave: string;
  pregunta: PreguntaVoto;
  abre: number;
  cierra: number;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Pregunta de la ronda n: recorre el catálogo en un orden propio de cada temporada (sin repetir hasta agotarlo). */
export function preguntaDe(seasonId: string, n: number): PreguntaVoto {
  const N = PREGUNTAS_VOTO.length;
  const paso = [1, 5, 7, 11, 13].find((p) => N % p !== 0) ?? 1;
  const inicio = hash(seasonId) % N;
  return PREGUNTAS_VOTO[(((inicio + n * paso) % N) + N) % N];
}

export function rondaEn(seasonId: string, ahora: number, prueba: boolean, dia: number, desplazamiento = 0): Ronda {
  if (prueba) {
    const n = Math.floor(ahora / FRANJA_PRUEBA_MS) + desplazamiento;
    return { clave: `p${n}`, pregunta: preguntaDe(seasonId, n), abre: n * FRANJA_PRUEBA_MS, cierra: (n + 1) * FRANJA_PRUEBA_MS };
  }
  const d = dia + desplazamiento;
  const hoyLima = Math.floor((ahora + LIMA_MS) / DIA_MS) + desplazamiento;
  const abre = hoyLima * DIA_MS - LIMA_MS;
  return { clave: `d${d}`, pregunta: preguntaDe(seasonId, d - 1), abre, cierra: abre + DIA_MS };
}

export interface Conteo {
  id: string;
  votos: number;
}

/** Conteo ordenado (más votos primero; empate ⇒ orden estable por id). */
export function contar(votos: { target: string }[]): Conteo[] {
  const m = new Map<string, number>();
  for (const v of votos) m.set(v.target, (m.get(v.target) ?? 0) + 1);
  return [...m.entries()].map(([id, n]) => ({ id, votos: n })).sort((a, b) => b.votos - a.votos || a.id.localeCompare(b.id));
}

export function revelar(votaron: number, total: number, ahora: number, cierra: number) {
  return ahora >= cierra || (total >= 2 && votaron >= total);
}

export function comentario(conteo: Conteo[], nombre: (id: string) => string, semilla: string) {
  if (conteo.length === 0) return "Nadie votó. Lo registro como un acto de rebeldía colectiva.";
  const top = conteo[0];
  const empatados = conteo.filter((c) => c.votos === top.votos).length;
  const h = hash(semilla);
  if (empatados > 1) return COMENTARIOS_EMPATE[h % COMENTARIOS_EMPATE.length];
  return COMENTARIOS_AUDITOR[h % COMENTARIOS_AUDITOR.length].replaceAll("{n}", nombre(top.id)).replaceAll("{v}", String(top.votos));
}

/** Recompensa por votar (una vez por ronda; en temporada real, una ronda por día). */
export const RECOMPENSA_VOTO = { monedas: 10 };
