/**
 * Tope de consultas: una conexión muerta (la función de Vercel despertó tras congelarse)
 * no debe dejar la pantalla en error. La lectura se reintenta con un pool nuevo.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

const { conTope, ErrorDeServicio } = await import("../src/lib/server/db.ts");

const colgada = () => ({ then: () => {}, cancel: () => {} }) as unknown as PromiseLike<number>;

test("lectura: si el primer intento se cuelga, reintenta y responde dentro del tope", async () => {
  const poolViejo = { end: async () => {} };
  (globalThis as { __ccSql?: unknown }).__ccSql = poolViejo;
  let intentos = 0;
  const t0 = Date.now();
  const r = await conTope(() => (++intentos === 1 ? colgada() : Promise.resolve(42)), 400, "lectura");
  assert.equal(r, 42);
  assert.equal(intentos, 2);
  assert.ok(Date.now() - t0 < 400, "se pasó del tope total");
  assert.equal((globalThis as { __ccSql?: unknown }).__ccSql, undefined, "no reinició el pool");
});

test("lectura: si los dos intentos se cuelgan, falla claro dentro del tope", async () => {
  const t0 = Date.now();
  await assert.rejects(conTope(() => colgada(), 400, "lectura de sesión"), (e) => e instanceof ErrorDeServicio && /lectura de sesión/.test(e.message));
  assert.ok(Date.now() - t0 < 600);
});

test("escritura (sin función): nunca se repite sola", async () => {
  await assert.rejects(conTope(colgada(), 200), ErrorDeServicio);
});

test("un error normal de SQL no se reintenta", async () => {
  let intentos = 0;
  await assert.rejects(
    conTope(() => {
      intentos++;
      return Promise.reject(Object.assign(new Error("syntax"), { code: "42601" }));
    }, 400),
    /syntax/,
  );
  assert.equal(intentos, 1);
});

test("dos lecturas a la vez: el reinicio de una no tumba el reintento de la otra (9 nov)", async () => {
  type Pool = { pend: Set<(e: unknown) => void>; end: () => Promise<void> };
  const g = globalThis as { __ccSql?: unknown };
  let cierres = 0;
  const destruida = () => Object.assign(new Error("write CONNECTION_DESTROYED"), { code: "CONNECTION_DESTROYED" });
  const nuevoPool = (): Pool => {
    const p: Pool = {
      pend: new Set(),
      end: async () => {
        cierres++;
        for (const r of p.pend) r(destruida());
        p.pend.clear();
      },
    };
    return p;
  };
  // Como db(): usa el pool vigente o crea uno.
  const pool = () => (g.__ccSql ??= nuevoPool()) as Pool;
  const consulta = (valor: string) => {
    const p = pool();
    return new Promise<string>((res, rej) => {
      p.pend.add(rej);
      setTimeout(() => {
        p.pend.delete(rej);
        res(valor);
      }, 40);
    });
  };
  g.__ccSql = nuevoPool();
  let intentosA = 0;
  const b = conTope(() => consulta("B"), 2000);
  const a = conTope(() => {
    if (++intentosA > 1) return consulta("A");
    pool();
    return new Promise<string>((_, rej) => setTimeout(() => rej(Object.assign(new Error("reset"), { code: "ECONNRESET" })), 5));
  }, 2000);
  assert.deepEqual(await Promise.all([a, b]), ["A", "B"]);
  assert.equal(cierres, 1, "el pool se reinició más de una vez");
});
