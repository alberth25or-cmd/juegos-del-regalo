/**
 * Equilibrio de la economía: fisgonear ni regalado ni imposible, y pasar nunca conviene más
 * que responder. Si alguien cambia un precio en economia.ts y rompe el equilibrio, esto avisa.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  costoFisgonearTodoElDia,
  costoPasar,
  costoVencida,
  DIA_TIPICO,
  FISGONEAR,
  gananciaDiaria,
  gananciaPorRespuesta,
  PASAR,
  PASES_POR_CASA,
} from "../src/features/scoring/economia.ts";

const tipico = gananciaDiaria(DIA_TIPICO);

test("economía: un día típico da entre 300 y 450 monedas", () => {
  assert.ok(tipico >= 300 && tipico <= 450, `día típico = ${tipico}`);
  assert.ok(gananciaDiaria({ rendimiento: 1, coincide: 1, juegaPicante: true }) > tipico);
});

test("fisgonear no es regalado: un día típico NO alcanza para abrir todo lo del día", () => {
  assert.ok(costoFisgonearTodoElDia() > tipico, `${costoFisgonearTodoElDia()} vs ${tipico}`);
});

test("fisgonear no es imposible: un día típico alcanza para 2 sobres de Amor o 1 de Picante y 1 de Manada", () => {
  assert.ok(tipico >= 2 * FISGONEAR[3]);
  assert.ok(tipico >= FISGONEAR[4] + FISGONEAR[2]);
});

test("pasar siempre sale peor que responder (cuesta más de lo que da responder)", () => {
  for (const casa of [3, 4] as const) assert.ok(PASAR[casa] > gananciaPorRespuesta(casa), `casa ${casa}`);
  assert.equal(costoPasar(2, 0).permitido, false, "La manada no tiene Paso");
  assert.equal(costoPasar(5, 0).permitido, false, "El Juicio no tiene Paso");
});

test("hay un límite de pases por casa", () => {
  const ok = costoPasar(3, PASES_POR_CASA - 1);
  assert.equal(ok.permitido, true);
  assert.equal(ok.permitido && ok.quedan, 0);
  assert.equal(costoPasar(3, PASES_POR_CASA).permitido, false);
});

test("dejar vencer no es un Paso gratis: cuesta igual, gasta un pase y sin pases cuesta el doble", () => {
  const v = costoVencida(4, 0);
  assert.equal(v.monedas, PASAR[4]);
  assert.equal(v.gastaPase, true);
  const sin = costoVencida(4, PASES_POR_CASA);
  assert.equal(sin.monedas, PASAR[4] * 2);
  assert.ok(costoVencida(2, 0).monedas > 0, "faltar en La manada también resta");
});

test("quien no juega Picante gana menos pero no queda fuera", () => {
  const sin = gananciaDiaria({ ...DIA_TIPICO, juegaPicante: false });
  assert.ok(sin < tipico && sin > 0);
});
