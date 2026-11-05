import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DURACION_MS,
  OBJETOS,
  generarLluvia,
  puntajeMaximo,
  puntuar,
  validarPartida,
} from "../src/features/games/giftCatcher.ts";
import { deltaPuntos, nivel, promedioEquipo, puntosDelDia, recompensaPartida } from "../src/features/scoring/reglas.ts";
import { diaLocal, estadoTemporada, inicioDelDia } from "../src/features/season/calendario.ts";
import { repartirEquipos } from "../src/features/teams/repartir.ts";
import { fraseDe, FRASES } from "../src/features/contenido/npcs.ts";

// ------------------------------------------------------------ Gift Catcher
test("la lluvia es determinística por semilla", () => {
  assert.deepEqual(generarLluvia(42), generarLluvia(42));
  assert.notDeepEqual(generarLluvia(42), generarLluvia(43));
});

test("la lluvia cubre la partida y tiene de todo", () => {
  const l = generarLluvia(7);
  assert.ok(l.length > 90 && l.length < 200, `objetos: ${l.length}`);
  assert.ok(l.every((c) => c.t < DURACION_MS && c.x > 0 && c.x < 1));
  for (const tipo of Object.keys(OBJETOS)) assert.ok(l.some((c) => c.tipo === tipo), tipo);
});

test("atrapar todo lo bueno da el máximo; atrapar malo resta", () => {
  const l = generarLluvia(99);
  const buenos = l.filter((c) => OBJETOS[c.tipo].bueno).map((c) => c.i);
  assert.equal(puntuar(l, buenos).puntaje, puntajeMaximo(l));
  const conMalo = [...buenos, l.find((c) => !OBJETOS[c.tipo].bueno)!.i];
  assert.ok(puntuar(l, conMalo).puntaje < puntajeMaximo(l));
  assert.equal(puntuar(l, []).puntaje, 0);
});

test("el puntaje nunca es negativo", () => {
  const l = generarLluvia(5);
  const malos = l.filter((c) => !OBJETOS[c.tipo].bueno).map((c) => c.i);
  assert.equal(puntuar(l, malos).puntaje, 0);
});

test("la validación acepta una partida honesta", () => {
  const l = generarLluvia(1234);
  const atrapados = l.filter((c, k) => OBJETOS[c.tipo].bueno && k % 3 !== 0).map((c) => c.i);
  const puntaje = puntuar(l, atrapados).puntaje;
  const r = validarPartida({ seed: 1234, transcurridoMs: 61_500, duracionMs: 60_000, atrapados, puntaje });
  assert.equal(r.ok, true);
});

test("la validación rechaza trampas básicas", () => {
  const l = generarLluvia(1234);
  const atrapados = l.filter((c) => OBJETOS[c.tipo].bueno).map((c) => c.i);
  const puntaje = puntuar(l, atrapados).puntaje;
  const base = { seed: 1234, transcurridoMs: 61_000, duracionMs: 60_000, atrapados, puntaje };
  const motivo = (x: object) => {
    const r = validarPartida({ ...base, ...x });
    return r.ok ? "ok" : r.motivo;
  };
  assert.equal(motivo({}), "ok");
  assert.equal(motivo({ transcurridoMs: 20_000 }), "partida-corta");
  assert.equal(motivo({ transcurridoMs: 700_000 }), "partida-vencida");
  assert.equal(motivo({ duracionMs: 10_000 }), "duracion-invalida");
  assert.equal(motivo({ duracionMs: "60000" }), "duracion-invalida");
  assert.equal(motivo({ puntaje: puntaje + 10 }), "puntaje-no-coincide");
  assert.equal(motivo({ atrapados: [...atrapados, atrapados[0]] }), "indices-invalidos");
  assert.equal(motivo({ atrapados: [99999] }), "indices-invalidos");
  assert.equal(motivo({ atrapados: "todo" }), "indices-invalidos");
  // Partida "de 60 s" pero el servidor midió 56 s: lo que aparece después del segundo 56 no cuenta.
  const tarde = l.filter((c) => c.t > 57_000 && OBJETOS[c.tipo].bueno).map((c) => c.i);
  assert.equal(motivo({ transcurridoMs: 56_000, atrapados: tarde, puntaje: puntuar(l, tarde).puntaje }), "indices-invalidos");
});

