import "server-only";
import postgres from "postgres";

/**
 * Conexión a Postgres (Supabase en producción, PGlite en local) SOLO desde el servidor.
 *
 * Reglas aprendidas a la mala:
 * - `postgres` 3.4.x. La 4.0 se colgaba con consultas en paralelo detrás del pooler.
 * - Pooler en modo transacción (POSTGRES_URL, puerto 6543) ⇒ `prepare: false`.
 * - Toda consulta tiene tope de tiempo (`conTope`): si algo se traba, la pantalla
 *   muestra un error con "reintentar" en vez de quedarse cargando para siempre.
 * - Vercel (Fluid) CONGELA la función entre visitas. Una conexión que quedó abierta
 *   puede despertar muerta: la consulta se escribe en un socket que nadie escucha y se
 *   cuelga hasta el tope (los "La lectura de sesión tardó más de 9 s" del 6 nov). Por eso:
 *   1. conexiones ociosas se cierran a los 5 s, y la función se mantiene viva hasta
 *      cerrarlas antes de congelarse (lo mismo que hace `attachDatabasePool` de Vercel,
 *      que no soporta la librería `postgres`);
 *   2. si una consulta se pasa del tope, se tira el pool entero (las conexiones muertas
 *      no vuelven solas) y las lecturas se reintentan una vez con conexión nueva.
 * - Con Fluid, VARIAS visitas comparten el mismo pool. Por eso el pool se cierra en orden
 *   (lo que otras visitas están consultando termina) y solo lo reinicia quien falló con el
 *   pool VIGENTE: antes, el reinicio de una visita cortaba la consulta de otra, esa otra
 *   reiniciaba de nuevo y cortaba el reintento de la primera ("CONNECTION_DESTROYED" del
 *   9 nov: jugadores con sesión veían Memory y Gift Catcher en modo demo).
 */

declare global {
  var __ccSql: ReturnType<typeof postgres> | undefined;
  /** Cuántas veces se reinició el pool: identifica "qué pool" usó cada consulta. */
  var __ccGen: number | undefined;
}

function generacion() {
  return globalThis.__ccGen ?? 0;
}

const OCIOSA_SEG = 5;

function connectionUrl() {
  const raw = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (!raw) return null;
  const url = new URL(raw);
  url.search = ""; // la integración agrega parámetros que el pooler no entiende
  return url;
}

export function hasDatabase() {
  return connectionUrl() !== null;
}

export function db() {
  if (!globalThis.__ccSql) {
    const url = connectionUrl();
    if (!url) throw new ErrorDeServicio("Base de datos no configurada (falta POSTGRES_URL).");
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    globalThis.__ccSql = postgres(url.toString(), {
      ssl: local ? false : "require",
      prepare: false,
      // PGlite (local) es un solo motor: con varias conexiones mezcla mensajes. En local, 1.
      max: local ? 1 : 5,
      idle_timeout: OCIOSA_SEG,
      max_lifetime: 60 * 5,
      connect_timeout: 5,
      keep_alive: 10,
      onnotice: () => {},
    });
  }
  return globalThis.__ccSql;
}

/**
 * Tira el pool (conexiones posiblemente muertas). La próxima consulta abre uno nuevo.
 * `gen` = generación del pool con el que falló la consulta: si ya se reinició, no se
 * vuelve a tirar (se tiraría el pool nuevo que otras visitas están usando).
 */
export function reiniciarPool(gen = generacion()) {
  if (gen !== generacion()) return;
  const viejo = globalThis.__ccSql;
  globalThis.__ccSql = undefined;
  globalThis.__ccGen = gen + 1;
  // Cierre en orden: lo que ya está corriendo termina; lo que siga colgado a los 5 s
  // (conexión muerta) se corta. Las consultas nuevas ya van al pool nuevo.
  if (viejo) void viejo.end({ timeout: 5 }).catch(() => {});
}

// ---- mantener viva la función hasta que se cierren las conexiones ociosas
let finOcioso: ReturnType<typeof setTimeout> | null = null;
let soltarOcioso: () => void = () => {};

