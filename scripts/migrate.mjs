/**
 * Aplica las migraciones pendientes de db/migrations (en orden) sobre Supabase.
 * Corre automáticamente antes de cada build (`npm run build`), así cada
 * publicación en Vercel deja la base de datos al día.
 *
 * - Sin variables de base de datos (por ejemplo en tu PC sin .env.local): se omite.
 * - Cada archivo corre en su propia transacción; si uno falla, el build se detiene
 *   y la versión anterior de la página sigue en línea.
 */
import postgres from "postgres";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = join(ROOT, "db", "migrations");

const raw = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!raw) {
  console.log("[migraciones] Sin POSTGRES_URL: se omiten (normal en desarrollo sin .env.local).");
  process.exit(0);
}

// La URL de la integración trae parámetros extra (p. ej. `supa=`) que el pooler rechaza.
const url = new URL(raw);
url.search = "";

const local = ["localhost", "127.0.0.1"].includes(url.hostname);
const sql = postgres(url.toString(), {
  ssl: local ? false : "require",
  prepare: false,
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
  onnotice: () => {},
});

try {
  await sql.unsafe(`
    create schema if not exists jdr;
    create table if not exists jdr.schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    );
    alter table jdr.schema_migrations enable row level security;
  `);

  const done = new Set((await sql`select version from jdr.schema_migrations`).map((r) => r.version));
  const files = readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();
  let applied = 0;

  for (const file of files) {
    if (done.has(file)) continue;
    const text = readFileSync(join(DIR, file), "utf8");
    console.log(`[migraciones] Aplicando ${file}…`);
    await sql.begin(async (tx) => {
      await tx.unsafe(text);
      await tx`insert into jdr.schema_migrations (version) values (${file})`;
    });
    applied++;
  }

  const [{ tables }] = await sql`
    select count(*)::int as tables from information_schema.tables where table_schema = 'jdr'
  `;
  console.log(`[migraciones] Listo: ${applied} nueva(s), ${files.length} en total, ${tables} tablas/vistas en jdr.`);
} catch (err) {
  console.error("[migraciones] ERROR:", err?.message ?? err);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
