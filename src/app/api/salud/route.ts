import { connection } from "next/server";
import postgres from "postgres";
import { db, hasDatabase } from "@/lib/server/db";
import { agentesDelGrupo } from "@/lib/server/consultas";
import { agenteActual } from "@/lib/server/sesion";

/** Estado del sistema: ¿responde la base de datos y está al día el esquema? */
export async function GET(req: Request) {
  await connection();
  if (!hasDatabase()) {
    return Response.json({ ok: false, db: "sin configurar" }, { status: 503 });
  }
  const diag = new URL(req.url).searchParams.get("diag");
  try {
    const sql = db();
    const t0 = Date.now();
    const [row] = await sql`
      select
        (select count(*)::int from information_schema.tables where table_schema = 'jdr') as tablas,
        (select coalesce(max(version), '') from jdr.schema_migrations) as ultima_migracion
    `;
    // Diagnóstico temporal (sin datos de usuarios).
    if (diag === "1") {
      const conexiones = await sql`
        select pid, state, wait_event, extract(epoch from now() - xact_start)::int as seg_tx,
               left(query, 60) as consulta
        from pg_stat_activity
        where datname = current_database() and pid <> pg_backend_pid() and backend_type = 'client backend' and state <> 'idle'
      `;
      return Response.json({ ok: true, ...row, conexiones });
    }
    if (diag === "2" || diag === "3") {
      const [gr] = await sql`select g.id from jdr.groups g order by (select count(*) from jdr.members m where m.group_id = g.id) desc limit 1`;
      const vacio: string = gr?.id ?? "00000000-0000-0000-0000-000000000000";
      const conTiempo = <T,>(p: Promise<T>) =>
        Promise.race([p.then(() => "ok"), new Promise<string>((r) => setTimeout(() => r("COLGADO"), 8000))]);
      const pasos: Record<string, string> = {};
      let t = Date.now();
      if (diag === "2") {
        pasos.agenteActual = await conTiempo(agenteActual());
        pasos.t1 = `${Date.now() - t}ms`;
        t = Date.now();
        pasos.agentesDelGrupo = await conTiempo(agentesDelGrupo(vacio).then((r) => { pasos.filas = String(r.length); return r; }));
        pasos.t2 = `${Date.now() - t}ms`;
      } else {
        const raw = process.env.POSTGRES_URL_NON_POOLING;
        if (!raw) return Response.json({ sinNonPooling: true });
        const u = new URL(raw);
        u.search = "";
        const s2 = postgres(u.toString(), { ssl: "require", prepare: false, max: 1, connect_timeout: 8 });
        pasos.puerto = u.port || "(default)";
        pasos.host = u.hostname.replace(/^[^.]+/, "*");
        pasos.update = await conTiempo(s2`update jdr.sessions set last_used_at = now() where token_hash = 'x' returning member_id`);
        pasos.t1 = `${Date.now() - t}ms`;
        t = Date.now();
        pasos.lista = await conTiempo(s2`select id, alias, codename, avatar, role, status, paid, created_at from jdr.members where group_id = ${vacio} order by case status when 'pending' then 0 when 'approved' then 1 else 2 end, created_at`);
        pasos.t2 = `${Date.now() - t}ms`;
        await s2.end({ timeout: 2 });
      }
      const principal = new URL(process.env.POSTGRES_URL ?? "postgres://x@x:0/x");
      return Response.json({ ...pasos, puertoPrincipal: principal.port });
    }
    return Response.json({ ok: true, db: "conectada", ms: Date.now() - t0, ...row });
  } catch (err) {
    console.error("[salud]", err);
    return Response.json({ ok: false, db: "error", detalle: diag ? String(err) : undefined }, { status: 500 });
  }
}
