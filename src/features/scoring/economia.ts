/**
 * Sistema de precios del juego: una sola moneda para todo (decisión de Luis, 2026-11-09).
 * Todo lo que se gana y todo lo que cuesta, en un solo lugar y con tests de equilibrio
 * (`tests/economia.test.ts`): fisgonear no debe ser ni regalado ni imposible, y pasar una
 * pregunta siempre debe salir peor que responderla.
 *
 * Casas: 1 Calentamiento · 2 La manada · 3 Amor y relaciones · 4 Picante · 5 Juicio final.
 * El ranking es el saldo de monedas: lo que gastas (fisgonear, pasar) te baja de puesto.
 */
import { GIFT_CATCHER } from "./reglas.ts";

export type Casa = 1 | 2 | 3 | 4 | 5 | 6;

/** Lo que se GANA. */
export const GANANCIAS = {
  /** Por minijuego y día: 20 por jugar + hasta 80 por resultado (mejor partida del día). */
  minijuegoDia: GIFT_CATCHER.topeDiario,
  minijuegosPorDia: 3,
  /** Votar en el Tablón (Snowville). */
  voto: 10,
  /** La manada: por responder, y extra si coincides con la mayoría (al cierre del día). */
  manadaResponder: 10,
  manadaCoincidir: 15,
  /** Por cada pregunta respondida. */
  amor: 20,
  picante: 30,
  /** Juicio final: por dar tu veredicto, y extra si coincides con el jurado (al cierre del día). */
  juicioResponder: 15,
  juicioCoincidir: 15,
  /** Corazón: por cada respuesta (una pregunta bonita por día). */
  corazon: 20,
  /** Bono por terminar todo lo del día en todas las casas. */
  bonoAlDia: 30,
} as const;

/** Preguntas (o retos) nuevos por día en cada casa. */
export const POR_DIA: Record<Casa, number> = { 1: 3, 2: 1, 3: 2, 4: 2, 5: 1, 6: 1 };

/** Lo que CUESTA abrir un sobre de tu amigo secreto (más íntimo = más caro). */
export const FISGONEAR: Record<2 | 3 | 4 | 6, number> = { 2: 50, 3: 100, 4: 150, 6: 80 };

/** Lo que cuesta PASAR una pregunta. Solo Amor y Picante tienen "Paso". */
export const PASAR: Record<3 | 4, number> = { 3: 40, 4: 60 };

/** Pases por casa en toda la temporada. */
export const PASES_POR_CASA = 6;

/** Sin pases, dejar vencer una pregunta de Amor o Picante cuesta el doble. */
export const MULTIPLICADOR_SIN_PASES = 2;

/** Dejar vencer (no responder antes de las 23:59) en casas sin "Paso". */
export const VENCIDA_SIN_PASO: Record<1 | 2 | 5 | 6, number> = { 1: 0, 2: 15, 5: 15, 6: 15 };

const conPaso = (c: Casa): c is 3 | 4 => c === 3 || c === 4;

/** ¿Se puede pasar esta pregunta y cuánto cuesta? */
export function costoPasar(casa: Casa, pasesUsados: number) {
  if (!conPaso(casa)) return { permitido: false as const, motivo: "Esta casa no tiene “Paso”." };
  if (pasesUsados >= PASES_POR_CASA) return { permitido: false as const, motivo: `Ya usaste tus ${PASES_POR_CASA} pases de esta casa.` };
  return { permitido: true as const, monedas: PASAR[casa], quedan: PASES_POR_CASA - pasesUsados - 1 };
}

/**
 * Qué pasa si una pregunta vence sin responder. En Amor y Picante cuenta como un pase (si no,
 * dejarla vencer sería un "Paso" gratis e ilimitado); sin pases, cuesta el doble.
 */
export function costoVencida(casa: Casa, pasesUsados: number) {
  if (!conPaso(casa)) return { monedas: VENCIDA_SIN_PASO[casa], gastaPase: false };
  if (pasesUsados < PASES_POR_CASA) return { monedas: PASAR[casa], gastaPase: true };
  return { monedas: PASAR[casa] * MULTIPLICADOR_SIN_PASES, gastaPase: false };
}

/** Ganancia por responder una pregunta de cada casa (sin contar el extra de la manada). */
export function gananciaPorRespuesta(casa: Casa) {
  return { 1: 0, 2: GANANCIAS.manadaResponder, 3: GANANCIAS.amor, 4: GANANCIAS.picante, 5: GANANCIAS.juicioResponder, 6: GANANCIAS.corazon }[casa];
}

export interface PerfilDia {
  /** Qué tan bien juega los minijuegos (0 = solo participa, 1 = máximo). */
  rendimiento: number;
  /** Probabilidad de coincidir con la mayoría en La manada. */
  coincide: number;
  /** Quien no aceptó las preguntas picantes no recibe esa casa (ni gana ni paga ahí). */
  juegaPicante: boolean;
}

/** Monedas que gana en un día alguien que hace TODO lo del día. */
export function gananciaDiaria({ rendimiento, coincide, juegaPicante }: PerfilDia) {
  const r = Math.min(1, Math.max(0, rendimiento));
  const minijuegos = GANANCIAS.minijuegosPorDia * (GIFT_CATCHER.monedasPorJugar + Math.round(GIFT_CATCHER.monedasResultadoMax * r));
  const manada = GANANCIAS.manadaResponder + Math.round(GANANCIAS.manadaCoincidir * coincide);
  const amor = POR_DIA[3] * GANANCIAS.amor;
  const picante = juegaPicante ? POR_DIA[4] * GANANCIAS.picante : 0;
  const juicio = GANANCIAS.juicioResponder + Math.round(GANANCIAS.juicioCoincidir * coincide);
  return minijuegos + GANANCIAS.voto + manada + amor + picante + juicio + POR_DIA[6] * GANANCIAS.corazon + GANANCIAS.bonoAlDia;
}

/** Jugador "promedio" que se usa para equilibrar precios y para mostrar ejemplos. */
export const DIA_TIPICO: PerfilDia = { rendimiento: 0.6, coincide: 0.5, juegaPicante: true };

/** Lo que costaría abrir TODOS los sobres nuevos de un día de tu amigo (menos el gratis, el más caro). */
export function costoFisgonearTodoElDia() {
  const sobres = [FISGONEAR[2], FISGONEAR[3], FISGONEAR[3], FISGONEAR[4], FISGONEAR[4], FISGONEAR[6]];
  return sobres.reduce((a, b) => a + b, 0) - Math.max(...sobres);
}
