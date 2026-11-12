import { test } from "node:test";
import assert from "node:assert/strict";
import { crearAzar } from "../src/features/azar.ts";
import { CASOS_JUICIO, PLATOS, PREGUNTAS_CORAZON, PREGUNTAS_AMOR, PREGUNTAS_MANADA, PREGUNTAS_PICANTE } from "../src/features/contenido/casas.ts";
import { aliasLibre, cobertura, conteos, diasFinal, igualQue, mayoria, preguntasDelDia, sortear, validarFicha, validarRespuesta } from "../src/features/casas/reglas.ts";

test("bancos: ids únicos y suficientes para la temporada", () => {
  for (const banco of [PREGUNTAS_MANADA, PREGUNTAS_AMOR, PREGUNTAS_PICANTE, CASOS_JUICIO, PREGUNTAS_CORAZON]) {
    assert.equal(new Set(banco.map((p) => p.id)).size, banco.length);
  }
  assert.ok(PREGUNTAS_MANADA.length >= 45 && CASOS_JUICIO.length >= 45);
  assert.ok(PREGUNTAS_MANADA.every((p) => Number(p.id.slice(1)) > 30), "los ids viejos (m01–m30) no se reusan");
  assert.ok(PREGUNTAS_AMOR.length >= 60 && PREGUNTAS_PICANTE.length >= 60, "2 por día durante 30 días");
  assert.ok(PREGUNTAS_MANADA.every((p) => p.opciones.length === 4));
  assert.ok(PLATOS.length >= 40);
});

const P30 = { inicio: 1, total: 30 };

test("preguntas del día: estables y distintas cada día", () => {
  const a = preguntasDelDia("temporada-x", 3, P30);
  assert.deepEqual(a, preguntasDelDia("temporada-x", 3, P30));
  assert.notEqual(preguntasDelDia("temporada-x", 4, P30).manada.id, a.manada.id);
});

for (const total of [7, 14, 30, 45]) {
  test(`plan de ${total} días: ninguna pregunta se repite en ningún banco`, () => {
    const vistas = new Set<string>();
    for (let d = 1; d <= total; d++) {
      const q = preguntasDelDia("temporada-x", d, { inicio: 1, total });
      for (const p of [q.manada, ...q.amor, ...q.picante, q.juicio, ...q.corazon]) {
        assert.ok(!vistas.has(p.id), `repetida ${p.id} el día ${d}`);
        vistas.add(p.id);
      }
    }
    assert.ok(cobertura(total).every((c) => c.faltan === 0));
  });
}

test("plan: Corazón 2 por día y en la recta final 3 profundas, con menos Amor y Picante", () => {
  const d1 = preguntasDelDia("t", 1, P30);
  assert.equal(d1.fase, "normal");
  assert.deepEqual([d1.amor.length, d1.picante.length, d1.corazon.length], [2, 2, 2]);
  const fin = preguntasDelDia("t", 30, P30);
  assert.equal(fin.fase, "final");
  assert.deepEqual([fin.amor.length, fin.picante.length, fin.corazon.length], [1, 1, 3]);
  assert.ok(fin.corazon.every((p) => Number(p.id.slice(1)) > 50), "en la recta final salen las profundas");
  assert.equal(diasFinal(30), 8);
});

test("plan: con temporada más larga, el banco se reparte (al menos 1 por día) y se avisa si falta", () => {
  const amor45 = conteos("amor", 45);
  assert.ok(amor45.every((c) => c >= 1) && amor45.reduce((a, c) => a + c, 0) === 60);
  const falta = cobertura(60).find((c) => c.banco === "manada");
  assert.equal(falta?.faltan, 15);
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
  assert.equal(validarRespuesta(5, "Culpable").ok, true);
  assert.equal(validarRespuesta(5, "Tal vez").ok, false);
  assert.equal(validarRespuesta(6, "Viajar a Cusco con mis amigos").ok, true);
  assert.equal(validarRespuesta(6, " ").ok, false);
});

test("manada: empates cuentan como mayoría; rareza compara sin tildes", () => {
  assert.deepEqual([...mayoria(["0", "1", "1", "0", "2"])].sort(), ["0", "1"]);
  assert.equal(igualQue("Sí", ["si", "Sí", "No", "No"]), 0.5);
});

test("agregar preguntas al final no cambia las de los días ya jugados", () => {
  // Mientras el plan use solo el primer lote (50 de Amor y de Picante), los ids son de ese lote.
  const cs = conteos("amor", 30);
  let acum = 0;
  for (let d = 1; d <= 30; d++) {
    acum += cs[d - 1];
    if (acum > 50) break;
    const q = preguntasDelDia("temporada-y", d, P30);
    for (const p of [...q.amor, ...q.picante]) assert.ok(Number(p.id.slice(1)) <= 50, `día ${d}: ${p.id} es del lote nuevo`);
  }
});
