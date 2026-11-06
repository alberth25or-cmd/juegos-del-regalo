import { test } from "node:test";
import assert from "node:assert/strict";
import { PREGUNTAS_VOTO } from "../src/features/contenido/votaciones.ts";
import { comentario, contar, FRANJA_PRUEBA_MS, preguntaDe, revelar, rondaEn } from "../src/features/social/votacion.ts";

test("votación: hay al menos 30 preguntas, ids únicos", () => {
  assert.ok(PREGUNTAS_VOTO.length >= 30);
  assert.equal(new Set(PREGUNTAS_VOTO.map((p) => p.id)).size, PREGUNTAS_VOTO.length);
});

test("votación: 30 días seguidos sin repetir pregunta", () => {
  const vistas = new Set<string>();
  for (let d = 0; d < 30; d++) vistas.add(preguntaDe("temporada-x", d).id);
  assert.equal(vistas.size, 30);
});

test("votación: ronda real = día de Lima (cierra a medianoche de Lima)", () => {
  // 6 nov 2026 23:30 en Lima = 7 nov 04:30 UTC
  const ahora = Date.UTC(2026, 10, 7, 4, 30);
  const r = rondaEn("s", ahora, false, 3);
  assert.equal(r.clave, "d3");
  assert.equal(new Date(r.cierra).toISOString(), "2026-11-07T05:00:00.000Z");
  assert.ok(r.abre <= ahora && ahora < r.cierra);
  assert.equal(rondaEn("s", ahora, false, 3, -1).clave, "d2");
});

test("votación: en prueba, una pregunta nueva por franja", () => {
  const t = 1_800_000_000_000;
  const a = rondaEn("s", t, true, 1);
  const b = rondaEn("s", t + FRANJA_PRUEBA_MS, true, 1);
  assert.notEqual(a.clave, b.clave);
  assert.notEqual(a.pregunta.id, b.pregunta.id);
  assert.equal(rondaEn("s", t + FRANJA_PRUEBA_MS, true, 1, -1).clave, a.clave);
});

test("votación: resultados ocultos hasta que votan todos o cierra", () => {
  assert.equal(revelar(3, 5, 0, 100), false);
  assert.equal(revelar(5, 5, 0, 100), true);
  assert.equal(revelar(1, 5, 100, 100), true);
  assert.equal(revelar(1, 1, 0, 100), false, "una sola persona no revela");
});

test("votación: conteo ordenado y comentario sin empate / con empate", () => {
  const c = contar([{ target: "b" }, { target: "a" }, { target: "b" }]);
  assert.deepEqual(c, [
    { id: "b", votos: 2 },
    { id: "a", votos: 1 },
  ]);
  const txt = comentario(c, (id) => (id === "b" ? "Bea" : "Ana"), "p1");
  assert.match(txt, /Bea|favorito/);
  assert.doesNotMatch(txt, /\{n\}|\{v\}/);
  const emp = comentario(contar([{ target: "a" }, { target: "b" }]), () => "X", "p1");
  assert.match(emp, /[Ee]mpat/);
});

// ------------------------------------------------------------------ juegos
import { CARTAS, mazo, PARES, validarMemory } from "../src/features/games/memory.ts";
import { N_PREGUNTAS, preguntasDe, preguntasPublicas, validarTrivia } from "../src/features/games/trivia.ts";
import { PREGUNTAS_TRIVIA } from "../src/features/contenido/trivia.ts";
import { hitosNuevos, metaEnergia, porcentaje } from "../src/features/social/energia.ts";

/** Volteos perfectos: cada par seguido. */
function perfecto(seed: number) {
  const m = mazo(seed);
  const v: number[] = [];
  const usado = new Set<number>();
  for (let i = 0; i < m.length; i++) {
    if (usado.has(i)) continue;
    const j = m.findIndex((c, k) => k !== i && c === m[i]);
    v.push(i, j);
    usado.add(i).add(j);
  }
  return v;
}

