/**
 * Tabla de puntuación central (la aplica el servidor; el navegador solo la muestra).
 * XP = progreso, monedas = cosméticos, puntos = ranking. Separados a propósito.
 */

/** Puntaje de Gift Catcher que equivale a una "muy buena partida" (80 pts de resultado). */
export const GIFT_REFERENCIA = 650;
/** Lo mismo para los otros juegos (cada uno tiene su escala de puntaje). */
export const MEMORY_REFERENCIA = 850;
export const TRIVIA_REFERENCIA = 750;

export const GIFT_CATCHER = {
  puntosPorJugar: 20,
  puntosResultadoMax: 80,
  topeDiario: 100,
  xpBase: 10,
  xpMax: 60,
  monedasBase: 5,
  monedasMax: 30,
} as const;

/** Recompensa de CADA partida validada (XP y monedas; no entra al ranking). */
export function recompensaPartida(puntaje: number, referencia = GIFT_REFERENCIA) {
  // Cada juego tiene su propia escala: se normaliza a la de Gift Catcher.
  const p = Math.max(0, Math.floor((puntaje * GIFT_REFERENCIA) / referencia));
  return {
    xp: Math.min(GIFT_CATCHER.xpMax, GIFT_CATCHER.xpBase + Math.floor(p / 20)),
    coins: Math.min(GIFT_CATCHER.monedasMax, GIFT_CATCHER.monedasBase + Math.floor(p / 50)),
  };
}

/**
 * Puntos de ranking del DÍA según el MEJOR puntaje del día:
 * 20 por participar + hasta 80 por resultado. Nunca pasa del tope diario.
 */
export function puntosDelDia(mejorPuntaje: number, referencia = GIFT_REFERENCIA) {
  const p = Math.max(0, mejorPuntaje);
  const resultado = Math.min(GIFT_CATCHER.puntosResultadoMax, Math.round((GIFT_CATCHER.puntosResultadoMax * p) / referencia));
  return Math.min(GIFT_CATCHER.topeDiario, GIFT_CATCHER.puntosPorJugar + resultado);
}

/** Puntos nuevos a otorgar: diferencia contra lo ya otorgado hoy (nunca negativo). */
export function deltaPuntos(mejorPuntaje: number, yaOtorgadoHoy: number, referencia = GIFT_REFERENCIA) {
  return Math.max(0, puntosDelDia(mejorPuntaje, referencia) - yaOtorgadoHoy);
}

/** Nivel según XP: nivel 2 a los 50, 3 a los 200, 4 a los 450… */
export function nivel(xp: number) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}

export function xpParaNivel(n: number) {
  return 50 * (n - 1) ** 2;
}

/**
 * Ranking de equipos: promedio de puntos por integrante ACTIVO (no la suma),
 * para que un equipo no gane solo porque dos personas juegan muchísimo.
 */
export function promedioEquipo(puntosIntegrantes: readonly number[]) {
  if (puntosIntegrantes.length === 0) return 0;
  return Math.round((puntosIntegrantes.reduce((a, b) => a + b, 0) / puntosIntegrantes.length) * 10) / 10;
}
