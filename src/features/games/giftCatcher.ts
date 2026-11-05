/**
 * Gift Catcher — Santa en bancarrota. Reglas compartidas por el navegador (para
 * jugar) y el servidor (para validar). La lluvia de objetos sale de una semilla
 * que crea el servidor, así el servidor sabe exactamente qué cayó y cuánto valía.
 */
import { crearAzar } from "../azar.ts";

export const DURACION_MS = 60_000;
export const DURACION_MIN_MS = 55_000;
export const DURACION_MAX_CLIENTE_MS = 66_000;
/** Una partida puede quedar abierta hasta 10 min (pausas, llamadas, mala señal). */
export const PARTIDA_ABIERTA_MAX_MS = 600_000;

export type TipoObjeto = "regalo" | "dorado" | "factura" | "carbon" | "caja";

export const OBJETOS: Record<TipoObjeto, { valor: number; bueno: boolean; nombre: string }> = {
  regalo: { valor: 10, bueno: true, nombre: "Regalo" },
  dorado: { valor: 25, bueno: true, nombre: "Regalo dorado" },
  factura: { valor: -15, bueno: false, nombre: "Factura de Santa" },
  carbon: { valor: -10, bueno: false, nombre: "Carbón" },
  caja: { valor: -5, bueno: false, nombre: "Caja defectuosa" },
};

export interface Caida {
  /** índice estable del objeto */
  i: number;
  tipo: TipoObjeto;
  /** ms desde el inicio en que aparece arriba */
  t: number;
  /** posición horizontal 0..1 */
  x: number;
  /** ms que tarda en llegar al suelo */
  caida: number;
}

/** Fase de dificultad: cada 15 s llueve más rápido. */
export function fase(ms: number) {
  return Math.min(3, Math.floor(ms / 15_000));
}

const INTERVALO = [720, 560, 440, 350];
const CAIDA = [2600, 2250, 1950, 1700];

/** Toda la lluvia de una partida (≈130 objetos), determinística por semilla. */
export function generarLluvia(seed: number, duracionMs = DURACION_MS): Caida[] {
  const azar = crearAzar(seed);
  const out: Caida[] = [];
  let t = 600;
  let i = 0;
  while (t < duracionMs - 400) {
    const f = fase(t);
    const r = azar();
    const tipo: TipoObjeto = r < 0.55 ? "regalo" : r < 0.63 ? "dorado" : r < 0.78 ? "factura" : r < 0.9 ? "carbon" : "caja";
    out.push({ i, tipo, t: Math.round(t), x: 0.07 + azar() * 0.86, caida: Math.round(CAIDA[f] * (0.9 + azar() * 0.25)) });
    i++;
    t += INTERVALO[f] * (0.75 + azar() * 0.5);
  }
  return out;
}

/** Multiplicador de combo: cada 5 regalos seguidos sube (x1, x2, x3 máx.). */
export function multiplicador(racha: number) {
  return Math.min(3, 1 + Math.floor(racha / 5));
}

export interface Resumen {
  puntaje: number;
  atrapados: Record<TipoObjeto, number>;
  rachaMax: number;
}

/**
 * Calcula el puntaje a partir de los índices atrapados. Se recorre en orden de
 * llegada al suelo; un regalo que cae sin atrapar corta la racha. Nunca baja de 0.
 */
export function puntuar(lluvia: readonly Caida[], atrapadosIdx: readonly number[]): Resumen {
  const atrapado = new Set(atrapadosIdx);
  const atrapados: Record<TipoObjeto, number> = { regalo: 0, dorado: 0, factura: 0, carbon: 0, caja: 0 };
  let puntaje = 0;
  let racha = 0;
  let rachaMax = 0;
  const porLlegada = [...lluvia].sort((a, b) => a.t + a.caida - (b.t + b.caida) || a.i - b.i);
  for (const c of porLlegada) {
    const o = OBJETOS[c.tipo];
    if (atrapado.has(c.i)) {
      atrapados[c.tipo]++;
      if (o.bueno) {
        puntaje += o.valor * multiplicador(racha);
        racha++;
        rachaMax = Math.max(rachaMax, racha);
      } else {
        racha = 0;
        puntaje = Math.max(0, puntaje + o.valor);
      }
    } else if (o.bueno) {
      racha = 0;
    }
  }
  return { puntaje, atrapados, rachaMax };
}

/** Puntaje máximo posible con esta semilla (atrapar todo lo bueno y nada malo). */
export function puntajeMaximo(lluvia: readonly Caida[]) {
  return puntuar(
    lluvia,
    lluvia.filter((c) => OBJETOS[c.tipo].bueno).map((c) => c.i),
  ).puntaje;
}

export type Rechazo = "partida-corta" | "partida-vencida" | "duracion-invalida" | "indices-invalidos" | "puntaje-no-coincide";

/**
 * Validación del servidor. `transcurridoMs` lo mide el servidor (ahora − inicio);
 * `duracionMs`, `atrapados` y `puntaje` los manda el navegador.
 */
export function validarPartida(input: {
  seed: number;
  transcurridoMs: number;
  duracionMs: unknown;
  atrapados: unknown;
  puntaje: unknown;
}): { ok: true; resumen: Resumen } | { ok: false; motivo: Rechazo } {
  if (input.transcurridoMs < DURACION_MIN_MS) return { ok: false, motivo: "partida-corta" };
  if (input.transcurridoMs > PARTIDA_ABIERTA_MAX_MS) return { ok: false, motivo: "partida-vencida" };
  const dur = input.duracionMs;
  if (typeof dur !== "number" || !Number.isFinite(dur) || dur < DURACION_MIN_MS || dur > DURACION_MAX_CLIENTE_MS)
    return { ok: false, motivo: "duracion-invalida" };
  const lluvia = generarLluvia(input.seed);
  const idx = input.atrapados;
  if (
    !Array.isArray(idx) ||
    idx.length > lluvia.length ||
    !idx.every((n) => Number.isInteger(n) && n >= 0 && n < lluvia.length) ||
    new Set(idx).size !== idx.length
  )
    return { ok: false, motivo: "indices-invalidos" };
  // No se puede atrapar algo que aún no había aparecido cuando terminó la partida.
  const fin = Math.min(dur, input.transcurridoMs) + 300;
  if ((idx as number[]).some((n) => lluvia[n].t > fin)) return { ok: false, motivo: "indices-invalidos" };
  const resumen = puntuar(lluvia, idx as number[]);
  if (resumen.puntaje !== input.puntaje) return { ok: false, motivo: "puntaje-no-coincide" };
  return { ok: true, resumen };
}

export const MOTIVOS: Record<Rechazo, string> = {
  "partida-corta": "La partida terminó demasiado rápido.",
  "partida-vencida": "La partida estuvo abierta demasiado tiempo. Empieza otra.",
  "duracion-invalida": "La duración de la partida no es válida.",
  "indices-invalidos": "Los datos de la partida no son válidos.",
  "puntaje-no-coincide": "El puntaje no coincide con lo que cayó.",
};
