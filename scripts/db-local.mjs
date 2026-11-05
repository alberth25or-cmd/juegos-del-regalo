/**
 * Postgres LOCAL para probar sin tocar Supabase: PGlite (Postgres en WebAssembly)
 * servido por socket en 127.0.0.1:54329. Los datos viven en memoria (se pierden al cerrar).
 *
 *   npm run db:local            # deja la BD escuchando
 *   POSTGRES_URL=postgres://postgres:postgres@127.0.0.1:54329/postgres npm run dev
 */
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const PORT = Number(process.env.PGLITE_PORT || 54329);
const db = await PGlite.create();
const server = new PGLiteSocketServer({ db, port: PORT, host: "127.0.0.1", maxConnections: 20 });
await server.start();
console.log(`[db-local] Postgres local listo en postgres://postgres:postgres@127.0.0.1:${PORT}/postgres`);

const cerrar = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", cerrar);
process.on("SIGTERM", cerrar);
