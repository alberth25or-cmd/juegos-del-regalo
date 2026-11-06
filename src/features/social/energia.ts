/**
 * Energía navideña — «Los 20 contra el desastre» (reglas puras).
 *
 * Toda la XP que gana cualquiera (Gift Catcher, Memory, trivia, votar…) es energía para
 * encender el árbol de la plaza. La meta escala con el grupo: 500 por jugador activo
 * (10 000 con 20 personas, como pide el documento), mínimo 3 000.
 */
export const ENERGIA_POR_JUGADOR = 500;
export const ENERGIA_MINIMA = 3000;
export const HITOS = [25, 50, 75, 100] as const;
export const BONO_ARBOL = { coins: 50 };

export function metaEnergia(activos: number) {
  return Math.max(ENERGIA_MINIMA, ENERGIA_POR_JUGADOR * Math.max(0, activos));
}

export function porcentaje(energia: number, meta: number) {
  if (meta <= 0) return 0;
  return Math.max(0, Math.min(100, Math.floor((energia / meta) * 100)));
}

/** Hitos alcanzados que todavía no se anunciaron. */
export function hitosNuevos(pct: number, anunciados: readonly number[]) {
  return HITOS.filter((h) => pct >= h && !anunciados.includes(h));
}

export const MENSAJE_HITO: Record<(typeof HITOS)[number], string> = {
  25: "El árbol de la plaza parpadea. Pepe dice que es un avance sindical.",
  50: "¡Medio árbol encendido! El Auditor aprobó el gasto de luz… a regañadientes.",
  75: "El árbol brilla tanto que Rudolf se siente amenazado. ¡Falta poco!",
  100: "¡EL ÁRBOL DE SNOWVILLE ESTÁ ENCENDIDO! Santa repartió 50 monedas a cada uno.",
};
