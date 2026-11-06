import { test } from "node:test";
import assert from "node:assert/strict";
import { caminable, sala, SALAS_IDS, salas, transicionEn } from "../src/features/mundo/mapas.ts";
import { buscarRuta, masCercanoCaminable, posicionEnRuta } from "../src/features/mundo/ruta.ts";
import { filtrarChat, FRASES_RAPIDAS } from "../src/features/contenido/filtro.ts";

test("todas las salas se construyen y su inicio es caminable", () => {
  for (const id of SALAS_IDS) {
    const s = sala(id);
    assert.equal(s.suelo.length, s.ancho * s.alto, id);
    assert.ok(caminable(s, s.inicio.x, s.inicio.y), `inicio de ${id}`);
  }
});

test("desde la plaza se llega a TODAS las puertas y a la salida del bosque", () => {
  const s = sala("snowville");
  for (const e of s.edificios) {
    const r = buscarRuta(s, s.inicio, e.puerta);
    assert.ok(r.length > 0, `sin camino a ${e.id}`);
    assert.deepEqual(r.at(-1), e.puerta, e.id);
    assert.equal(transicionEn(s, e.puerta.x, e.puerta.y)?.destino, e.id);
  }
  for (const sal of s.salidas) assert.ok(buscarRuta(s, s.inicio, sal).length > 0, `salida ${sal.destino}`);
});

test("en cada submundo se llega a la salida, a los objetos interactivos y a los NPCs", () => {
  for (const [id, s] of Object.entries(salas())) {
    if (id === "snowville") continue;
    for (const sal of s.salidas) {
      const r = buscarRuta(s, s.inicio, sal);
      assert.ok(r.length > 0 || (s.inicio.x === sal.x && s.inicio.y === sal.y), `${id}: salida`);
      // La llegada al volver es caminable en el destino
      assert.ok(caminable(sala(sal.destino), sal.llegada.x, sal.llegada.y), `${id}: llegada en ${sal.destino}`);
    }
    for (const o of s.objetos.filter((o) => o.interaccion)) {
      const junto = masCercanoCaminable(s, { x: o.x + Math.floor(o.w / 2), y: o.y + o.h }, s.inicio);
      assert.ok(junto, `${id}: junto a ${o.tipo}`);
      assert.ok(buscarRuta(s, s.inicio, junto!).length > 0 || (junto!.x === s.inicio.x && junto!.y === s.inicio.y), `${id}: llegar a ${o.tipo}`);
    }
    for (const n of s.npcs) assert.ok(masCercanoCaminable(s, n), `${id}: npc ${n.id}`);
  }
});

test("la ruta es determinística y la posición avanza a velocidad constante", () => {
  const s = sala("snowville");
  const a = buscarRuta(s, { x: 23, y: 25 }, { x: 39, y: 7 });
  const b = buscarRuta(s, { x: 23, y: 25 }, { x: 39, y: 7 });
  assert.deepEqual(a, b);
  const p0 = posicionEnRuta({ x: 23, y: 25 }, a, 0);
  assert.deepEqual(p0.p, { x: 23, y: 25 });
  const fin = posicionEnRuta({ x: 23, y: 25 }, a, 1e7);
  assert.ok(fin.termino);
  assert.deepEqual(fin.p, { x: 39, y: 7 });
});

test("un tiempo negativo (reloj del cuadro atrasado) no rompe la posición", () => {
  const r = posicionEnRuta({ x: 1, y: 1 }, [{ x: 2, y: 1 }, { x: 3, y: 1 }], -5);
  assert.deepEqual(r.p, { x: 1, y: 1 });
  assert.equal(r.termino, false);
});

test("tocar un árbol lleva a la baldosa libre más cercana", () => {
  const s = sala("snowville");
  const arbol = s.objetos.find((o) => o.tipo === "arbolPlaza")!;
  const p = masCercanoCaminable(s, { x: arbol.x + 1, y: arbol.y + 1 });
  assert.ok(p && caminable(s, p.x, p.y));
});

// ---------------------------------------------------------------- chat
test("filtro de chat: limpia, recorta y bloquea lo discriminatorio", () => {
  assert.deepEqual(filtrarChat("  hola   gente  "), { ok: true, texto: "hola gente" });
  assert.equal(filtrarChat("").ok, false);
  assert.equal(filtrarChat("a".repeat(200)).ok, true);
  assert.ok((filtrarChat("a".repeat(200)) as { texto: string }).texto.length <= 60);
  assert.equal(filtrarChat("eres un maricon").ok, false);
  assert.equal(filtrarChat("mi número es 987654321").ok, false);
  const m = filtrarChat("qué mierda de partida");
  assert.ok(m.ok && !m.texto.includes("mierda"));
  assert.ok(FRASES_RAPIDAS.length >= 8);
});

test("los juegos nuevos tienen su puerta en el mundo (no 'Próximamente')", () => {
  const hrefs = new Set<string>();
  for (const id of SALAS_IDS) for (const o of sala(id).objetos) if (o.interaccion?.href) hrefs.add(o.interaccion.href);
  for (const h of ["/arcade/gift-catcher", "/arcade/memory", "/arena/trivia", "/votacion", "/energia"]) assert.ok(hrefs.has(h), h);
});