// -------------------------------------------------------------- puntuación
test("puntos del día: 20 por jugar + hasta 80, con tope 100", () => {
  assert.equal(puntosDelDia(0), 20);
  assert.equal(puntosDelDia(650), 100);
  assert.equal(puntosDelDia(5000), 100);
  assert.ok(puntosDelDia(300) > 20 && puntosDelDia(300) < 100);
});

test("repetir no suma más del tope: solo la diferencia contra lo ya otorgado", () => {
  assert.equal(deltaPuntos(300, 0), puntosDelDia(300));
  assert.equal(deltaPuntos(200, puntosDelDia(300)), 0);
  assert.equal(deltaPuntos(650, puntosDelDia(300)), 100 - puntosDelDia(300));
  // Sumando todos los deltas de un día nunca se pasa del tope.
  let otorgado = 0;
  for (const s of [100, 50, 400, 380, 900, 1000]) otorgado += deltaPuntos(s, otorgado);
  assert.equal(otorgado, 100);
});

test("recompensa por partida con topes", () => {
  assert.deepEqual(recompensaPartida(0), { xp: 10, coins: 5 });
  assert.deepEqual(recompensaPartida(100000), { xp: 60, coins: 30 });
});

test("niveles y promedio de equipo", () => {
  assert.equal(nivel(0), 1);
  assert.equal(nivel(49), 1);
  assert.equal(nivel(50), 2);
  assert.equal(nivel(200), 3);
  assert.equal(promedioEquipo([]), 0);
  assert.equal(promedioEquipo([100, 0, 0, 0, 0]), 20);
  // Equipo de 5 con 1 jugador muy activo NO gana a un equipo parejo.
  assert.ok(promedioEquipo([400, 0, 0, 0, 0]) < promedioEquipo([100, 100, 100, 100, 100]));
});

// --------------------------------------------------------------- calendario
test("día local de Lima (UTC−5)", () => {
  assert.equal(diaLocal(new Date("2026-11-25T04:59:00Z")), "2026-11-24");
  assert.equal(diaLocal(new Date("2026-11-25T05:00:00Z")), "2026-11-25");
  assert.equal(inicioDelDia("2026-11-25").toISOString(), "2026-11-25T05:00:00.000Z");
});

test("estado de temporada 25 nov → 24 dic", () => {
  const ini = inicioDelDia("2026-11-25");
  const fin = new Date(inicioDelDia("2026-12-25").getTime() - 1);
  assert.deepEqual(estadoTemporada(new Date("2026-11-05T15:00:00Z"), ini, fin), { fase: "pretemporada", faltanDias: 20, dia: 0 });
  assert.deepEqual(estadoTemporada(new Date("2026-11-25T12:00:00Z"), ini, fin), { fase: "en-curso", dia: 1, totalDias: 30 });
  assert.deepEqual(estadoTemporada(new Date("2026-12-24T23:00:00Z"), ini, fin), { fase: "en-curso", dia: 30, totalDias: 30 });
  assert.equal(estadoTemporada(new Date("2026-12-26T12:00:00Z"), ini, fin).fase, "terminada");
});

// ------------------------------------------------------------------ equipos
test("reparto equilibrado: 20 → 4×5, 18 → 5/5/4/4, sin perder a nadie", () => {
  const veinte = Array.from({ length: 20 }, (_, i) => i);
  const r = repartirEquipos(veinte, 4, 1);
  assert.deepEqual(r.map((e) => e.length), [5, 5, 5, 5]);
  assert.deepEqual(r.flat().sort((a, b) => a - b), veinte);
  assert.deepEqual(repartirEquipos(veinte.slice(0, 18), 4, 2).map((e) => e.length), [5, 5, 4, 4]);
});

// ------------------------------------------------------------------- NPCs
test("todos los NPCs tienen frases generales y la elección es estable", () => {
  for (const [id, cat] of Object.entries(FRASES)) assert.ok((cat.general?.length ?? 0) >= 3, id);
  assert.equal(fraseDe("santa", "general", 10), fraseDe("santa", "general", 10));
  assert.ok(fraseDe("muneco", "pendiente", 3).length > 0); // cae a "general" si no hay contexto
});
