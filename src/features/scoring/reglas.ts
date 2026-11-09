/**
 * Tabla de recompensas de los minijuegos (la aplica el servidor; el navegador solo la muestra).
 *
 * UNA SOLA MONEDA (decisión de Luis, 2026-11-09): todo se gana y se gasta en monedas, y el
 * ranking es la suma de monedas. Ya no hay XP ni puntos aparte. El resto de precios y
 * ganancias (casas, fisgoneo, pases) vive en `economia.ts`.
 *
 * Historia: el ledger conserva las columnas `points` y `xp` de antes; la vista `cc.v_totals`
 * cuenta `points + coins` como monedas (lo que antes eran puntos de ranking pasó a monedas).
 * Lo nuevo se escribe solo en `coins`.
 */

/** Puntaje de Gift Catcher que equivale a una "muy buena partida" (80 monedas de resultado). */
export const GIFT_REFERENCIA = 650;
/** Lo mismo para los otros juegos (cada uno tiene su escala de puntaje). */
export const MEMORY_REFERENCIA = 850;
export const TRIVIA_REFERENCIA = 750;

export const GIFT_CATCHER = {
  monedasPorJugar: 20,
  monedasResultadoMax: 80,
  topeDiario: 100,
} as const;

/**
 * Monedas del DÍA en un minijuego según el MEJOR puntaje del día:
 * 20 por jugar + hasta 80 por resultado. Nunca pasa del tope diario (repetir sube tu récord,
 * no tus monedas).
 */
export function monedasDelDia(mejorPuntaje: number, referencia = GIFT_REFERENCIA) {
  const p = Math.max(0, mejorPuntaje);
  const resultado = Math.min(GIFT_CATCHER.monedasResultadoMax, Math.round((GIFT_CATCHER.monedasResultadoMax * p) / referencia));
  return Math.min(GIFT_CATCHER.topeDiario, GIFT_CATCHER.monedasPorJugar + resultado);
}

/** Monedas nuevas a otorgar: diferencia contra lo ya otorgado hoy (nunca negativo). */
export function deltaMonedas(mejorPuntaje: number, yaOtorgadoHoy: number, referencia = GIFT_REFERENCIA) {
  return Math.max(0, monedasDelDia(mejorPuntaje, referencia) - yaOtorgadoHoy);
}

/**
 * Ranking de equipos: promedio de monedas por integrante ACTIVO (no la suma),
 * para que un equipo no gane solo porque dos personas juegan muchísimo.
 */
export function promedioEquipo(monedasIntegrantes: readonly number[]) {
  if (monedasIntegrantes.length === 0) return 0;
  return Math.round((monedasIntegrantes.reduce((a, b) => a + b, 0) / monedasIntegrantes.length) * 10) / 10;
}
