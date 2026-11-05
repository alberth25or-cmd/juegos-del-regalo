/**
 * Desarrollo contra la BD LOCAL (PGlite de `npm run db:local`), nunca contra Supabase.
 *   1) npm run db:local     (en otra terminal)
 *   2) node scripts/dev-local.mjs   → http://localhost:3100
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const env = {
  ...process.env,
  POSTGRES_URL: `postgres://postgres:postgres@127.0.0.1:${process.env.PGLITE_PORT || 54329}/postgres`,
  POSTGRES_URL_NON_POOLING: "",
  SESSION_SECRET: "solo-desarrollo-local",
  SUPABASE_JWT_SECRET: "",
};

const correr = (cmd, args) =>
  new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd: ROOT, env, stdio: "inherit", shell: process.platform === "win32" });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} salió con ${code}`))));
  });

await correr("node", ["scripts/migrate.mjs"]);
const port = process.env.PORT || "3100";
spawn("npx", ["next", "dev", "-p", port], { cwd: ROOT, env, stdio: "inherit", shell: process.platform === "win32" });
