import { connection } from "next/server";
import { db, hasDatabase } from "@/lib/server/db";

/** Estado del sistema: ¿responde la base de datos y está al día el esquema? */
export async function GET(req: Request) {
  await connection();
  if (!hasDatabase()) {
    return Response.json({ ok: false, db: "sin configurar" }, { status: 503 });
  }
  try {
    const sql = db();
    const t0 = Date.now();
    const [row] = await sql`
      select
        (select count(*)::int from information_schema.tables where table_schema = 'jdr') as tablas,
        (select coalesce(max(version), '') from jdr.schema_migrations) as ultima_migracion
    `;
    // Diagnóstico temporal: conexiones y bloqueos (sin datos de usuarios, solo el texto SQL).
    if (new URL(req.url).searchParams.get("diag") === "1") {
      const conexiones = await sql`
        select pid, state, wait_event_type, wait_event,
               extract(epoch from now() - xact_start)::int as seg_tx,
               extract(epoch from now() - state_change)::int as seg_estado,
               left(regexp_replace(query, '\s+', ' ', 'g'), 90) as consulta
        from pg_stat_activity
        where datname = current_database() and pid <> pg_backend_pid() and backend_type = 'client backend'
        order by xact_start nulls last
      `;
      const bloqueos = await sql`
        select pid, pg_blocking_pids(pid) as bloqueado_por, wait_event_type, wait_event
        from pg_stat_activity where cardinality(pg_blocking_pids(pid)) > 0
      `;
      return Response.json({ ok: true, ms: Date.now() - t0, ...row, conexiones, bloqueos });
    }
    return Response.json({ ok: true, db: "conectada", ms: Date.now() - t0, ...row });
  } catch (err) {
    console.error("[salud]", err);
    return Response.json({ ok: false, db: "error" }, { status: 500 });
  }
}
