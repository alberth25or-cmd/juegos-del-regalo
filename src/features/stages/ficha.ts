/**
 * Ficha del amigo secreto: reglas puras (decisión de Luis, 2026-11-09).
 *
 * - Una sola moneda para todo: las MONEDAS. Se ganan jugando y respondiendo, el ranking es
 *   tu saldo y quien más tiene al final gana el premio. Fisgonear gasta monedas, así que la
 *   curiosidad cuesta puestos en el ranking.
 * - La ficha se llena sola: cada respuesta de tu amigo secreto aparece como un sobre cerrado
 *   (ves la pregunta, no la respuesta). Cada día se abre un sobre gratis; los demás cuestan.
 * - La ficha final destaca "lo más picante": las respuestas con más picor y más raras.
 *
 * El servidor es el único que decide qué sobres están abiertos: una respuesta cerrada nunca
 * viaja al navegador.
 */

import { FISGONEAR } from "../scoring/economia.ts";

/** Casas con respuestas que se pueden fisgonear. */
export type CasaConRespuestas = 2 | 3 | 4;

/** Precio en monedas de abrir un sobre, por casa (más íntimo = más caro). Vive en economia.ts. */
export const PRECIO_FISGONEO: Record<CasaConRespuestas, number> = FISGONEAR;

/** Sobres que se abren gratis cada día. */
export const SOBRES_GRATIS_POR_DIA = 1;

/** Cuántas respuestas destaca la ficha final. */
export const DESTACADAS_FINAL = 3;

export interface RespuestaFicha {
  id: string;
  casa: CasaConRespuestas;
  pregunta: string;
  /** null = "Pasó" (no hay nada que fisgonear, se ve gratis). */
  respuesta: string | null;
  /** Picor de la pregunta, marcado al escribir el banco: 1 suave · 2 medio · 3 picante. */
  picor: 1 | 2 | 3;
  /** Qué parte del grupo dio la misma respuesta (0..1). Sin dato = 0.5. */
  igualQue?: number;
}

/** Precio de un sobre; un "Pasó" no cuesta nada. */
export function precio(r: RespuestaFicha) {
  return r.respuesta === null ? 0 : PRECIO_FISGONEO[r.casa];
}

/**
 * Qué tan "chismosa" es una respuesta: el picor de la pregunta pesa más, y la rareza suma
 * (si casi nadie respondió lo mismo, sorprende más). Un "Pasó" no cuenta.
 */
export function puntajePicante(r: RespuestaFicha) {
  if (r.respuesta === null) return -1;
  const rareza = 1 - Math.min(1, Math.max(0, r.igualQue ?? 0.5));
  return r.picor * 2 + rareza * 2;
}

/** Las respuestas que destaca la ficha final, de la más picante a la menos. */
export function masPicantes(rs: RespuestaFicha[], n = DESTACADAS_FINAL) {
  return rs
    .filter((r) => r.respuesta !== null)
    .map((r, i) => ({ r, i, p: puntajePicante(r) }))
    .sort((a, b) => b.p - a.p || a.i - b.i)
    .slice(0, n)
    .map((x) => x.r);
}

/** ¿Alcanza el saldo para abrir este sobre? */
export function puedePagar(saldo: number, r: RespuestaFicha) {
  return saldo >= precio(r);
}
