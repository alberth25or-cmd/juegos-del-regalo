import "server-only";
import postgres from "postgres";

/**
 * Conexión a Supabase (Postgres) solo desde el servidor.
 * Usa el pooler en modo transacción (POSTGRES_URL), por eso `prepare: false`.
 * El cliente del navegador nunca toca la base de datos directamente.
 */

declare global {
  var __jdrSql: ReturnType<typeof postgres> | undefined;
}

function connectionUrl() {
  const raw = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (!raw) return null;
  const url = new URL(raw);
  url.search = ""; // quita parámetros extra de la integración que el pooler no entiende
  return url.toString();
}

export function hasDatabase() {
  return connectionUrl() !== null;
}

export function db() {
  if (!globalThis.__jdrSql) {
    const url = connectionUrl();
    if (!url) throw new Error("Base de datos no configurada (falta POSTGRES_URL).");
    globalThis.__jdrSql = postgres(url, {
      ssl: "require",
      prepare: false,
      max: 5,
      idle_timeout: 20,
      connect_timeout: 15,
      onnotice: () => {},
    });
  }
  return globalThis.__jdrSql;
}
