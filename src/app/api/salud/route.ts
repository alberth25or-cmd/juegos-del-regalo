import { connection } from "next/server";
import { db, hasDatabase } from "@/lib/server/db";

/** Estado del sistema: ¿responde la base de datos y está al día el esquema? */
export async function GET() {
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
    return Response.json({ ok: true, db: "conectada", ms: Date.now() - t0, ...row });
  } catch (err) {
    console.error("[salud]", err);
    return Response.json({ ok: false, db: "error" }, { status: 500 });
  }
}
