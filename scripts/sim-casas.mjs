/**
 * Prueba del juego de las casas contra un servidor LOCAL (nunca producción):
 *   node scripts/dev-local.mjs        # en otra terminal (http://localhost:3100)
 *   npm run sim:casas
 * Temporada de prueba con 4 agentes: ficha, Empezar (sorteo), preguntas del día, pasar,
 * fisgonear, vencidas y el extra de La manada al día siguiente.
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
  estado() {
    return this.pedir("/api/casas").then((r) => r.estado);
  }
}
const av = { piel: "#e8b48a", abrigo: "#7b4bb7", gorro: "reno", colorGorro: "#c0392b", bufanda: "#f6b93b", pelo: "#2a1d17", accesorio: "bigote" };
const suf = process.env.SIM_SUF || Date.now().toString(36).slice(-4);
console.log(`(temporada de prueba "Casas ${suf}", PIN 4826)`);
const red = `10.${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 250)}`;
const admin = new C(`${red}.1`);
let r = await admin.pedir("/api/temporada", { nombre: `Casas ${suf}`, prueba: true, username: `orga_${suf}`, displayName: "Orga", avatar: av, pin: "2580", pin2: "2580" });
check(r.status === 201, "crear temporada de prueba");
const codigo = r.inviteCode;
const js = [admin];
for (let i = 1; i <= 3; i++) {
  const j = new C(`${red}.${i + 1}`);
  r = await j.pedir("/api/unirse", { codigo, username: `c${i}_${suf}`, displayName: `Agente ${i}`, avatar: av, pin: "4826", pin2: "4826" });
  const yo = (await j.pedir("/api/yo")).yo;
  await admin.pedir("/api/admin", { accion: "aprobar", playerId: yo.id });
  js.push(j);
}
check(js.length === 4, "4 jugadores aprobados");

console.log("\n— Antes de empezar");
let e = await admin.estado();
check(e && e.empezado === false && e.manada === null, "las casas están cerradas");
check((await admin.pedir("/api/casas", { accion: "responder", pregunta: "m01", valor: 0 })).status === 409, "no se puede responder antes de Empezar");
check((await admin.pedir("/api/admin", { accion: "empezarCasas" })).status === 400, "Empezar pide al menos 2 fichas");
const datos = { genero: "Mujer", lentes: "No", estatura: "Medio", cabello: "Largo" };
check((await js[1].pedir("/api/casas", { accion: "ficha", regalos: ["Taza"], datos })).status === 400, "ficha incompleta se rechaza");
for (const [i, j] of js.entries()) {
  r = await j.pedir("/api/casas", { accion: "ficha", regalos: [`Taza ${i}`, "Libro de cocina", "Chocolates"], datos: { ...datos, rasgo: `Rasgo ${i}` } });
  check(r.ok && r.estado.yo.tieneFicha, `ficha ${i} guardada`);
}
e = await admin.estado();
check(e.arbol.inscritos.length === 4, "el árbol muestra 4 agentes");

console.log("\n— Regalo, premio y capacidad");
check((await js[1].pedir("/api/admin", { accion: "sala", presupuesto: 50, premio: "x", capacidad: 10 })).status === 403, "solo el organizador configura la sala");
check((await admin.pedir("/api/admin", { accion: "sala", presupuesto: 50, premio: "Canasta navideña", capacidad: 3 })).status === 400, "la capacidad no puede ser menor que los inscritos");
r = await admin.pedir("/api/admin", { accion: "sala", presupuesto: null, premio: "Canasta navideña", capacidad: 4 });
e = await js[2].estado();
check(r.ok && e.sala.presupuesto === null && e.sala.premio === "Canasta navideña" && e.sala.capacidad === 4, "presupuesto 'lo decide el grupo', premio y capacidad guardados");
r = await new C(`${red}.8`).pedir("/api/unirse", { codigo, username: `lleno_${suf}`, displayName: "Lleno", avatar: av, pin: "4826", pin2: "4826" });
check(r.status === 400 && /llena/.test(r.error), "con la capacidad llena ya no entra nadie");
r = await admin.pedir("/api/admin", { accion: "sala", presupuesto: 40, premio: null, capacidad: 40 });
check(r.ok && (await js[2].estado()).sala.premio === null, "el premio también puede quedar para que lo decida el grupo");

console.log("\n— Empezar");
r = await admin.pedir("/api/admin", { accion: "empezarCasas" });
check(r.ok && r.resultado.agentes === 4, "Empezar: sorteo con 4 agentes");
check((await admin.pedir("/api/admin", { accion: "empezarCasas" })).status === 409, "no se puede empezar dos veces");
r = await new C(`${red}.9`).pedir("/api/unirse", { codigo, username: `tarde_${suf}`, displayName: "Tarde", avatar: av, pin: "4826", pin2: "4826" });
check(r.status === 400 && /puerta/.test(r.error), "la puerta se cerró");

const es = await Promise.all(js.map((j) => j.estado()));
check(es.every((x) => x.empezado && x.manada && x.amor.length === 2 && x.picante.length === 0), "todas las casas abiertas con sus preguntas del día");
check(new Set(es.map((x) => x.yo.alias)).size === 4 && es.every((x) => /^Agente /.test(x.yo.alias)), "4 alias anónimos distintos");
check(es.every((x) => x.yo.tieneAmigo), "todos tienen amigo secreto");

const amigos = await Promise.all(js.map((j) => j.pedir("/api/casas/amigo").then((x) => x.ficha)));
check(amigos.every((a, i) => a && a.alias !== es[i].yo.alias), "nadie es su propio amigo secreto");
check(new Set(amigos.map((a) => a.alias)).size === 4, "cada uno tiene un amigo distinto");
check(amigos.every((a) => a.regalos.length === 3), "las opciones de regalo se ven desde el sorteo");

console.log("\n— Responder");
const m = es[0].manada;
for (let i = 0; i < 4; i++) {
  r = await js[i].pedir("/api/casas", { accion: "responder", pregunta: m.id, valor: i < 3 ? 1 : 2 });
  check(r.ok, `agente ${i} responde La manada`);
}
check((await js[0].pedir("/api/casas", { accion: "responder", pregunta: m.id, valor: 1 })).status === 409, "no se responde dos veces");
check((await js[0].pedir("/api/casas", { accion: "pasar", pregunta: m.id })).status === 409, "La manada no tiene Paso");
check((await js[0].pedir("/api/casas", { accion: "responder", pregunta: es[0].amor[0].id, valor: "   " })).status === 400, "respuesta vacía se rechaza");
for (let i = 0; i < 4; i++) {
  r = await js[i].pedir("/api/casas", { accion: "responder", pregunta: es[i].amor[0].id, valor: `${i + 2}` });
  check(r.ok, `agente ${i} responde Amor`);
}
r = await js[0].pedir("/api/casas", { accion: "picante", acepta: true });
check(r.ok && r.estado.picante.length === 2, "agente 0 juega Picante");
r = await js[1].pedir("/api/casas", { accion: "picante", acepta: false });
check(r.ok && r.estado.picante.length === 0 && r.estado.yo.juegaPicante === false, "agente 1 no juega Picante");
r = await js[0].pedir("/api/casas", { accion: "responder", pregunta: r.estado.manada.id, valor: 0 });
const pic = (await js[0].estado()).picante;
check((await js[0].pedir("/api/casas", { accion: "responder", pregunta: pic[0].id, valor: "Tal vez" })).status === 400, "Picante solo acepta Sí o No");
check((await js[0].pedir("/api/casas", { accion: "responder", pregunta: pic[0].id, valor: "Sí" })).ok, "agente 0 responde Picante");
check((await js[1].pedir("/api/casas", { accion: "responder", pregunta: pic[1].id, valor: "Sí" })).status === 409, "quien no juega Picante no responde Picante");

console.log("\n— Pasar");
const yo2 = (await js[2].pedir("/api/yo")).yo;
let antes = (await js[2].estado()).yo.monedas;
check((await js[2].pedir("/api/casas", { accion: "pasar", pregunta: es[2].amor[1].id })).status === 409, `sin monedas no se puede pasar (${antes})`);
await admin.pedir("/api/admin", { accion: "ajustar", playerId: yo2.id, puntos: 300, motivo: "prueba de pases" });
antes = (await js[2].estado()).yo.monedas;
r = await js[2].pedir("/api/casas", { accion: "pasar", pregunta: es[2].amor[1].id });
check(r.ok && r.estado.yo.monedas === antes - 40 && r.estado.pases[3] === 1, "pasar en Amor cuesta 40 y gasta 1 pase");

console.log("\n— Juicio final");
const caso = es[0].juicio;
check(caso && es.every((x) => x.juicio?.id === caso.id), "todos tienen el mismo caso del día");
check((await js[0].pedir("/api/casas", { accion: "responder", pregunta: caso.id, valor: "Tal vez" })).status === 400, "el Juicio solo acepta Culpable o Inocente");
check((await js[0].pedir("/api/casas", { accion: "pasar", pregunta: caso.id })).status === 409, "el Juicio no tiene Paso");
for (let i = 0; i < 4; i++) {
  r = await js[i].pedir("/api/casas", { accion: "responder", pregunta: caso.id, valor: i < 3 ? "Culpable" : "Inocente" });
  check(r.ok && r.estado.juicio.estado === "respondida", `agente ${i} da su veredicto`);
}

console.log("\n— Cápsula del tiempo");
check((await js[0].pedir("/api/casas", { accion: "capsula", mensaje: "llámame al 987654321" })).status === 400, "la cápsula no acepta teléfonos");
r = await js[0].pedir("/api/casas", { accion: "capsula", mensaje: "Feliz Navidad, agente. Te conozco mejor de lo que crees." });
check(r.ok, "agente 0 deja su mensaje");
const recibe0 = es.findIndex((x) => x.yo.alias === amigos[0].alias);
let cap = (await js[recibe0].pedir("/api/casas/capsula")).capsula;
check(cap && cap.abierta === false && cap.recibido === null, "el mensaje no se lee antes del último día");

console.log("\n— Fisgonear");
let f = (await js[3].pedir("/api/casas/amigo")).ficha;
const cerrados = f.respuestas.filter((x) => !x.abierta);
check(cerrados.length > 0 && cerrados.every((x) => x.respuesta === ""), "lo cerrado no viaja al navegador");
r = await js[3].pedir("/api/casas/amigo", { respuesta: cerrados[0].id });
check(r.ok && r.ficha.respuestas.find((x) => x.id === cerrados[0].id).abierta && r.ficha.gratisHoy === 0, "el primer sobre del día es gratis");
if (cerrados[1]) {
  await admin.pedir("/api/admin", { accion: "ajustar", playerId: (await js[3].pedir("/api/yo")).yo.id, puntos: 300, motivo: "prueba fisgoneo" });
  antes = (await js[3].pedir("/api/casas/amigo")).ficha.monedas;
  r = await js[3].pedir("/api/casas/amigo", { respuesta: cerrados[1].id });
  check(r.ok && r.ficha.monedas < antes, `el segundo cuesta monedas (${antes} → ${r.ficha?.monedas})`);
}
check((await js[3].pedir("/api/casas/amigo", { respuesta: cerrados[0].id })).status === 409, "no se paga dos veces el mismo sobre");
check((await js[0].pedir("/api/casas/amigo", { respuesta: cerrados[0].id })).status === 404, "no se fisgonea a quien no es tu amigo");
const fisgoneado = es.findIndex((x) => x.yo.alias === f.alias);
check((await js[fisgoneado].estado()).fisgoneosHoy >= 1, "al fisgoneado le llega el aviso");

console.log("\n— Al día siguiente");
const saldos = await Promise.all(js.map((j) => j.estado().then((x) => x.yo.monedas)));
check((await admin.pedir("/api/admin", { accion: "simularDia", dia: 2 })).ok, "simular el día 2");
const es2 = await Promise.all(js.map((j) => j.estado()));
check(es2[0].dia === 2 && es2[0].manada.id !== m.id, "salen preguntas nuevas");
// agente 3: minoría en La manada y en el Juicio (+0) y 1 de Amor vencida (−40, gasta pase).
check(es2[3].yo.monedas === saldos[3] - 40 && es2[3].pases[3] === 1, `vencida en Amor cuesta como pasar (${saldos[3]} → ${es2[3].yo.monedas})`);
// agente 1: coincidió en La manada (+15) y en el Juicio (+15), y dejó vencer 1 de Amor (−40).
check(es2[1].yo.monedas === saldos[1] + 15 + 15 - 40, `coincidir paga +15 en La manada y +15 en el Juicio (${saldos[1]} → ${es2[1].yo.monedas})`);
check(es2[1].juicioAyer && es2[1].juicioAyer.veredicto === "Culpable" && es2[1].juicioAyer.culpable === 3, "se ve el veredicto de ayer");
const otra = await Promise.all(js.map((j) => j.estado().then((x) => x.yo.monedas)));
check(otra.every((v, i) => v === es2[i].yo.monedas), "volver a entrar no cobra dos veces");

console.log("\n— Último día");
const total = es2[0].totalDias;
check((await admin.pedir("/api/admin", { accion: "simularDia", dia: total })).ok, `simular el último día (${total})`);
cap = (await js[recibe0].pedir("/api/casas/capsula")).capsula;
check(cap.abierta && /Feliz Navidad/.test(cap.recibido ?? ""), "el último día se lee el mensaje de la cápsula");
check((await js[0].pedir("/api/casas", { accion: "capsula", mensaje: "otro" })).status === 409, "abierta, ya no se puede cambiar");
const ult = await js[0].estado();
r = await js[0].pedir("/api/casas", { accion: "responder", pregunta: ult.juicio.id, valor: "Inocente" });
check(r.ok && r.estado.juicio.estado === "respondida", "una pregunta que se repite (banco agotado) se puede responder ese día");
const pr = (await js[0].pedir("/api/casas/juicio")).premios;
check(Array.isArray(pr) && pr.some((x) => x.titulo === "El más chismoso") && pr.every((x) => x.ganadores.every((g) => /^Agente /.test(g))), `premios con alias (${pr?.map((x) => x.titulo).join(", ")})`);

console.log(fallos.length ? `\n✗ ${fallos.length} fallo(s):\n- ${fallos.join("\n- ")}` : "\n✓ Todo OK");
process.exit(fallos.length ? 1 : 0);
