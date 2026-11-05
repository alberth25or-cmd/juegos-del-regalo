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
 */

declare global {
  var __ccSql: ReturnType<typeof postgres> | undefined;
}

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
      idle_timeout: 20,
      max_lifetime: 60 * 10,
      connect_timeout: 10,
      onnotice: () => {},
    });
  }
  return globalThis.__ccSql;
}

export type Sql = ReturnType<typeof db>;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Tx = postgres.TransactionSql<{}>;

/** Error esperado de infraestructura (BD caída o lenta): se muestra como "intenta otra vez". */
export class ErrorDeServicio extends Error {
  readonly status = 503;
}

export const TOPE_MS = 9000;

/** Corre una operación con tope de tiempo. Si se pasa, cancela la consulta si puede y falla claro. */
export async function conTope<T>(trabajo: PromiseLike<T> & { cancel?: () => unknown }, ms = TOPE_MS, etiqueta = "consulta"): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      try {
        trabajo.cancel?.();
      } catch {}
      reject(new ErrorDeServicio(`La ${etiqueta} tardó más de ${ms / 1000} s.`));
    }, ms);
  });
  try {
    return await Promise.race([trabajo, limite]);
  } finally {
    clearTimeout(timer);
  }
}
