import { test } from "node:test";
import assert from "node:assert/strict";
import { masPicantes, precio, puedePagar, puntajePicante, type RespuestaFicha } from "../src/features/stages/ficha.ts";

const r = (id: string, casa: 2 | 3 | 4, picor: 1 | 2 | 3, respuesta: string | null, igualQue?: number): RespuestaFicha => ({
  id, casa, picor, respuesta, igualQue, pregunta: `¿${id}?`,
});

test("ficha: fisgonear cuesta más mientras más íntima es la casa; un 'Pasó' es gratis", () => {
  assert.ok(precio(r("a", 2, 1, "x")) < precio(r("b", 3, 1, "x")));
  assert.ok(precio(r("b", 3, 1, "x")) < precio(r("c", 4, 1, "x")));
  assert.equal(precio(r("d", 4, 3, null)), 0);
});

test("ficha: el saldo tiene que alcanzar", () => {
  const sobre = r("a", 4, 3, "Sí");
  assert.equal(puedePagar(precio(sobre) - 1, sobre), false);
  assert.equal(puedePagar(precio(sobre), sobre), true);
});

test("ficha final: destaca lo más picante y lo más raro, nunca un 'Pasó'", () => {
  const rs = [
    r("suave-comun", 2, 1, "El panetón", 0.6),
    r("picante-comun", 4, 3, "No", 0.9),
    r("picante-raro", 4, 3, "Sí", 0.1),
    r("paso", 4, 3, null),
    r("amor-raro", 3, 2, "7", 0.05),
  ];
  assert.deepEqual(masPicantes(rs).map((x) => x.id), ["picante-raro", "picante-comun", "amor-raro"]);
  assert.ok(puntajePicante(rs[2]) > puntajePicante(rs[1]), "la rareza no suma");
  assert.equal(masPicantes(rs, 10).some((x) => x.id === "paso"), false);
});
