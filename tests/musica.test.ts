import { test } from "node:test";
import assert from "node:assert/strict";
import { duracion, frecuencia, leerVoz, PISTAS } from "../src/features/musica/villancicos.ts";

test("música: afinación (La4 = 440 Hz, Do5 ≈ 523 Hz, Sib4 ≈ 466 Hz)", () => {
  assert.equal(Math.round(frecuencia("A4")), 440);
  assert.equal(Math.round(frecuencia("C5")), 523);
  assert.equal(Math.round(frecuencia("Bb4")), 466);
  assert.equal(Math.round(frecuencia("G2")), 98);
});

test("música: cada villancico se lee y la melodía dura lo mismo que el bajo (bucle sin desfase)", () => {
  for (const [nombre, p] of Object.entries(PISTAS)) {
    const m = leerVoz(p.melodia);
    const b = leerVoz(p.bajo);
    assert.ok(m.length > 10, nombre);
    assert.equal(duracion(m), duracion(b), nombre);
    const compas = nombre === "nieve" ? 4 : 3;
    assert.equal(duracion(m) % compas, 0, `${nombre}: compases completos`);
  }
});

test("música: notas inválidas fallan claro", () => {
  assert.throws(() => leerVoz("H4"));
  assert.throws(() => leerVoz("C4:0"));
});
