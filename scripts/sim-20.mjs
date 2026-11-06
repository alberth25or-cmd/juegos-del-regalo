/**
 * Simulación de 20 jugadores contra un servidor LOCAL (nunca contra producción).
 *   npm run db:local          # terminal 1
 *   node scripts/dev-local.mjs  # terminal 2 (http://localhost:3100)
 *   npm run sim               # terminal 3
 *
 * Cubre: crear temporada, 19 inscripciones simultáneas, aprobación, reparto de
 * equipos, entrar desde "otro celular", 20 partidas a la vez, reenvío duplicado,
 * trampas, ranking individual y por equipos, y permisos de admin.
 */
import { generarLluvia, OBJETOS, puntuar } from "../src/features/games/giftCatcher.ts";
import { puntosDelDia } from "../src/features/scoring/reglas.ts";
import { diaLocal } from "../src/features/season/calendario.ts";

const BASE = process.env.SIM_URL || "http://localhost:3100";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) {
  console.error("Solo se permite simular contra un servidor local.");
  process.exit(1);
}
const N = Number(process.env.SIM_N || 20);
const M = N - 1;
const fallos = [];
const tiempos = [];

class Cliente {
  constructor(nombre, ip) {
    this.nombre = nombre;
    this.ip = ip;
    this.cookie = "";
  }
  async pedir(ruta, body, metodo) {
    const t0 = performance.now();
    const res = await fetch(BASE + ruta, {
      method: metodo ?? (body === undefined ? "GET" : "POST"),
      headers: {
        "Content-Type": "application/json",
        Origin: BASE,
        "x-forwarded-for": this.ip,
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    tiempos.push(performance.now() - t0);
    const set = res.headers.get("set-cookie");
    if (set) this.cookie = set.split(";")[0];
    let data = {};
    try {
      data = await res.json();
    } catch {}
    return { status: res.status, ...data };
  }
}

function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function check(cond, msg) {
  if (!cond) fallos.push(msg);
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
}
const avatar = { piel: "#c98d62", abrigo: "#2e9e78", gorro: "duende", colorGorro: "#c0392b", bufanda: "#f6b93b", pelo: "#2a1d17", accesorio: "lentes" };
const sufijo = Date.now().toString(36).slice(-4);

// 1) Organizador crea la temporada
const admin = new Cliente("admin", "10.0.0.1");
let r = await admin.pedir("/api/temporada", { nombre: `Sim ${sufijo}`, username: `admin_${sufijo}`, displayName: "Admin Sim", avatar, pin: "2580", pin2: "2580" });
check(r.status === 201 && r.inviteCode, `crear temporada (${r.status})`);
const codigo = r.inviteCode;

// 2) 19 inscripciones simultáneas (cada uno desde su "celular")
const jugadores = Array.from({ length: M }, (_, i) => new Cliente(`j${i}`, `10.0.1.${i + 2}`));
let t0 = performance.now();
const altas = await Promise.all(
  jugadores.map((j, i) =>
    j.pedir("/api/unirse", { codigo, username: `jug_${sufijo}_${i}`, displayName: `Jugador ${i + 1}`, avatar, pin: `${(3141 + i * 7) % 10000}`.padStart(4, "5"), pin2: `${(3141 + i * 7) % 10000}`.padStart(4, "5") }),
  ),
);
check(
  altas.every((a) => a.status === 201),
  `${M} inscripciones a la vez en ${Math.round(performance.now() - t0)} ms (${altas.filter((a) => a.status === 201).length}/${M} ok)`,
);
altas.forEach((a, i) => a.status !== 201 && console.log("   ", jugadores[i].nombre, a.status, a.error));

// Usuario repetido → error claro
r = await new Cliente("x", "10.0.9.9").pedir("/api/unirse", { codigo, username: `jug_${sufijo}_0`, displayName: "Copión", avatar, pin: "4826", pin2: "4826" });
check(r.status === 400 && /tomado/.test(r.error), "usuario repetido se rechaza con mensaje claro");

// Un pendiente no puede jugar
r = await jugadores[0].pedir("/api/partidas", {});
check(r.status === 403, "jugador pendiente no puede guardar partidas");

// 3) Un jugador intenta hacer de admin → prohibido
r = await jugadores[1].pedir("/api/admin", { accion: "repartir" });
check(r.status === 403, "un jugador normal no puede usar el panel de admin");

// 4) El organizador aprueba a todos (en paralelo), reparte equipos y abre la temporada hoy
const pendientesResp = await Promise.all(
  altas.map(async (_, i) => {
    const yo = await jugadores[i].pedir("/api/yo");
    return admin.pedir("/api/admin", { accion: "aprobar", playerId: yo.yo.id });
  }),
);
check(pendientesResp.every((p) => p.ok), `aprobar ${M} jugadores en paralelo (${pendientesResp.filter((p) => p.ok).length}/${M})`);
r = await admin.pedir("/api/admin", { accion: "repartir" });
check(r.ok, "repartir equipos al azar");
const hoy = diaLocal(new Date());
const fin = diaLocal(new Date(Date.now() + 29 * 86_400_000));
r = await admin.pedir("/api/admin", { accion: "fechas", desde: hoy, hasta: fin });
check(r.ok, `temporada abierta desde hoy (${hoy})`);

// 5) Todos "cambian de celular": entran con usuario + PIN
const todos = [admin, ...jugadores];
const usuarios = [`admin_${sufijo}`, ...jugadores.map((_, i) => `jug_${sufijo}_${i}`)];
const pins = ["2580", ...jugadores.map((_, i) => `${(3141 + i * 7) % 10000}`.padStart(4, "5"))];
const nuevos = todos.map((c) => new Cliente(c.nombre, c.ip));
t0 = performance.now();
const logins = await Promise.all(nuevos.map((c, i) => c.pedir("/api/entrar", { username: usuarios[i], pin: pins[i] })));
check(logins.every((l) => l.ok), `${N} ingresos con usuario+PIN a la vez en ${Math.round(performance.now() - t0)} ms (${logins.filter((l) => l.ok).length}/${N})`);
r = await new Cliente("malo", "10.0.8.8").pedir("/api/entrar", { username: usuarios[3], pin: "0000" });
check(r.status === 401, "PIN incorrecto se rechaza");

// 5b) Todos en la MISMA red Wi-Fi (misma IP): nadie debe quedar bloqueado.
const misma = await Promise.all(todos.map((c, i) => new Cliente(c.nombre, "10.7.7.7").pedir("/api/entrar", { username: usuarios[i], pin: pins[i] })));
check(misma.every((l) => l.ok), `${N} ingresos desde la misma Wi-Fi (${misma.filter((l) => l.ok).length}/${N})`);

// 6) Todas las partidas a la vez
t0 = performance.now();
const partidas = await Promise.all(nuevos.map((c) => c.pedir("/api/partidas", {})));
check(partidas.every((p) => p.status === 201), `${N} partidas iniciadas a la vez en ${Math.round(performance.now() - t0)} ms`);
console.log("   …esperando 61 s (una partida real: cuenta regresiva + 60 s de juego)…");
await esperar(61_000);

const envios = partidas.map((p, i) => {
  const lluvia = generarLluvia(p.seed);
  // Cada jugador atrapa una fracción distinta de lo bueno (y algo malo).
  const atrapados = lluvia.filter((c, k) => (OBJETOS[c.tipo].bueno ? k % (2 + (i % 4)) !== 0 : k % 9 === 0)).map((c) => c.i);
  return { id: p.attemptId, body: { puntaje: puntuar(lluvia, atrapados).puntaje, duracionMs: 60_000, atrapados } };
});
// Uno hace trampa con el puntaje
envios[5].body = { ...envios[5].body, puntaje: envios[5].body.puntaje + 500 };
t0 = performance.now();
const cierres = await Promise.all(nuevos.map((c, i) => c.pedir(`/api/partidas/${envios[i].id}`, envios[i].body)));
check(cierres.every((c) => c.ok), `${N} partidas validadas a la vez en ${Math.round(performance.now() - t0)} ms`);
check(cierres[5].resultado?.valida === false, "la partida con puntaje inflado se rechaza");
check(cierres.filter((c, i) => i !== 5).every((c) => c.resultado?.valida), `las ${M} partidas honestas son válidas`);
cierres.forEach((c, i) => i !== 5 && !c.resultado?.valida && console.log("   ", i, c.status, c.error ?? c.resultado?.motivo));
check(
  cierres.filter((c, i) => i !== 5).every((c) => c.resultado.puntos === puntosDelDia(c.resultado.puntaje)),
  "puntos del día = 20 + resultado (tope 100)",
);

// Reenvío por mala señal → no duplica
r = await nuevos[0].pedir(`/api/partidas/${envios[0].id}`, envios[0].body);
check(r.status === 409, "reenviar la misma partida no duplica puntos (409)");
// Partida demasiado corta
const corta = await nuevos[1].pedir("/api/partidas", {});
r = await nuevos[1].pedir(`/api/partidas/${corta.attemptId}`, { puntaje: 0, duracionMs: 60_000, atrapados: [] });
check(r.resultado?.valida === false, "partida terminada en segundos se rechaza");
// Partida de otro jugador
r = await nuevos[2].pedir(`/api/partidas/${envios[3].id}`, envios[3].body);
check(r.status === 404, "no se puede cerrar la partida de otro");

// 7) Ranking
const rk = await nuevos[0].pedir("/api/ranking");
check(rk.jugadores?.length === N, `ranking con ${N} jugadores (${rk.jugadores?.length})`);
const suma = rk.equipos.reduce((a, e) => a + e.integrantes, 0);
const tam = rk.equipos.map((e) => e.integrantes);
check(suma === N && Math.max(...tam) - Math.min(...tam) <= 1, `4 equipos parejos (${tam.join("/")})`);
const e0 = rk.equipos[0];
const miembros = rk.jugadores.filter((j) => j.teamId === e0.id);
check(Math.abs(e0.promedio - miembros.reduce((a, j) => a + j.points, 0) / miembros.length) < 0.06, "el ranking de equipos usa el promedio");
const tramposo = rk.jugadores.find((j) => j.displayName === "Jugador 5");
check(tramposo && tramposo.points === 0, "el tramposo no sumó puntos");

// 8) 60 lecturas simultáneas de la plaza/ranking
t0 = performance.now();
const lecturas = await Promise.all(Array.from({ length: N * 3 }, (_, k) => nuevos[k % N].pedir(k % 2 ? "/api/ranking" : "/api/plaza")));
check(lecturas.every((l) => l.ok), `${N * 3} lecturas simultáneas en ${Math.round(performance.now() - t0)} ms`);

// 9) El ledger no se puede editar ni con un ajuste raro
r = await admin.pedir("/api/admin", { accion: "ajustar", playerId: rk.jugadores[0].id, puntos: 9999, motivo: "prueba" });
check(r.status === 400, "ajustes fuera de rango se rechazan");

tiempos.sort((a, b) => a - b);
const p = (q) => Math.round(tiempos[Math.floor(q * (tiempos.length - 1))]);
console.log(`\nPeticiones: ${tiempos.length} · mediana ${p(0.5)} ms · p95 ${p(0.95)} ms · máx ${p(1)} ms`);
console.log(fallos.length ? `\n✗ ${fallos.length} fallo(s):\n- ${fallos.join("\n- ")}` : "\n✓ Todo OK");
process.exit(fallos.length ? 1 : 0);
