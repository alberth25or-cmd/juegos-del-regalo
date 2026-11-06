/**
 * Búsqueda de camino A* en la cuadrícula (4 direcciones). Determinística: dado el
 * mismo origen y destino, todos los celulares calculan EXACTAMENTE el mismo camino,
 * por eso por la red solo viaja "voy de A a B" y no cada paso.
 */
import { caminable, type Sala } from "./mapas.ts";

export interface Punto {
  x: number;
  y: number;
}

const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;

/** Baldosa caminable más cercana a un punto (por si tocan un árbol o una pared). */
export function masCercanoCaminable(s: Sala, p: Punto, desde?: Punto): Punto | null {
  const px = Math.round(p.x);
  const py = Math.round(p.y);
  if (caminable(s, px, py)) return { x: px, y: py };
  let mejor: Punto | null = null;
  let mejorD = Infinity;
  for (let r = 1; r <= 4; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = px + dx;
        const y = py + dy;
        if (!caminable(s, x, y)) continue;
        // Preferir el lado desde el que viene el jugador (abajo de un objeto, por ejemplo).
        const d = Math.hypot(dx, dy) + (desde ? Math.hypot(x - desde.x, y - desde.y) * 0.01 : 0);
        if (d < mejorD) {
          mejorD = d;
          mejor = { x, y };
        }
      }
    }
    if (mejor) return mejor;
  }
  return null;
}

/** Camino de baldosas (sin incluir el origen). [] si ya está ahí o no hay camino. */
export function buscarRuta(s: Sala, origen: Punto, destino: Punto, maxNodos = 4000): Punto[] {
  const ox = Math.round(origen.x);
  const oy = Math.round(origen.y);
  const fin = masCercanoCaminable(s, destino, origen);
  if (!fin || (fin.x === ox && fin.y === oy)) return [];
  const W = s.ancho;
  const idx = (x: number, y: number) => y * W + x;
  const g = new Map<number, number>();
  const padre = new Map<number, number>();
  const abiertos: { i: number; f: number; g: number }[] = [];
  const h = (x: number, y: number) => Math.abs(x - fin.x) + Math.abs(y - fin.y);
  const inicio = idx(ox, oy);
  g.set(inicio, 0);
  abiertos.push({ i: inicio, f: h(ox, oy), g: 0 });
  let vistos = 0;
  while (abiertos.length && vistos++ < maxNodos) {
    // Lista pequeña: buscar el mínimo es suficiente y determinístico (empate por índice).
    let k = 0;
    for (let j = 1; j < abiertos.length; j++) if (abiertos[j].f < abiertos[k].f || (abiertos[j].f === abiertos[k].f && abiertos[j].i < abiertos[k].i)) k = j;
    const actual = abiertos.splice(k, 1)[0];
    const cx = actual.i % W;
    const cy = Math.floor(actual.i / W);
    if (cx === fin.x && cy === fin.y) {
      const ruta: Punto[] = [];
      let n = actual.i;
      while (n !== inicio) {
        ruta.push({ x: n % W, y: Math.floor(n / W) });
        n = padre.get(n)!;
      }
      return ruta.reverse();
    }
    if (actual.g > (g.get(actual.i) ?? Infinity)) continue;
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (!caminable(s, nx, ny)) continue;
      const ni = idx(nx, ny);
      const ng = actual.g + 1;
      if (ng < (g.get(ni) ?? Infinity)) {
        g.set(ni, ng);
        padre.set(ni, actual.i);
        abiertos.push({ i: ni, g: ng, f: ng + h(nx, ny) });
      }
    }
  }
  return [];
}

/** Velocidad al caminar (baldosas por segundo). */
export const VELOCIDAD = 4.2;

/** Posición en un camino `t` ms después de empezar a recorrerlo. */
export function posicionEnRuta(origen: Punto, ruta: Punto[], ms: number): { p: Punto; dir: Punto; termino: boolean } {
  // El reloj del cuadro puede ir unos ms detrás del inicio: nunca negativo.
  const pasos = ((Number.isFinite(ms) ? Math.max(0, ms) : 0) / 1000) * VELOCIDAD;
  if (ruta.length === 0) return { p: origen, dir: { x: 0, y: 1 }, termino: true };
  const n = Math.floor(pasos);
  if (n >= ruta.length) {
    const prev = ruta.length > 1 ? ruta[ruta.length - 2] : origen;
    const ult = ruta[ruta.length - 1];
    return { p: ult, dir: { x: Math.sign(ult.x - prev.x), y: Math.sign(ult.y - prev.y) }, termino: true };
  }
  const a = n === 0 ? origen : ruta[n - 1];
  const b = ruta[n];
  const f = pasos - n;
  return { p: { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }, dir: { x: Math.sign(b.x - a.x), y: Math.sign(b.y - a.y) }, termino: false };
}
