/**
 * Prueba la TEMPORADA DE PRUEBA contra un servidor LOCAL:
 * crear, unirse, aprobar, simular días, partidas sin tope diario y que una
 * temporada real no pueda simular días.
 *   node --experimental-strip-types scripts/sim-prueba.mjs
 */
import { generarLluvia, OBJETOS, puntuar } from "../src/features/games/giftCatcher.ts";
import { monedasDelDia } from "../src/features/scoring/reglas.ts";

const BASE = process.env.SIM_URL || "http://localhost:3100";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("Solo contra un servidor local.");
const fallos = [];
const check = (c, m) => {
  if (!c) fallos.push(m);
  console.log(`${c ? "✓" : "✗"} ${m}`);
};
class C {
  constructor(ip) {
    this.ip = ip;
    this.cookie = "";
  }
  async pedir(ruta, body) {
    const r = await fetch(BASE + ruta, {
      method: body === undefined ? "GET" : "POST",
      headers: { "Content-Type": "application/json", Origin: BASE, "x-forwarded-for": this.ip, ...(this.cookie ? { Cookie: this.cookie } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const set = r.headers.get("set-cookie");
    if (set) this.cookie = set.split(";")[0];
    let d = {};
    try {
      d = await r.json();
    } catch {}
    return { status: r.status, ...d };
  }
}
const av = { piel: "#e8b48a", abrigo: "#7b4bb7", gorro: "reno", colorGorro: "#c0392b", bufanda: "#f6b93b", pelo: "#2a1d17", accesorio: "bigote" };
const suf = Date.now().toString(36).slice(-4);

const admin = new C("10.9.0.1");
let r = await admin.pedir("/api/temporada", { nombre: `Prueba ${suf}`, prueba: true, username: `orga_${suf}`, displayName: "Orga", avatar: av, pin: "2580", pin2: "2580" });
check(r.status === 201, "crear temporada de prueba");
const codigo = r.inviteCode;
const j = new C("10.9.0.2");
r = await j.pedir("/api/unirse", { codigo, username: `test_${suf}`, displayName: "Tester", avatar: av, pin: "4826", pin2: "4826" });
check(r.status === 201, "un amigo se une a la prueba");
const yo = (await j.pedir("/api/yo")).yo;
check((await admin.pedir("/api/admin", { accion: "aprobar", playerId: yo.id })).ok, "aprobar");

check((await admin.pedir("/api/admin", { accion: "simularDia", dia: 15 })).ok, "simular el día 15");
check((await admin.pedir("/api/admin", { accion: "simularDia", dia: 99 })).status === 400, "día fuera de rango se rechaza");
check((await j.pedir("/api/admin", { accion: "simularDia", dia: 3 })).status === 403, "un jugador no puede simular días");

// Una temporada REAL no puede simular días
const real = new C("10.9.0.9");
await real.pedir("/api/temporada", { nombre: `Real ${suf}`, username: `real_${suf}`, displayName: "Real", avatar: av, pin: "7391", pin2: "7391" });
check((await real.pedir("/api/admin", { accion: "simularDia", dia: 5 })).status === 400, "una temporada real no puede simular días");

// Dos partidas a la vez: en prueba ambas suman (sin tope diario), aunque aún falten días para el 25 nov.
const p1 = await j.pedir("/api/partidas", {});
const p2 = await j.pedir("/api/partidas", {});
check(p1.status === 201 && p2.status === 201, "dos partidas iniciadas");
console.log("   …esperando 61 s…");
await new Promise((res) => setTimeout(res, 61_000));
const cerrar = async (p) => {
  const l = generarLluvia(p.seed);
  const at = l.filter((c) => OBJETOS[c.tipo].bueno).map((c) => c.i);
  return j.pedir(`/api/partidas/${p.attemptId}`, { puntaje: puntuar(l, at).puntaje, duracionMs: 60_000, atrapados: at });
};
const [c1, c2] = [await cerrar(p1), await cerrar(p2)];
check(c1.resultado?.valida && c2.resultado?.valida, "ambas partidas válidas");
check(c1.resultado.monedas === monedasDelDia(c1.resultado.puntaje) && c2.resultado.monedas === monedasDelDia(c2.resultado.puntaje), "en prueba cada partida suma sus monedas (sin tope diario)");
check(c1.resultado.pretemporada === false, "en prueba no hay pretemporada");
const rk = await j.pedir("/api/ranking");
const mio = rk.jugadores.find((x) => x.id === yo.id);
check(mio.monedas === c1.resultado.monedas + c2.resultado.monedas, `el ranking suma las dos (${mio.monedas} monedas)`);

console.log(fallos.length ? `\n✗ ${fallos.length} fallo(s):\n- ${fallos.join("\n- ")}` : "\n✓ Todo OK");
process.exit(fallos.length ? 1 : 0);
