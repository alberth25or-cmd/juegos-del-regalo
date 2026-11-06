/**
 * Procesa el arte del mundo generado con Higgsfield (art-src/mundo/*.png):
 *  1. Quita el fondo magenta/rosado con relleno desde los bordes (no toca rosas internos).
 *  2. Recorta al contenido, reduce a la resolución pixel real del juego y endurece el alfa.
 *  3. Cuantiza la paleta sin tramado.
 * Salida: public/art/mundo/<id>.png + src/lib/assets/mundo.json (tamaños).
 *
 *   node scripts/process-mundo.mjs
 */
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "art-src", "mundo");
const OUT = join(ROOT, "public", "art", "mundo");
mkdirSync(OUT, { recursive: true });

// Ancho final en pixeles de arte (1 baldosa = 16 px). Los edificios ocupan su huella del mapa.
const ANCHO = {
  fabrica: 128,
  trofeos: 128,
  arcade: 128,
  tablon: 112,
  arena: 128,
  mercado: 96,
  maquina: 30,
  cueva: 64,
  mostrador: 112,
};
const RETRATO = 112;

function esFondo(r, g, b) {
  // Magenta / rosa intenso de los fondos generados (varía entre imágenes).
  return r > 140 && g < 110 && b > 70 && r - g > 90 && b - g > 40;
}

async function procesar(id) {
  const { data, info } = await sharp(join(SRC, `${id}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const visto = new Uint8Array(W * H);
  const pila = [];
  const empujar = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = y * W + x;
    if (visto[i]) return;
    const p = i * 4;
    if (!esFondo(data[p], data[p + 1], data[p + 2])) return;
    visto[i] = 1;
    pila.push(i);
  };
  for (let x = 0; x < W; x++) {
    empujar(x, 0);
    empujar(x, H - 1);
  }
  for (let y = 0; y < H; y++) {
    empujar(0, y);
    empujar(W - 1, y);
  }
  while (pila.length) {
    const i = pila.pop();
    const x = i % W;
    const y = (i / W) | 0;
    empujar(x + 1, y);
    empujar(x - 1, y);
    empujar(x, y + 1);
    empujar(x, y - 1);
  }
  // Fondo fuera + halo rosado de los bordes.
  for (let i = 0; i < W * H; i++) {
    const p = i * 4;
    if (visto[i]) data[p + 3] = 0;
  }
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (visto[i]) continue;
      const p = i * 4;
      const r = data[p], g = data[p + 1], b = data[p + 2];
      const vecinoFondo = visto[i - 1] || visto[i + 1] || visto[i - W] || visto[i + W];
      if (vecinoFondo && r > 120 && b > 60 && r - g > 60 && b - g > 20) data[p + 3] = 0;
    }
  // Caja del contenido
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (data[(y * W + x) * 4 + 3] > 0) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  const recorte = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).extract({ left: x0, top: y0, width: cw, height: ch }).raw().toBuffer();
  const retrato = id.startsWith("retrato-");
  const ancho = retrato ? RETRATO : (ANCHO[id] ?? 64);
  const alto = Math.round((ch / cw) * ancho);
  const chico = await sharp(recorte, { raw: { width: cw, height: ch, channels: 4 } }).resize(ancho, alto, { kernel: "mitchell" }).raw().toBuffer();
  for (let i = 0; i < chico.length; i += 4) {
    const r = chico[i], g = chico[i + 1], b = chico[i + 2];
    if (chico[i + 3] < 140 || esFondo(r, g, b)) chico[i] = chico[i + 1] = chico[i + 2] = chico[i + 3] = 0;
    else chico[i + 3] = 255;
  }
  await sharp(chico, { raw: { width: ancho, height: alto, channels: 4 } })
    .png({ palette: true, colors: retrato ? 64 : 48, dither: 0, compressionLevel: 9 })
    .toFile(join(OUT, `${id}.png`));
  return { src: `/art/mundo/${id}.png`, w: ancho, h: alto };
}

if (!existsSync(SRC)) {
  console.error("No hay art-src/mundo/. Genera primero con npm run hf:arte.");
  process.exit(1);
}
const manifiesto = {};
for (const f of readdirSync(SRC).filter((f) => f.endsWith(".png")).sort()) {
  const id = f.replace(/\.png$/, "");
  manifiesto[id] = await procesar(id);
  console.log(`✓ ${id} → ${manifiesto[id].w}×${manifiesto[id].h}`);
}
writeFileSync(join(ROOT, "src", "lib", "assets", "mundo.json"), JSON.stringify(manifiesto, null, 2) + "\n");
console.log(`Listo: ${Object.keys(manifiesto).length} imágenes en public/art/mundo/.`);
