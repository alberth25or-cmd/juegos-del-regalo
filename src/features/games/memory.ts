/**
 * Memory Gifts — Memoria del desastre (reglas puras, mismas en navegador y servidor).
 *
 * 16 cartas = 8 pares. El mazo sale de la semilla que da el servidor. El navegador
 * manda la LISTA de cartas que volteó, en orden; el servidor la repite y calcula
 * movimientos y puntaje. El tiempo lo mide el servidor (no se puede mentir en eso).
 */
import { crearAzar, mezclar } from "../azar.ts";

export const PARES = 8;
export const CARTAS = PARES * 2;
/** Caras posibles (se eligen 8 por partida). Ids de sprites ya existentes en el juego. */
export const CARAS = ["regalo", "dorado", "factura", "carbon", "caja", "santa", "rudolf", "duende", "muneco", "auditor"] as const;
export type Cara = (typeof CARAS)[number];

export const MIN_MS_POR_MOVIMIENTO = 500;
export const MIN_MS = 6_000;
export const MAX_MS = 10 * 60_000;

/** Mazo de la partida: 16 caras (índice de carta → cara). */
export function mazo(seed: number): Cara[] {
  const azar = crearAzar(seed);
  const elegidas = mezclar(CARAS, azar).slice(0, PARES);
  return mezclar([...elegidas, ...elegidas], azar);
}

export interface ResumenMemory {
  puntaje: number;
  movimientos: number;
  segundos: number;
}

/** Puntaje: 1000 con la partida perfecta y rápida; baja con movimientos extra y con el tiempo. Mínimo 100. */
export function puntuarMemory(movimientos: number, ms: number) {
  const extra = Math.max(0, movimientos - PARES);
  const seg = Math.max(0, Math.round(ms / 1000) - 20);
  return Math.max(100, Math.min(1000, 1000 - extra * 30 - seg * 4));
}

export type RechazoMemory = "volteos-invalidos" | "sin-terminar" | "partida-corta" | "partida-vencida";

/** Repite los volteos sobre el mazo y valida que la partida sea posible y esté completa. */
export function validarMemory(input: { seed: number; transcurridoMs: number; volteos: unknown }): { ok: true; resumen: ResumenMemory } | { ok: false; motivo: RechazoMemory } {
  if (input.transcurridoMs > MAX_MS) return { ok: false, motivo: "partida-vencida" };
  const v = input.volteos;
  if (!Array.isArray(v) || v.length % 2 !== 0 || v.length > 400 || !v.every((n) => Number.isInteger(n) && n >= 0 && n < CARTAS)) return { ok: false, motivo: "volteos-invalidos" };
  const cartas = mazo(input.seed);
  const resuelta = new Set<number>();
  let movimientos = 0;
  for (let i = 0; i < v.length; i += 2) {
    const a = v[i] as number;
    const b = v[i + 1] as number;
    if (a === b || resuelta.has(a) || resuelta.has(b)) return { ok: false, motivo: "volteos-invalidos" };
    movimientos++;
    if (cartas[a] === cartas[b]) {
      resuelta.add(a);
      resuelta.add(b);
    }
  }
  if (resuelta.size !== CARTAS) return { ok: false, motivo: "sin-terminar" };
  if (input.transcurridoMs < Math.max(MIN_MS, movimientos * MIN_MS_POR_MOVIMIENTO)) return { ok: false, motivo: "partida-corta" };
  return { ok: true, resumen: { puntaje: puntuarMemory(movimientos, input.transcurridoMs), movimientos, segundos: Math.round(input.transcurridoMs / 1000) } };
}

export const MOTIVOS_MEMORY: Record<RechazoMemory, string> = {
  "volteos-invalidos": "Los movimientos no cuadran con el tablero.",
  "sin-terminar": "La partida no terminó: faltan pares.",
  "partida-corta": "Demasiado rápido para ser humano. El Auditor sospecha.",
  "partida-vencida": "La partida estuvo abierta demasiado tiempo.",
};
