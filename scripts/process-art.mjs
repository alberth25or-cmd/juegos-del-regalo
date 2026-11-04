/**
 * Procesa el arte generado (Higgsfield) a assets pixel reales:
 *  1. Quita el fondo magenta (chroma key).
 *  2. Reduce a la resolución real de pixel art y endurece el alfa.
 *  3. Cuantiza la paleta (sin tramado) para pixeles limpios.
 *  4. Recorta sprites de la hoja y vuelve las capas repetibles sin costura.
 *
 * Uso: node scripts/process-art.mjs
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "art-src");
const OUT = join(ROOT, "public", "art");
mkdirSync(join(OUT, "sprites"), { recursive: true });
mkdirSync(join(OUT, "layers"), { recursive: true });

function isKey(r, g, b) {
  // magenta puro y sus bordes mezclados
  if (r > 170 && b > 170 && g < 120) return true;
  if (r - g > 110 && b - g > 110) return true;
  return false;
}

async function keyAndShrink(file, factor) {
  const img = sharp(join(SRC, file)).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (isKey(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 0;
    }
  }
  const w = Math.round(info.width / factor);
  const h = Math.round(info.height / factor);
  const small = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize(w, h, { kernel: "mitchell" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const d = small.data;
  // alfa binario + limpia restos rosados en bordes
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 150 || isKey(d[i], d[i + 1], d[i + 2])) {
      d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 0;
    } else {
      d[i + 3] = 255;
    }
  }
  return { data: d, width: small.info.width, height: small.info.height };
}

async function savePalette(raw, outFile, colors = 48) {
  await sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: 4 } })
    .png({ palette: true, colors, dither: 0, compressionLevel: 9 })
    .toFile(outFile);
}

function crop(raw, x0, y0, x1, y1) {
  const w = x1 - x0;
  const h = y1 - y0;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    raw.data.copy(out, y * w * 4, ((y0 + y) * raw.width + x0) * 4, ((y0 + y) * raw.width + x1) * 4);
  }
  return { data: out, width: w, height: h };
}

function bbox(raw, x0, y0, x1, y1) {
  let minX = x1, minY = y1, maxX = x0, maxY = y0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (raw.data[(y * raw.width + x) * 4 + 3] > 0) {
        // ignora pixeles sueltos (ruido)
        let n = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx, yy = y + dy;
            if (xx >= 0 && yy >= 0 && xx < raw.width && yy < raw.height && raw.data[(yy * raw.width + xx) * 4 + 3] > 0) n++;
          }
        if (n < 3) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { x0: minX, y0: minY, x1: maxX + 1, y1: maxY + 1 };
}

/** Objetos conectados (con dilatación para unir humo, chispas, trofeos…). */
function components(raw, dilate) {
  const { width: W, height: H } = raw;
  const solid = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) solid[i] = raw.data[i * 4 + 3] > 0 ? 1 : 0;
  const mask = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!solid[y * W + x]) continue;
      for (let dy = -dilate; dy <= dilate; dy++)
        for (let dx = -dilate; dx <= dilate; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < W && yy < H) mask[yy * W + xx] = 1;
        }
    }
  const label = new Int32Array(W * H);
  const out = [];
  let next = 1;
  for (let i = 0; i < W * H; i++) {
    if (!mask[i] || label[i]) continue;
    const stack = [i];
    label[i] = next;
    let x0 = W, y0 = H, x1 = 0, y1 = 0, area = 0;
    while (stack.length) {
      const p = stack.pop();
      const x = p % W, y = (p / W) | 0;
      if (solid[p]) {
        area++;
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const q = yy * W + xx;
        if (mask[q] && !label[q]) {
          label[q] = next;
          stack.push(q);
        }
      }
    }
    next++;
    if (area) out.push({ x0, y0, x1: x1 + 1, y1: y1 + 1, area });
  }
  return out;
}

const manifest = { sprites: {}, layers: {} };

/* ---------------- Sprites ---------------- */
if (existsSync(join(SRC, "sprites-raw.png"))) {
  const sheet = await keyAndShrink("sprites-raw.png", 6.5);
  const ids = ["casa-misiones", "muro-fotos", "buzon", "arbol", "cofre", "tablero-plaza", "tienda", "mascota"];
  const boxes = components(sheet, 4).filter((c) => c.area > 300);
  boxes.sort((p, q) => {
    const rp = (p.y0 + p.y1) / 2 > sheet.height / 2 ? 1 : 0;
    const rq = (q.y0 + q.y1) / 2 > sheet.height / 2 ? 1 : 0;
    return rp - rq || p.x0 - q.x0;
  });
  if (boxes.length !== ids.length) console.warn(`¡Ojo! se detectaron ${boxes.length} objetos, se esperaban ${ids.length}`);
  for (let i = 0; i < Math.min(ids.length, boxes.length); i++) {
    const b = boxes[i];
    const piece = crop(sheet, b.x0, b.y0, b.x1, b.y1);
    await savePalette(piece, join(OUT, "sprites", `${ids[i]}.png`), 40);
    manifest.sprites[ids[i]] = { src: `/art/sprites/${ids[i]}.png`, w: piece.width, h: piece.height };
    console.log("sprite", ids[i], piece.width, "x", piece.height);
  }
}

/* ---------------- Capas ---------------- */
const LAYERS = [
  { file: "mountains-raw.png", id: "mountains", factor: 9 },
  { file: "hills-raw.png", id: "hills", factor: 8 },
  { file: "ground-raw.png", id: "ground", factor: 7, cropTop: 0.355 },
  { file: "foreground-raw.png", id: "foreground", factor: 8 },
];
for (const L of LAYERS) {
  if (!existsSync(join(SRC, L.file))) continue;
  const raw = await keyAndShrink(L.file, L.factor);
  if (L.cropTop) {
    const cut = Math.round(raw.height * L.cropTop) * raw.width * 4;
    raw.data.fill(0, 0, cut);
  }
  const b = bbox(raw, 0, 0, raw.width, raw.height);
  // conserva el ancho completo, recorta el aire de arriba
  const piece = crop(raw, 0, Math.max(0, b.y0), raw.width, raw.height);
  // tile sin costura: imagen + su espejo
  const tile = {
    width: piece.width * 2,
    height: piece.height,
    data: Buffer.alloc(piece.width * 2 * piece.height * 4),
  };
  for (let y = 0; y < piece.height; y++) {
    for (let x = 0; x < piece.width; x++) {
      const s = (y * piece.width + x) * 4;
      const d1 = (y * tile.width + x) * 4;
      const d2 = (y * tile.width + (tile.width - 1 - x)) * 4;
      piece.data.copy(tile.data, d1, s, s + 4);
      piece.data.copy(tile.data, d2, s, s + 4);
    }
  }
  await savePalette(tile, join(OUT, "layers", `${L.id}.png`), 48);
  manifest.layers[L.id] = { src: `/art/layers/${L.id}.png`, w: tile.width, h: tile.height };
  console.log("layer", L.id, tile.width, "x", tile.height);
}

writeFileSync(join(ROOT, "src", "lib", "assets", "art.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("ok → src/lib/assets/art.json");