test("memory: mazo de 16 con 8 pares exactos y determinístico", () => {
  const m = mazo(123);
  assert.equal(m.length, CARTAS);
  for (const c of new Set(m)) assert.equal(m.filter((x) => x === c).length, 2);
  assert.equal(new Set(m).size, PARES);
  assert.deepEqual(mazo(123), m);
});

test("memory: partida perfecta vale 1000; con errores vale menos", () => {
  const v = perfecto(7);
  const r = validarMemory({ seed: 7, transcurridoMs: 15_000, volteos: v });
  assert.ok(r.ok && r.resumen.puntaje === 1000 && r.resumen.movimientos === 8);
  const m = mazo(7);
  const malo = m.findIndex((c) => c !== m[0]);
  const r2 = validarMemory({ seed: 7, transcurridoMs: 40_000, volteos: [0, malo, ...v] });
  assert.ok(r2.ok && r2.resumen.puntaje < 1000 && r2.resumen.movimientos === 9);
});

test("memory: se rechaza sin terminar, demasiado rápido o volteando cartas ya resueltas", () => {
  const v = perfecto(9);
  assert.equal(validarMemory({ seed: 9, transcurridoMs: 15_000, volteos: v.slice(0, 14) }).ok, false);
  assert.equal(validarMemory({ seed: 9, transcurridoMs: 1_000, volteos: v }).ok, false);
  assert.equal(validarMemory({ seed: 9, transcurridoMs: 15_000, volteos: [...v.slice(0, 2), ...v.slice(0, 2), ...v.slice(2)] }).ok, false);
  assert.equal(validarMemory({ seed: 9, transcurridoMs: 15_000, volteos: "x" }).ok, false);
});

test("trivia: catálogo con 30+ preguntas válidas", () => {
  assert.ok(PREGUNTAS_TRIVIA.length >= 30);
  assert.equal(new Set(PREGUNTAS_TRIVIA.map((p) => p.id)).size, PREGUNTAS_TRIVIA.length);
  for (const p of PREGUNTAS_TRIVIA) assert.equal(new Set(p.opciones).size, 4, p.id);
});

test("trivia: lo público no trae la respuesta y el servidor corrige con la semilla", () => {
  const pub = preguntasPublicas(42);
  assert.equal(pub.length, N_PREGUNTAS);
  assert.ok(pub.every((p) => !("ok" in p)));
  const ps = preguntasDe(42);
  const todas = validarTrivia({ seed: 42, transcurridoMs: 30_000, respuestas: ps.map((p) => p.ok) });
  assert.ok(todas.ok && todas.resumen.aciertos === N_PREGUNTAS);
  const ninguna = validarTrivia({ seed: 42, transcurridoMs: 30_000, respuestas: ps.map((p) => (p.ok + 1) % 4) });
  assert.ok(ninguna.ok && ninguna.resumen.aciertos === 0 && ninguna.resumen.puntaje === 0);
  // la opción correcta mezclada apunta al texto correcto del catálogo
  for (const p of ps) {
    const orig = PREGUNTAS_TRIVIA.find((q) => q.id === p.id)!;
    assert.equal(p.opciones[p.ok], orig.opciones[orig.ok]);
  }
});

test("trivia: se rechaza muy rápido o con respuestas inválidas", () => {
  assert.equal(validarTrivia({ seed: 1, transcurridoMs: 2000, respuestas: Array(N_PREGUNTAS).fill(0) }).ok, false);
  assert.equal(validarTrivia({ seed: 1, transcurridoMs: 30_000, respuestas: [0, 1] }).ok, false);
  assert.equal(validarTrivia({ seed: 1, transcurridoMs: 30_000, respuestas: Array(N_PREGUNTAS).fill(7) }).ok, false);
});

test("energía: meta escala con el grupo y los hitos se anuncian una vez", () => {
  assert.equal(metaEnergia(20), 10_000);
  assert.equal(metaEnergia(2), 3000);
  assert.equal(porcentaje(5000, 10_000), 50);
  assert.equal(porcentaje(20_000, 10_000), 100);
  assert.deepEqual(hitosNuevos(60, [25]), [50]);
  assert.deepEqual(hitosNuevos(100, []), [25, 50, 75, 100]);
});
