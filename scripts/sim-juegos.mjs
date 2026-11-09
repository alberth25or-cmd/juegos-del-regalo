/**
 * Prueba de los juegos sociales contra un servidor LOCAL (nunca producción):
 *   node scripts/dev-local.mjs        # en otra terminal (http://localhost:3100)
 *   npm run sim:juegos
 * Crea una temporada de prueba con 4 jugadores y recorre votación, trivia,
 * memoria y energía navideña con las reglas que valida el servidor.
 */
const BASE = process.env.SIM_URL || "http://localhost:3100";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) {
  console.error("Solo contra un servidor local.");
  process.exit(1);
}
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
const suf = process.env.SIM_SUF || Date.now().toString(36).slice(-4);
console.log(`(temporada de prueba "Juegos ${suf}", PIN de los jugadores 4826)`);

// ---------------------------------------------------------------- temporada
const red = `10.${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 250)}`;
const admin = new C(`${red}.1`);
let r = await admin.pedir("/api/temporada", { nombre: `Juegos ${suf}`, prueba: true, username: `orga_${suf}`, displayName: "Orga", avatar: av, pin: "2580", pin2: "2580" });
check(r.status === 201, "crear temporada de prueba");
const codigo = r.inviteCode;
const jugadores = [admin];
for (let i = 1; i <= 3; i++) {
  const j = new C(`${red}.${i + 1}`);
  r = await j.pedir("/api/unirse", { codigo, username: `j${i}_${suf}`, displayName: `Jugador ${i}`, avatar: av, pin: "4826", pin2: "4826" });
  check(r.status === 201, `jugador ${i} se une`);
  const yo = (await j.pedir("/api/yo")).yo;
  check((await admin.pedir("/api/admin", { accion: "aprobar", playerId: yo.id })).ok, `aprobar jugador ${i}`);
  jugadores.push(j);
}
const ids = [];
for (const j of jugadores) ids.push((await j.pedir("/api/yo")).yo.id);

// ---------------------------------------------------------------- votación
console.log("\n— ¿Quién es más probable…?");
r = await admin.pedir("/api/votacion");
check(r.ok && r.estado.total === 4 && r.estado.puedeVotar, "4 jugadores pueden votar");
const clave = r.estado.ronda.clave;
check((await admin.pedir("/api/votacion", { clave, objetivo: ids[0] })).status === 400, "no se puede votar por uno mismo");
check((await admin.pedir("/api/votacion", { clave: "p0", objetivo: ids[1] })).status === 409, "una ronda vieja se rechaza");
for (let i = 0; i < 3; i++) {
  r = await jugadores[i].pedir("/api/votacion", { clave, objetivo: ids[3] });
  check(r.ok && r.estado.miVoto === ids[3], `jugador ${i} vota`);
}
check(r.estado.resultado === null, "con 3 de 4 votos, los resultados siguen ocultos");
check((await jugadores[0].pedir("/api/votacion", { clave, objetivo: ids[2] })).status === 409, "no se puede votar dos veces");
r = await jugadores[3].pedir("/api/votacion", { clave, objetivo: ids[1] });
check(r.ok && r.estado.resultado && r.estado.resultado.conteo[0].id === ids[3] && r.estado.resultado.conteo[0].votos === 3, "con todos los votos se revela: el más votado tiene 3");
check(typeof r.estado.resultado?.comentario === "string" && !/\{n\}/.test(r.estado.resultado.comentario), "comentario del Auditor listo");
const rk = await admin.pedir("/api/ranking");
const fila = rk.jugadores.find((x) => x.id === ids[0]);
check(fila && fila.monedas >= 10, "votar dio monedas");

// ------------------------------------------------------------- trivia
console.log("\n— Juicio del Polo Norte (trivia)");
const { preguntasDe } = await import("../src/features/games/trivia.ts");
const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
r = await admin.pedir("/api/partidas", { juego: "trivia" });
check(r.status === 201 && r.preguntas?.length === 8 && r.preguntas.every((q) => !("ok" in q)), "la trivia llega sin respuestas");
const triviaId = r.attemptId;
const correctas = preguntasDe(r.seed).map((q) => q.ok);
check((await admin.pedir(`/api/partidas/${triviaId}`, { respuestas: correctas })).resultado?.valida === false, "responder todo al instante se rechaza");
r = await jugadores[1].pedir("/api/partidas", { juego: "trivia" });
const t2 = r.attemptId;
const seedT2 = r.seed;
await espera(6500);
r = await jugadores[1].pedir(`/api/partidas/${t2}`, { respuestas: preguntasDe(seedT2).map((q, i) => (i < 6 ? q.ok : (q.ok + 1) % 4)) });
check(r.resultado?.valida && r.resultado.detalle.aciertos === 6 && r.resultado.monedas > 0, "6 de 8 correctas: válida y da monedas");
check((await jugadores[1].pedir(`/api/partidas/${t2}`, { respuestas: [0, 0, 0, 0, 0, 0, 0, 0] })).status === 409, "no se puede mandar dos veces");
r = await admin.pedir("/api/trivia/equipos");
check(r.ok && Array.isArray(r.equipos), "promedio de equipos de hoy disponible");

// ------------------------------------------------------------- memory
console.log("\n— Memory Gifts");
const { mazo } = await import("../src/features/games/memory.ts");
r = await jugadores[2].pedir("/api/partidas", { juego: "memory" });
check(r.status === 201 && typeof r.seed === "number", "partida de memory creada");
const memId = r.attemptId;
const m = mazo(r.seed);
const volteos = [];
const usado = new Set();
for (let i = 0; i < m.length; i++) {
  if (usado.has(i)) continue;
  const j = m.findIndex((c, k) => k !== i && c === m[i]);
  volteos.push(i, j);
  usado.add(i).add(j);
}
check((await jugadores[2].pedir(`/api/partidas/${memId}`, { volteos: volteos.slice(0, 10) })).resultado?.valida === false, "sin terminar se rechaza");
r = await jugadores[2].pedir("/api/partidas", { juego: "memory" });
const mem2 = r.attemptId;
const m2 = mazo(r.seed);
const v2 = [];
const u2 = new Set();
for (let i = 0; i < m2.length; i++) {
  if (u2.has(i)) continue;
  const j = m2.findIndex((c, k) => k !== i && c === m2[i]);
  v2.push(i, j);
  u2.add(i).add(j);
}
await espera(6500);
r = await jugadores[2].pedir(`/api/partidas/${mem2}`, { volteos: v2 });
check(r.resultado?.valida && r.resultado.detalle.movimientos === 8 && r.resultado.puntaje >= 900, "partida perfecta válida con puntaje alto");
check((await jugadores[2].pedir("/api/partidas", { juego: "no-existe" })).status === 404, "un juego inventado se rechaza");

// ------------------------------------------------------------- energía
console.log("\n— Energía navideña");
r = await admin.pedir("/api/energia");
check(r.ok && r.energia.energia > 0 && r.energia.meta === 3000, `la energía suma las monedas de todos (${r.energia?.energia}/${r.energia?.meta})`);
check(r.energia.top.length > 0, "hay ranking de quién aportó más");

console.log(fallos.length ? `\n✗ ${fallos.length} fallo(s)` : "\n✓ Todo OK");
process.exit(fallos.length ? 1 : 0);
