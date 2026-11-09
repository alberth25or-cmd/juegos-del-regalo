import { test } from "node:test";
import assert from "node:assert/strict";
import { crearAzar } from "../src/features/azar.ts";
import { PLATOS, PREGUNTAS_AMOR, PREGUNTAS_MANADA, PREGUNTAS_PICANTE } from "../src/features/contenido/casas.ts";
import { aliasLibre, igualQue, mayoria, preguntasDelDia, sortear, validarFicha, validarRespuesta } from "../src/features/casas/reglas.ts";

test("bancos: ids únicos y suficientes para la temporada", () => {
  for (const banco of [PREGUNTAS_MANADA, PREGUNTAS_AMOR, PREGUNTAS_PICANTE]) {
    assert.equal(new Set(banco.map((p) => p.id)).size, banco.length);
  }
  assert.ok(PREGUNTAS_MANADA.length >= 30);
  assert.ok(PREGUNTAS_AMOR.length >= 50 && PREGUNTAS_PICANTE.length >= 50, "2 por día durante 25 días");
  assert.ok(PREGUNTAS_MANADA.every((p) => p.opciones.length === 4));
  assert.ok(PLATOS.length >= 40);
});

test("preguntas del día: estables, distintas cada día y sin repetir en 25 días", () => {
  const a = preguntasDelDia("temporada-x", 3);
  assert.deepEqual(a, preguntasDelDia("temporada-x", 3));
  assert.notEqual(preguntasDelDia("temporada-x", 4).manada.id, a.manada.id);
  const vistas = new Set<string>();
  for (let d = 1; d <= 25; d++) {
    const q = preguntasDelDia("temporada-x", d);
    for (const p of [q.manada, ...q.amor, ...q.picante]) {
      assert.ok(!vistas.has(p.id), `repetida ${p.id} el día ${d}`);
      vistas.add(p.id);
    }
  }
});

test("sorteo: todos regalan y reciben una vez, nadie a sí mismo", () => {
  const ids = Array.from({ length: 21 }, (_, i) => `j${i}`);
  for (let s = 1; s < 30; s++) {
    const pares = sortear(ids, crearAzar(s));
    assert.equal(pares.length, ids.length);
    assert.equal(new Set(pares.map((p) => p.giver)).size, ids.length);
    assert.equal(new Set(pares.map((p) => p.receiver)).size, ids.length);
    assert.ok(pares.every((p) => p.giver !== p.receiver));
  }
  assert.deepEqual(sortear(["solo"], crearAzar(1)), []);
});

test("alias: nunca repite", () => {
  const usados = new Set<string>();
  const azar = crearAzar(7);
  for (let i = 0; i < 60; i++) {
    const a = aliasLibre(usados, azar);
    assert.ok(!usados.has(a));
    usados.add(a);
  }
});

test("ficha: pide 3-4 regalos y los 4 datos", () => {
  const datos = { genero: "Mujer", lentes: "No", estatura: "Medio", cabello: "Largo" };
  assert.equal(validarFicha(["Taza", "Libro"], datos).ok, false);
  assert.equal(validarFicha(["Taza", "Libro", "Audífonos"], { ...datos, lentes: "Tal vez" }).ok, false);
  const ok = validarFicha(["Taza", " Libro  de cocina ", "Audífonos", "Chocolates"], { ...datos, rasgo: "Siempre con café" });
  assert.ok(ok.ok && ok.ficha.regalos[1] === "Libro de cocina" && ok.ficha.datos.rasgo === "Siempre con café");
});

test("respuestas: cada casa valida lo suyo", () => {
  assert.equal(validarRespuesta(2, 2, ["a", "b", "c", "d"]).ok, true);
  assert.equal(validarRespuesta(2, 7, ["a", "b", "c", "d"]).ok, false);
  assert.equal(validarRespuesta(4, "Sí").ok, true);
  assert.equal(validarRespuesta(4, "Tal vez").ok, false);
  assert.equal(validarRespuesta(3, "   ").ok, false);
});

test("manada: empates cuentan como mayoría; rareza compara sin tildes", () => {
  assert.deepEqual([...mayoria(["0", "1", "1", "0", "2"])].sort(), ["0", "1"]);
  assert.equal(igualQue("Sí", ["si", "Sí", "No", "No"]), 0.5);
});
