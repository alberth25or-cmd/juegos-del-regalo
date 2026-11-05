/**
 * Cuadros de animación de los personajes del mundo (4 direcciones × 3 poses),
 * generados a partir del avatar pixel de cada jugador. Se cachean por avatar.
 */
import { avatarValido } from "@/features/avatar";
import type { NpcId } from "@/features/contenido/npcs";
import { avatarSprite, NPC_SPRITES, type SpriteDef } from "@/components/rpg/sprites";

export type Dir = "abajo" | "arriba" | "izq" | "der";

export interface Cuadros {
  w: number;
  h: number;
  dir: Record<Dir, HTMLCanvasElement[]>;
}

function rasterizar(rows: string[], colors: Record<string, string>): HTMLCanvasElement {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const c = document.createElement("canvas");
  c.width = w + 2;
  c.height = h + 2;
  const g = c.getContext("2d")!;
  const lleno = (x: number, y: number) => y >= 0 && y < h && x >= 0 && x < (rows[y]?.length ?? 0) && rows[y][x] !== "." && !!colors[rows[y][x]];
  for (let y = -1; y <= h; y++)
    for (let x = -1; x <= w; x++) {
      let col: string | null = null;
      if (lleno(x, y)) col = colors[rows[y][x]];
      else if (lleno(x + 1, y) || lleno(x - 1, y) || lleno(x, y + 1) || lleno(x, y - 1)) col = "#2a2342";
      if (col) {
        g.fillStyle = col;
        g.fillRect(x + 1, y + 1, 1, 1);
      }
    }
  return c;
}

const PIERNAS = {
  quieto: ["...BB....BB...", "..BBB....BBB.."],
  pasoA: ["..BB......BB..", ".BBB.......BB."],
  pasoB: ["....BB..BB....", "....BB..BB...."],
};
const PIERNAS_LADO = {
  quieto: [".....BBBB.....", ".....BBBBB...."],
  pasoA: ["...BB....BB...", "..BBB.....BB.."],
  pasoB: [".....BBBB.....", "......BBBB...."],
};

function conPiernas(rows: string[], piernas: string[]) {
  const out = [...rows];
  out[16] = piernas[0];
  out[17] = piernas[1];
  return out;
}

function deEspaldas(rows: string[]) {
  return rows.map((r, y) => {
    if (y < 5 || y > 9) return r;
    // la cara se vuelve pelo; la bufanda y el gorro se mantienen
    return r.replace(/[Fkmr]/g, (ch, x: number) => (y === 9 && (x < 4 || x > 9) ? ch : "P"));
  });
}

function deLado(rows: string[]) {
  return rows.map((r, y) => {
    if (y === 7) return r.replace(/k/g, "F").replace(/^(.{9})F/, "$1k");
    if (y === 5) return r.replace(/^(.{3})P/, "$1P");
    if (y >= 11 && y <= 15) return r.replace(/^\.F/, ".C").replace(/F\.$/, "C.");
    return r;
  });
}

function espejo(c: HTMLCanvasElement) {
  const m = document.createElement("canvas");
  m.width = c.width;
  m.height = c.height;
  const g = m.getContext("2d")!;
  g.translate(c.width, 0);
  g.scale(-1, 1);
  g.drawImage(c, 0, 0);
  return m;
}

const cache = new Map<string, Cuadros>();

export function cuadrosAvatar(config: unknown): Cuadros {
  const a = avatarValido(config);
  const clave = JSON.stringify(a);
  const hit = cache.get(clave);
  if (hit) return hit;
  const sp: SpriteDef = avatarSprite(a);
  const frente = sp.rows;
  const espalda = deEspaldas(frente);
  const lado = deLado(frente);
  const hacer = (rows: string[], p: typeof PIERNAS) => [rasterizar(conPiernas(rows, p.quieto), sp.colors), rasterizar(conPiernas(rows, p.pasoA), sp.colors), rasterizar(conPiernas(rows, p.pasoB), sp.colors)];
  const der = hacer(lado, PIERNAS_LADO);
  const cuadros: Cuadros = {
    w: der[0].width,
    h: der[0].height,
    dir: { abajo: hacer(frente, PIERNAS), arriba: hacer(espalda, PIERNAS), der, izq: der.map(espejo) },
  };
  cache.set(clave, cuadros);
  return cuadros;
}

const cacheNpc = new Map<NpcId, { der: HTMLCanvasElement; izq: HTMLCanvasElement }>();

export function cuadrosNpc(id: NpcId) {
  const hit = cacheNpc.get(id);
  if (hit) return hit;
  const s = NPC_SPRITES[id];
  const der = rasterizar(s.rows, s.colors);
  const v = { der, izq: espejo(der) };
  cacheNpc.set(id, v);
  return v;
}