function esperarCierreOcioso() {
  // Solo en Vercel (en local y en el build no hace falta).
  if (!process.env.VERCEL_URL || !process.env.VERCEL_REGION) return;
  const ctx = (globalThis as { [k: symbol]: { get?: () => { waitUntil?: (p: Promise<unknown>) => void } } | undefined })[
    Symbol.for("@vercel/request-context")
  ]?.get?.();
  if (!ctx?.waitUntil) return;
  if (finOcioso) {
    clearTimeout(finOcioso);
    soltarOcioso();
  }
  const p = new Promise<void>((r) => (soltarOcioso = r));
  finOcioso = setTimeout(() => {
    finOcioso = null;
    soltarOcioso();
  }, OCIOSA_SEG * 1000 + 200);
  ctx.waitUntil(p);
}

export type Sql = ReturnType<typeof db>;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Tx = postgres.TransactionSql<{}>;

/** Error esperado de infraestructura (BD caída o lenta): se muestra como "intenta otra vez". */
export class ErrorDeServicio extends Error {
  readonly status = 503;
}

export const TOPE_MS = 9000;

type Trabajo<T> = PromiseLike<T> & { cancel?: () => unknown };

class TopeVencido extends ErrorDeServicio {}

async function unIntento<T>(trabajo: Trabajo<T>, ms: number, etiqueta: string, gen: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      try {
        trabajo.cancel?.();
      } catch {}
      reject(new TopeVencido(`La ${etiqueta} tardó más de ${Math.round(ms / 1000)} s.`));
    }, ms);
  });
  try {
    return await Promise.race([trabajo, limite]);
  } catch (e) {
    // Tope vencido o conexión rota: las conexiones de ESE pool pueden estar muertas.
    if (e instanceof TopeVencido || conexionMuerta(e)) reiniciarPool(gen);
    throw e;
  } finally {
    clearTimeout(timer);
    esperarCierreOcioso();
  }
}

const codigo = (e: unknown) => (e as { code?: string } | null)?.code;

/** La conexión se rompió del lado de la red: el pool puede tener más conexiones muertas. */
function conexionMuerta(e: unknown) {
  const c = codigo(e);
  return c === "CONNECT_TIMEOUT" || c === "CONNECTION_CLOSED" || c === "ECONNRESET" || c === "EPIPE" || c === "ETIMEDOUT";
}

/**
 * Vale reintentar la lectura con un pool nuevo. Incluye ENDED/DESTROYED: los provoca un
 * reinicio NUESTRO (la consulta iba en el pool viejo); no son motivo para reiniciar otra vez.
 */
function esErrorDeConexion(e: unknown) {
  const c = codigo(e);
  return conexionMuerta(e) || c === "CONNECTION_ENDED" || c === "CONNECTION_DESTROYED";
}

/**
 * Corre una consulta con tope de tiempo. Si se pasa, cancela, reinicia el pool y falla claro.
 *
 * - `conTope(sql\`...\`)`: un intento (escrituras: nunca se repiten solas).
 * - `conTope(() => sql\`...\`)`: LECTURAS. Si el primer intento se cuelga (conexión muerta
 *   tras congelarse la función), reintenta una vez con conexión nueva, dentro del mismo tope.
 */
export async function conTope<T>(trabajo: Trabajo<T> | (() => Trabajo<T>), ms = TOPE_MS, etiqueta = "consulta"): Promise<T> {
  if (typeof trabajo !== "function") return unIntento(trabajo, ms, etiqueta, generacion());
  const primero = Math.round(ms * 0.45);
  // La generación se lee justo antes de `trabajo()` (que llama a db() en el acto).
  let gen = generacion();
  try {
    return await unIntento(trabajo(), primero, etiqueta, gen);
  } catch (e) {
    if (!(e instanceof TopeVencido) && !esErrorDeConexion(e)) throw e;
    gen = generacion();
    return unIntento(trabajo(), ms - primero, etiqueta, gen);
  }
}
