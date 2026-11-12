/**
 * Reglas puras del juego de las casas (sin base de datos; las usa el servidor y los tests).
 */
import { crearAzar, mezclar } from "../azar.ts";
import { CASOS_JUICIO, PLATOS, PREGUNTAS_CORAZON, PREGUNTAS_CORAZON_PROFUNDAS, PREGUNTAS_AMOR, PREGUNTAS_MANADA, PREGUNTAS_PICANTE, VEREDICTOS, type PreguntaAbierta, type PreguntaManada } from "../contenido/casas.ts";

/** Semilla estable a partir de un texto (FNV-1a). */
export function semilla(texto: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Primer lote de cada banco (lo que ya estaba cuando se publicó). Cada lote se mezcla aparte y
 * los nuevos van después: así, agregar preguntas al final de un banco NO cambia las preguntas de
 * los días ya jugados de una temporada en curso. Al agregar un lote nuevo, sumar su corte aquí.
 */
const LOTES: Record<string, number[]> = { manada: [45], amor: [50], picante: [50], juicio: [45], corazon: [30, 50], corazonProfundo: [30] };

function orden<T>(lista: readonly T[], seasonId: string, casa: string) {
  const cortes = [0, ...(LOTES[casa] ?? []).filter((c) => c < lista.length), lista.length];
  const out: T[] = [];
  for (let i = 0; i + 1 < cortes.length; i++) {
    const lote = lista.slice(cortes[i], cortes[i + 1]);
    out.push(...mezclar(lote, crearAzar(semilla(i === 0 ? `${seasonId}:${casa}` : `${seasonId}:${casa}:${i}`))));
  }
  return out;
}

/** Días del juego: desde el día de la temporada en que se apretó "Empezar" hasta el último. */
export interface Plan {
  /** Día de la temporada en que empezó el juego (el "día 1" del juego). */
  inicio: number;
  /** Cuántos días dura el juego. */
  total: number;
}

export type Banco = "manada" | "amor" | "picante" | "corazon" | "corazonProfundo" | "juicio";
export type Fase = "normal" | "final";

/**
 * Preguntas por día que se QUIEREN en cada fase (decisión de Luis, 2026-11-12):
 * - normal: La manada 1 · Amor 2 · Picante 2 · Corazón 2 · Juicio 1;
 * - recta final: menos picante y más corazón (Corazón profundo 3, Amor 1, Picante 1).
 */
export const DESEADO: Record<Fase, Record<Banco, number>> = {
  normal: { manada: 1, amor: 2, picante: 2, corazon: 2, corazonProfundo: 0, juicio: 1 },
  final: { manada: 1, amor: 1, picante: 1, corazon: 0, corazonProfundo: 3, juicio: 1 },
};

const BANCOS: Record<Banco, readonly { id: string }[]> = {
  manada: PREGUNTAS_MANADA,
  amor: PREGUNTAS_AMOR,
  picante: PREGUNTAS_PICANTE,
  corazon: PREGUNTAS_CORAZON,
  corazonProfundo: PREGUNTAS_CORAZON_PROFUNDAS,
  juicio: CASOS_JUICIO,
};

/** Días de la recta final: ~la cuarta parte del juego (8 de 30), entre 3 y 10. */
export function diasFinal(total: number) {
  if (total <= 3) return 1;
  return Math.min(10, Math.max(3, Math.round(total * 0.25)));
}

export function faseDe(g: number, total: number): Fase {
  return g > total - diasFinal(total) ? "final" : "normal";
}

/**
 * Cuántas preguntas de un banco salen cada día del juego (índice 0 = día 1), según la duración.
 * Si el banco alcanza, se usa lo deseado. Si no alcanza (temporada larga), se reparte el banco
 * entero a lo largo de los días respetando el peso de cada fase, con al menos 1 por día: así no se
 * repite ninguna pregunta mientras el banco tenga al menos una por día.
 */
export function conteos(banco: Banco, total: number): number[] {
  const n = Math.max(1, Math.floor(total));
  const tam = BANCOS[banco].length;
  const des = Array.from({ length: n }, (_, i) => DESEADO[faseDe(i + 1, n)][banco]);
  const suma = des.reduce((a, b) => a + b, 0);
  if (suma <= tam) return des;
  // No alcanza: 1 por día asegurado y el resto del banco se reparte según el peso extra de cada día.
  const dias = des.filter((x) => x > 0).length;
  if (tam <= dias) return des.map((x) => (x > 0 ? 1 : 0)); // ni 1 por día: habrá repetidas
  const extra = tam - dias;
  const peso = des.map((x) => Math.max(0, x - 1));
  const sumaPeso = peso.reduce((a, b) => a + b, 0);
  let acum = 0;
  let previo = 0;
  return des.map((x, i) => {
    if (!x) return 0;
    acum += peso[i];
    const objetivo = sumaPeso ? Math.round((acum * extra) / sumaPeso) : 0;
    const mas = objetivo - previo;
    previo = objetivo;
    return 1 + mas;
  });
}

/** ¿Alcanza cada banco para toda la temporada? (para avisar al organizador). */
export function cobertura(total: number) {
  return (Object.keys(BANCOS) as Banco[]).map((b) => {
    const usadas = conteos(b, total).reduce((a, c) => a + c, 0);
    return { banco: b, preguntas: BANCOS[b].length, usadas, faltan: Math.max(0, usadas - BANCOS[b].length) };
  });
}

export interface PreguntasDelDia {
  fase: Fase;
  manada: PreguntaManada;
  amor: PreguntaAbierta[];
  picante: PreguntaAbierta[];
  juicio: { id: string; texto: string };
  /** Corazón del día (ligeras en la fase normal; profundas en la recta final). */
  corazon: { id: string; texto: string }[];
}

/**
 * Preguntas del día `dia` (día de la temporada) según el plan del juego. Cada temporada tiene su
 * propio orden (mezcla con semilla) y cada día toma la siguiente tanda de cada banco, con la
 * cantidad que marca `conteos` para su duración. Si el organizador cambia la duración a mitad de
 * temporada, el reparto de los días que faltan se recalcula (los días pasados se respetan al
 * cobrar: ver `liquidar` en el servidor).
 */
export function preguntasDelDia(seasonId: string, dia: number, plan: Plan): PreguntasDelDia {
  const total = Math.max(1, Math.floor(plan.total));
  const g = Math.min(total, Math.max(1, Math.floor(dia) - plan.inicio + 1));
  const tanda = <T>(banco: Banco, lista: readonly T[]): T[] => {
    const cs = conteos(banco, total);
    const desde = cs.slice(0, g - 1).reduce((a, c) => a + c, 0);
    const orden_ = orden(lista, seasonId, banco);
    return Array.from({ length: cs[g - 1] }, (_, k) => orden_[(desde + k) % orden_.length]);
  };
  const fase = faseDe(g, total);
  return {
    fase,
    manada: tanda("manada", PREGUNTAS_MANADA)[0] ?? PREGUNTAS_MANADA[0],
    amor: tanda("amor", PREGUNTAS_AMOR),
    picante: tanda("picante", PREGUNTAS_PICANTE),
    juicio: tanda("juicio", CASOS_JUICIO)[0] ?? CASOS_JUICIO[0],
    corazon: fase === "final" ? tanda("corazonProfundo", PREGUNTAS_CORAZON_PROFUNDAS) : tanda("corazon", PREGUNTAS_CORAZON),
  };
}

/** Sorteo: cada uno le regala al siguiente de una ronda mezclada (nadie se regala a sí mismo). */
export function sortear(ids: readonly string[], azar: () => number): { giver: string; receiver: string }[] {
  if (ids.length < 2) return [];
  const ronda = mezclar(ids, azar);
  return ronda.map((giver, i) => ({ giver, receiver: ronda[(i + 1) % ronda.length] }));
}

/** Alias libre al azar ("Agente <plato>"); si se acaban los platos, agrega un número. */
export function aliasLibre(usados: ReadonlySet<string>, azar: () => number) {
  const libres = PLATOS.map((p) => `Agente ${p}`).filter((a) => !usados.has(a));
  if (libres.length) return libres[Math.floor(azar() * libres.length)];
  for (let n = 2; ; n++) {
    const a = `Agente ${PLATOS[Math.floor(azar() * PLATOS.length)]} ${n}`;
    if (!usados.has(a)) return a;
  }
}

// ------------------------------------------------------------------ ficha de inscripción

export const DATOS_FICHA = [
  { id: "genero", label: "Género", opciones: ["Hombre", "Mujer", "Prefiero no decir"] },
  { id: "lentes", label: "¿Usas lentes?", opciones: ["Sí", "No"] },
  { id: "estatura", label: "Estatura", opciones: ["Alto", "Medio", "Bajo"] },
  { id: "cabello", label: "Cabello", opciones: ["Corto", "Largo", "Sin cabello"] },
] as const;

export interface Ficha {
  regalos: string[];
  datos: Record<string, string>;
}

const limpio = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

/** Valida la ficha que manda el navegador. 3 o 4 regalos, los 4 datos y un rasgo opcional. */
export function validarFicha(regalosIn: unknown, datosIn: unknown): { ok: true; ficha: Ficha } | { ok: false; error: string } {
  const regalos = (Array.isArray(regalosIn) ? regalosIn : []).map((r) => limpio(r, 60)).filter(Boolean);
  if (regalos.length < 3 || regalos.length > 4) return { ok: false, error: "Escribe 3 o 4 opciones de regalo." };
  if (regalos.some((r) => r.length < 3)) return { ok: false, error: "Cada opción de regalo necesita al menos 3 letras." };
  const d = datosIn && typeof datosIn === "object" ? (datosIn as Record<string, unknown>) : {};
  const datos: Record<string, string> = {};
  for (const campo of DATOS_FICHA) {
    const v = limpio(d[campo.id], 30);
    if (!(campo.opciones as readonly string[]).includes(v)) return { ok: false, error: `Elige una opción en "${campo.label}".` };
    datos[campo.id] = v;
  }
  const rasgo = limpio(d.rasgo, 60);
  if (rasgo) datos.rasgo = rasgo;
  return { ok: true, ficha: { regalos, datos } };
}

// ------------------------------------------------------------------ respuestas

/** Valida una respuesta según la casa. Devuelve el texto a guardar o un error. */
export function validarRespuesta(casa: 2 | 3 | 4 | 5 | 6, valor: unknown, opciones?: readonly string[]): { ok: true; texto: string } | { ok: false; error: string } {
  if (casa === 6) {
    const t = limpio(valor, 120);
    if (t.length < 2) return { ok: false, error: "Escribe tu respuesta (hasta 2 líneas)." };
    return { ok: true, texto: t };
  }
  if (casa === 5) {
    if (!(VEREDICTOS as readonly unknown[]).includes(valor)) return { ok: false, error: "Elige Culpable o Inocente." };
    return { ok: true, texto: valor as string };
  }
  if (casa === 2) {
    const i = typeof valor === "number" ? valor : Number.NaN;
    if (!Number.isInteger(i) || !opciones || i < 0 || i >= opciones.length) return { ok: false, error: "Elige una de las opciones." };
    return { ok: true, texto: String(i) };
  }
  if (casa === 4) {
    if (valor !== "Sí" && valor !== "No") return { ok: false, error: "Responde Sí o No." };
    return { ok: true, texto: valor };
  }
  const t = limpio(valor, 40);
  if (t.length < 1) return { ok: false, error: "Escribe una respuesta corta." };
  return { ok: true, texto: t };
}

/** Para comparar respuestas de texto ("3", " tres "): minúsculas, sin tildes ni espacios extra. */
export function normalizar(t: string) {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Opciones ganadoras de La manada (todas las empatadas en el máximo). */
export function mayoria(respuestas: readonly string[]): Set<string> {
  const c = new Map<string, number>();
  for (const r of respuestas) c.set(r, (c.get(r) ?? 0) + 1);
  const max = Math.max(0, ...c.values());
  return new Set([...c].filter(([, n]) => n === max && max > 0).map(([r]) => r));
}

/** Qué parte del grupo dio la misma respuesta que `mia` (0..1). */
export function igualQue(mia: string, todas: readonly string[]) {
  if (!todas.length) return 0.5;
  const m = normalizar(mia);
  return todas.filter((t) => normalizar(t) === m).length / todas.length;
}
