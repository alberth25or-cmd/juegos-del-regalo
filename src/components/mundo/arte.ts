/**
 * Arte del mundo dibujado en código (pixel art, 16 px por baldosa), más los
 * sprites de Higgsfield que ya existen (casa, tienda, árbol, buzón, cofre, fotos).
 * Todo se pinta UNA vez en lienzos fuera de pantalla; cada cuadro solo copia.
 * Cuando haya arte nuevo de Higgsfield, se reemplaza aquí sin tocar el motor.
 */
import type { Edificio, Objeto, Sala, Suelo } from "@/features/mundo/mapas";
import arteMundo from "@/lib/assets/mundo.json";

export const T = 16;

function lienzo(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  return { c, g };
}

/** Ruido determinístico por coordenada (0..1). */
function ruido(x: number, y: number, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function px(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
}

// ---------------------------------------------------------------- imágenes
const IMGS: Record<string, string> = {
  casa: "/art/sprites/casa-misiones.png",
  tienda: "/art/sprites/tienda.png",
  arbol: "/art/sprites/arbol.png",
  buzon: "/art/sprites/buzon.png",
  cofre: "/art/sprites/cofre.png",
  fotos: "/art/sprites/muro-fotos.png",
  tablero: "/art/sprites/tablero-plaza.png",
  // Arte del mundo generado con la API de Higgsfield (scripts/higgsfield/generar-arte.ts)
  ...Object.fromEntries(Object.entries(arteMundo as Record<string, { src: string }>).map(([k, v]) => [`mundo:${k}`, v.src])),
};
const cargadas: Record<string, HTMLImageElement> = {};

export function precargarImagenes(): Promise<void> {
  return Promise.all(
    Object.entries(IMGS).map(
      ([k, src]) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            cargadas[k] = img;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => undefined);
}

function dibujarImagen(g: CanvasRenderingContext2D, k: string, x: number, y: number, w: number) {
  const img = cargadas[k];
  if (!img) return false;
  const h = (img.height / img.width) * w;
  g.drawImage(img, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  return true;
}

// ------------------------------------------------------------------ suelos
const SUELO_BASE: Record<Suelo, string> = {
  nieve: "#e9f1fb",
  nieveOscura: "#c3d0e4",
  camino: "#9aa6bb",
  plaza: "#dccaa9",
  hielo: "#bfe6f5",
  madera: "#a8713f",
  alfombra: "#4b3b8f",
  alfombraRoja: "#9b2d3b",
  oscuro: "#2b2440",
  muro: "#e8d9c0",
};

function pintarSuelo(g: CanvasRenderingContext2D, s: Sala, tx: number, ty: number) {
  const tipo = s.suelo[ty * s.ancho + tx];
  const x = tx * T;
  const y = ty * T;
  px(g, x, y, T, T, SUELO_BASE[tipo]);
  const r = (k: number) => ruido(tx, ty, k);
  switch (tipo) {
    case "nieve":
    case "nieveOscura": {
      const claro = tipo === "nieve" ? "#ffffff" : "#d6e0ee";
      const sombra = tipo === "nieve" ? "#d5e1f1" : "#a9b8cf";
      for (let k = 0; k < 4; k++) px(g, x + Math.floor(r(k) * 15), y + Math.floor(r(k + 9) * 15), 1, 1, k % 2 ? claro : sombra);
      if (r(20) < 0.12) px(g, x + 3 + Math.floor(r(21) * 8), y + 10, 4, 1, sombra);
      break;
    }
    case "camino": {
      for (let k = 0; k < 4; k++) {
        const fila = Math.floor(k / 2);
        const sx = x + (k % 2) * 8 + 1 + ((ty + fila) % 2 ? 0 : 0);
        const sy = y + fila * 8;
        px(g, sx, sy + 1, 6, 6, r(k) < 0.5 ? "#b2bdd0" : "#a7b3c7");
        px(g, sx, sy + 6, 6, 1, "#7d889e");
      }
      if (r(7) < 0.3) px(g, x + Math.floor(r(8) * 12), y + Math.floor(r(9) * 12), 3, 2, "#e9f1fb");
      break;
    }
    case "plaza": {
      for (let k = 0; k < 4; k++) {
        const qx = x + (k % 2) * 8;
        const qy = y + Math.floor(k / 2) * 8;
        const a = (tx * 2 + (k % 2) + ty * 2 + Math.floor(k / 2)) % 2 === 0;
        px(g, qx, qy, 8, 8, a ? "#e3d3b6" : "#d6c3a2");
        px(g, qx, qy + 7, 8, 1, "#c2ae8b");
        px(g, qx + 7, qy, 1, 8, "#c2ae8b");
      }
      if (r(3) < 0.2) px(g, x + 4 + Math.floor(r(4) * 8), y + 4 + Math.floor(r(5) * 8), 2, 1, "#ffffff");
      break;
    }
    case "hielo": {
      px(g, x + Math.floor(r(1) * 8), y + Math.floor(r(2) * 8), 6, 1, "#e8f8ff");
      px(g, x + Math.floor(r(3) * 10), y + 8 + Math.floor(r(4) * 6), 4, 1, "#e8f8ff");
      if (r(5) < 0.25) px(g, x + 2 + Math.floor(r(6) * 10), y + 3 + Math.floor(r(7) * 10), 1, 3, "#9fd0e6");
      break;
    }
    case "madera": {
      for (let k = 0; k < 4; k++) {
        px(g, x, y + k * 4, T, 4, k % 2 ? "#9d683a" : "#b07a46");
        px(g, x, y + k * 4 + 3, T, 1, "#7d5230");
        px(g, x + ((ty * 4 + k * 7) % 16), y + k * 4, 1, 3, "#7d5230");
      }
      break;
    }
    case "alfombra":
    case "alfombraRoja": {
      const det = tipo === "alfombra" ? "#5d4ba6" : "#c79a3b";
      if ((tx + ty) % 2 === 0) {
        px(g, x + 7, y + 3, 2, 2, det);
        px(g, x + 5, y + 5, 6, 2, det);
        px(g, x + 7, y + 7, 2, 2, det);
      }
      if (r(1) < 0.1) px(g, x + Math.floor(r(2) * 14), y + Math.floor(r(3) * 14), 1, 1, "#ffffff22");
      break;
    }
    case "oscuro": {
      px(g, x, y, T, T, (tx + ty) % 2 ? "#2b2440" : "#322a4b");
      px(g, x, y + 15, T, 1, "#211b33");
      break;
    }
    case "muro": {
      const bajo = ty === 1;
      for (let k = 0; k < T; k += 4) px(g, x + k, y, 2, T, "#dccab0");
      if (!bajo) px(g, x, y, T, 3, "#3b2f4f");
      if (bajo) {
        px(g, x, y + 12, T, 4, "#7d5230");
        px(g, x, y + 12, T, 1, "#5a3a22");
      }
      break;
    }
  }
}

// ----------------------------------------------------------------- objetos
function pino(variante = 0) {
  const { c, g } = lienzo(18, 28);
  const verdes = [
    ["#1f6b4d", "#2e8a62"],
    ["#245f4a", "#337f5f"],
    ["#1d5c46", "#2b7a5a"],
  ][variante % 3];
  px(g, 7, 22, 4, 6, "#6b4a2e");
  const capa = (top: number, alto: number, ancho: number) => {
    for (let r = 0; r < alto; r++) {
      const w = Math.round(2 + ((ancho - 2) * r) / (alto - 1));
      const x0 = 9 - Math.floor(w / 2);
      px(g, x0, top + r, w, 1, verdes[0]);
      px(g, x0, top + r, Math.ceil(w / 2), 1, verdes[1]);
      px(g, x0 - 1, top + r, 1, 1, "#16402f");
      px(g, x0 + w, top + r, 1, 1, "#16402f");
    }
    px(g, 9 - Math.floor(ancho / 4), top + alto - 2, Math.floor(ancho / 2), 1, "#ffffff");
  };
  capa(1, 9, 10);
  capa(7, 9, 14);
  capa(13, 10, 17);
  px(g, 8, 0, 2, 2, "#ffffff");
  px(g, 4, 21, 3, 1, "#ffffff");
  px(g, 12, 21, 3, 1, "#ffffff");
  return c;
}

function farol() {
  const { c, g } = lienzo(10, 30);
  px(g, 4, 8, 2, 20, "#3b3f5c");
  px(g, 2, 27, 6, 3, "#2a2342");
  px(g, 1, 2, 8, 7, "#2a2342");
  px(g, 2, 3, 6, 5, "#f6d36b");
  px(g, 3, 4, 2, 2, "#fff6e5");
  px(g, 2, 0, 6, 2, "#3b3f5c");
  px(g, 1, 0, 8, 1, "#ffffff");
  return c;
}

function banca() {
  const { c, g } = lienzo(32, 14);
  px(g, 1, 2, 30, 4, "#8a5a3b");
  px(g, 1, 7, 30, 3, "#a06c40");
  px(g, 1, 2, 30, 1, "#ffffff");
  px(g, 3, 10, 2, 4, "#3b3f5c");
  px(g, 27, 10, 2, 4, "#3b3f5c");
  return c;
}

function muneco(v = 0) {
  const { c, g } = lienzo(16, 22);
  px(g, 3, 11, 10, 10, "#f4f8ff");
  px(g, 2, 13, 12, 6, "#f4f8ff");
  px(g, 4, 4, 8, 8, "#ffffff");
  px(g, 3, 6, 10, 4, "#ffffff");
  px(g, 3, 19, 10, 2, "#c9d6e8");
  px(g, 5, 7, 2, 2, "#2a2342");
  px(g, 9, 7, 2, 2, "#2a2342");
  px(g, 8, 9, 4, 1, "#e67e22");
  px(g, 4, 11, 8, 2, v ? "#2e9e78" : "#e2445c");
  px(g, 5, 0, 6, 4, "#2a2342");
  px(g, 3, 3, 10, 1, "#2a2342");
  px(g, 7, 14, 2, 2, "#2a2342");
  px(g, 7, 17, 2, 2, "#2a2342");
  return c;
}

function roca(v = 0) {
  const { c, g } = lienzo(16, 14);
  px(g, 2, 5, 12, 8, v % 2 ? "#8f9bb0" : "#7f8aa0");
  px(g, 4, 3, 8, 3, "#9aa6bb");
  px(g, 3, 3, 9, 2, "#ffffff");
  px(g, 2, 12, 12, 1, "#5d6780");
  return c;
}

function regalos(v = 0) {
  const { c, g } = lienzo(16, 16);
  const cols = [
    ["#e2445c", "#f6b93b"],
    ["#2e9e78", "#fff6e5"],
    ["#7b4bb7", "#f6b93b"],
  ][v % 3];
  px(g, 1, 7, 9, 8, cols[0]);
  px(g, 5, 7, 1, 8, cols[1]);
  px(g, 1, 10, 9, 1, cols[1]);
  px(g, 8, 2, 7, 6, cols[1] === "#fff6e5" ? "#e2445c" : "#57b9f0");
  px(g, 11, 2, 1, 6, "#fff6e5");
  px(g, 4, 5, 3, 2, cols[1]);
  px(g, 1, 15, 14, 1, "#2a234255");
  return c;
}

function valla(w: number) {
  const { c, g } = lienzo(w * T, 14);
  px(g, 0, 5, w * T, 2, "#8a5a3b");
  px(g, 0, 10, w * T, 2, "#8a5a3b");
  for (let x = 1; x < w * T; x += 5) {
    px(g, x, 1, 3, 13, "#a06c40");
    px(g, x, 1, 3, 1, "#ffffff");
  }
  return c;
}

function maquina(v = 0) {
  const { c, g } = lienzo(30, 38);
  const cuerpo = ["#e2445c", "#57b9f0", "#f6b93b"][v % 3];
  px(g, 2, 4, 26, 34, "#2a2342");
  px(g, 3, 5, 24, 32, cuerpo);
  px(g, 3, 5, 24, 6, "#2a2342");
  px(g, 5, 6, 20, 4, ["#ffd23f", "#ff8fb0", "#9fe3cf"][v % 3]);
  px(g, 6, 13, 18, 12, "#111428");
  px(g, 5, 27, 20, 4, "#3b3f5c");
  px(g, 8, 28, 3, 2, "#e2445c");
  px(g, 13, 28, 2, 2, "#57b9f0");
  px(g, 17, 28, 2, 2, "#f6b93b");
  px(g, 3, 5, 2, 32, "#ffffff33");
  return c;
}

function tablero(w: number, h: number) {
  const { c, g } = lienzo(w * T, h * T + 6);
  px(g, 0, 0, w * T, h * T + 2, "#6b4a2e");
  px(g, 2, 2, w * T - 4, h * T - 2, "#c8945a");
  const colores = ["#fff6e5", "#ffb3c7", "#f6d36b", "#9fe3cf", "#b9a7f5"];
  for (let k = 0; k < w * 2; k++) {
    const x = 5 + ((k * 13) % (w * T - 16));
    const y = 4 + ((k * 7) % (h * T - 12));
    px(g, x, y, 9, 8, colores[k % colores.length]);
    px(g, x + 1, y + 2, 6, 1, "#8a8aa0");
    px(g, x + 1, y + 4, 5, 1, "#8a8aa0");
    px(g, x + 4, y - 1, 2, 2, "#e2445c");
  }
  return c;
}

function mueble(tipo: "mostrador" | "estante" | "trofeos" | "mesa" | "podio" | "marcador" | "medidor" | "cabina" | "microfono" | "runa" | "cueva", w: number, h: number, v = 0) {
  const W = w * T;
  const H = h * T;
  switch (tipo) {
    case "mostrador": {
      const { c, g } = lienzo(W, 26);
      px(g, 0, 6, W, 20, "#4a2f22");
      px(g, 0, 6, W, 3, "#6b4a2e");
      for (let x = 6; x < W - 6; x += 14) {
        px(g, x, 0, 6, 7, ["#9fe3cf", "#ff8fb0", "#b9a7f5"][(x / 14) % 3 | 0]);
        px(g, x + 1, 1, 2, 2, "#ffffff");
      }
      return c;
    }
    case "estante": {
      const { c, g } = lienzo(W, 28);
      px(g, 0, 0, W, 28, "#5a3a22");
      for (let y = 3; y < 26; y += 8) {
        px(g, 2, y + 5, W - 4, 2, "#3b2a1c");
        for (let x = 4; x < W - 6; x += 6) px(g, x, y, 4, 5, ["#e2445c", "#2e9e78", "#f6b93b", "#57b9f0"][((x + y) / 6) % 4 | 0]);
      }
      return c;
    }
    case "trofeos": {
      const { c, g } = lienzo(W, H + 4);
      px(g, 0, 0, W, H + 4, "#5a3a22");
      for (let y = 4; y < H; y += 14) {
        px(g, 2, y + 10, W - 4, 2, "#3b2a1c");
        for (let x = 5; x < W - 8; x += 11) {
          const oro = v ? "#c0c8d8" : "#f6b93b";
          px(g, x, y, 7, 5, oro);
          px(g, x + 2, y + 5, 3, 3, oro);
          px(g, x + 1, y + 8, 5, 2, "#8a5a3b");
          px(g, x + 1, y + 1, 2, 2, "#fff6e5");
        }
      }
      return c;
    }
    case "mesa": {
      const { c, g } = lienzo(W, 16);
      px(g, 0, 2, W, 8, "#8a5a3b");
      px(g, 0, 2, W, 2, "#a06c40");
      px(g, 2, 10, 2, 6, "#5a3a22");
      px(g, W - 4, 10, 2, 6, "#5a3a22");
      px(g, 6, 0, 5, 3, "#fff6e5");
      px(g, W - 12, 0, 4, 3, "#e2445c");
      return c;
    }
    case "podio": {
      const { c, g } = lienzo(W, 22);
      const p = W / 3;
      px(g, p, 2, p, 20, "#f6b93b");
      px(g, 0, 8, p, 14, "#c0c8d8");
      px(g, p * 2, 12, p, 10, "#c98d62");
      px(g, p + p / 2 - 2, 6, 4, 6, "#2a2342");
      return c;
    }
    case "marcador": {
      const { c, g } = lienzo(W, H + 6);
      px(g, 0, 0, W, H + 2, "#1b1f4a");
      px(g, 2, 2, W - 4, H - 2, "#111428");
      const barras = ["#2e9e78", "#c0392b", "#d4a017", "#57b9f0"];
      barras.forEach((b, k) => px(g, 5, 5 + k * 6, Math.max(6, (W - 12) * (0.9 - k * 0.18)), 4, b));
      px(g, W / 2 - 1, H + 2, 2, 4, "#3b3f5c");
      return c;
    }
    case "medidor": {
      const { c, g } = lienzo(W, 30);
      px(g, 4, 0, W - 8, 30, "#3b3f5c");
      px(g, 7, 3, W - 14, 24, "#111428");
      px(g, 7, 23, W - 14, 4, "#f6b93b");
      px(g, W / 2 - 3, 6, 6, 8, "#2e9e78");
      px(g, W / 2 - 1, 4, 2, 2, "#f6b93b");
      return c;
    }
    case "cabina": {
      const { c, g } = lienzo(W, H + 10);
      px(g, 0, 0, W, H + 10, "#3b2a1c");
      px(g, 3, 6, W - 6, H + 2, "#7b4bb7");
      for (let x = 4; x < W - 4; x += 4) px(g, x, 6, 2, H + 2, "#5d3a8f");
      px(g, 0, 0, W, 6, "#5a3a22");
      px(g, W / 2 - 4, 1, 8, 4, "#f6b93b");
      return c;
    }
    case "microfono": {
      const { c, g } = lienzo(16, 26);
      px(g, 7, 6, 2, 18, "#3b3f5c");
      px(g, 4, 23, 8, 3, "#2a2342");
      px(g, 5, 1, 6, 6, "#8f9bb0");
      px(g, 6, 2, 2, 2, "#ffffff");
      return c;
    }
    case "runa": {
      const { c, g } = lienzo(16, 26);
      px(g, 3, 4, 10, 22, "#7f8aa0");
      px(g, 4, 2, 8, 3, "#9aa6bb");
      px(g, 4, 2, 8, 1, "#ffffff");
      px(g, 7, 8, 2, 10, v ? "#ff8fb0" : "#9fe3ff");
      px(g, 5, 12, 6, 2, v ? "#ff8fb0" : "#9fe3ff");
      return c;
    }
    case "cueva": {
      const { c, g } = lienzo(W, H + 10);
      px(g, 0, 10, W, H, "#6f7a90");
      px(g, 6, 2, W - 12, 12, "#7f8aa0");
      px(g, 6, 2, W - 12, 3, "#ffffff");
      px(g, 0, 10, W, 2, "#ffffff");
      px(g, W / 2 - 12, 18, 24, H - 8, "#111428");
      px(g, W / 2 - 10, 16, 20, 4, "#111428");
      return c;
    }
  }
}

// --------------------------------------------------------------- edificios
function edificio(e: Edificio) {
  const W = e.w * T;
  const H = e.h * T;
  const gen = cargadas[`mundo:${e.id}`];
  if (gen) {
    // Arte de Higgsfield: apoyado en la base de su huella, centrado.
    const alto = Math.round((gen.height / gen.width) * W);
    const { c, g } = lienzo(W, Math.max(alto, H));
    g.drawImage(gen, 0, Math.max(alto, H) - alto, W, alto);
    return { c, ox: 0, oy: Math.max(alto, H) - H, generado: true };
  }
  const extra = 34;
  const { c, g } = lienzo(W, H + extra);
  const base = extra;
  const puertaX = (e.puerta.x - e.x) * T;
  const puerta = (color: string, ancho = 14) => {
    px(g, puertaX + 8 - ancho / 2 - 1, base + H - 22, ancho + 2, 22, "#2a2342");
    px(g, puertaX + 8 - ancho / 2, base + H - 21, ancho, 21, color);
    px(g, puertaX + 8 + ancho / 2 - 4, base + H - 11, 2, 2, "#f6b93b");
  };
  const ventana = (x: number, y: number, w = 12, h = 10) => {
    px(g, x - 1, y - 1, w + 2, h + 2, "#2a2342");
    px(g, x, y, w, h, "#f6d36b");
    px(g, x + w / 2 - 1, y, 2, h, "#2a2342");
    px(g, x, y + h / 2 - 1, w, 2, "#2a2342");
    px(g, x, y + h, w, 2, "#ffffff");
  };
  switch (e.estilo) {
    case "trofeos":
    case "casa": {
      if (dibujarImagen(g, "casa", 0, H + extra - (W * 111) / 117 + 4, W)) {
        // estandarte dorado del salón
        px(g, W / 2 - 10, H + extra - (W * 111) / 117 + 26, 20, 8, "#d4a017");
        px(g, W / 2 - 3, H + extra - (W * 111) / 117 + 27, 6, 6, "#fff1b8");
        return { c, ox: 0, oy: extra, generado: false };
      }
      break;
    }
    case "tienda": {
      if (dibujarImagen(g, "tienda", 0, H + extra - (W * 91) / 98, W)) {
        px(g, W - 12, base + 6, 8, 10, "#7b4bb7");
        px(g, W - 10, base + 8, 4, 6, "#ff8fb0");
        return { c, ox: 0, oy: extra, generado: false };
      }
      break;
    }
    case "fabrica": {
      px(g, 0, base + 6, W, H - 6, "#a8453a");
      for (let y = base + 8; y < base + H - 2; y += 5)
        for (let x = (y / 5) % 2 ? 0 : 5; x < W; x += 10) px(g, x, y, 9, 1, "#8a3a30");
      // techo de dientes de sierra
      for (let k = 0; k < W; k += 16) {
        for (let r = 0; r < 12; r++) px(g, k, base - 6 + r, Math.round(r * 1.3) + 2, 1, "#5a4a5f");
        px(g, k, base - 7, 4, 2, "#ffffff");
      }
      px(g, 0, base + 4, W, 3, "#3b2f4f");
      px(g, 0, base + 3, W, 1, "#ffffff");
      // chimenea
      px(g, 10, 0, 12, base + 6, "#7d3a30");
      px(g, 9, 0, 14, 4, "#3b2f4f");
      px(g, 9, 0, 14, 1, "#ffffff");
      for (const x of [20, 46, 86, 104]) if (x < W - 14) ventana(x, base + 16);
      puerta("#5a3a22", 20);
      // cartel con engranaje
      px(g, W / 2 - 16, base + 6, 32, 8, "#f6b93b");
      px(g, W / 2 - 3, base + 7, 6, 6, "#2a2342");
      break;
    }
    case "arcade": {
      px(g, 0, base + 4, W, H - 4, "#3b2f6b");
      px(g, 0, base, W, 6, "#2a2342");
      px(g, 0, base - 2, W, 3, "#ffffff");
      for (const x of [10, 30, 90, 108]) if (x < W - 14) {
        px(g, x - 1, base + 15, 16, 14, "#2a2342");
        px(g, x, base + 16, 14, 12, ["#ff8fb0", "#9fe3ff", "#f6d36b", "#b9f5a7"][(x / 20) % 4 | 0]);
      }
      // marquesina
      px(g, W / 2 - 30, base + 6, 60, 9, "#111428");
      for (let x = W / 2 - 28; x < W / 2 + 28; x += 4) px(g, x, base + 9, 2, 3, x % 8 ? "#ff8fb0" : "#9fe3ff");
      puerta("#9fe3ff", 18);
      px(g, puertaX - 1, base + H - 21, 18, 1, "#ffffff");
      break;
    }
    case "tablon": {
      px(g, 0, base + 6, W, H - 6, "#8a5a3b");
      for (let x = 0; x < W; x += 8) px(g, x, base + 6, 1, H - 6, "#6b4a2e");
      for (let r = 0; r < 16; r++) px(g, Math.max(0, 16 - r * 2), base - 10 + r, W - Math.max(0, 16 - r * 2) * 2, 1, r < 2 ? "#ffffff" : "#2e9e78");
      // tablero de anuncios en la fachada
      px(g, 8, base + 14, 30, 22, "#6b4a2e");
      px(g, 10, base + 16, 26, 18, "#c8945a");
      for (let k = 0; k < 5; k++) px(g, 12 + ((k * 9) % 20), base + 18 + ((k * 5) % 12), 7, 6, ["#fff6e5", "#ffb3c7", "#f6d36b"][k % 3]);
      ventana(W - 30, base + 16);
      puerta("#5a3a22", 16);
      break;
    }
    case "arena": {
      px(g, 0, base + 4, W, H - 4, "#8f9bb0");
      for (let y = base + 6; y < base + H; y += 8)
        for (let x = (y / 8) % 2 ? 0 : 8; x < W; x += 16) px(g, x, y, 15, 7, "#9faabd");
      for (let x = 0; x < W; x += 12) px(g, x, base - 2, 8, 7, "#8f9bb0");
      px(g, 0, base - 3, W, 1, "#ffffff");
      const banderas = ["#2e9e78", "#c0392b", "#3b3f5c", "#d4a017"];
      banderas.forEach((b, k) => {
        const x = 10 + k * ((W - 20) / 3);
        px(g, x, base - 26, 2, 24, "#3b3f5c");
        px(g, x + 2, base - 26, 12, 8, b);
      });
      // arco de entrada
      px(g, puertaX - 6, base + H - 30, 28, 30, "#2a2342");
      px(g, puertaX - 4, base + H - 28, 24, 28, "#1b1f4a");
      px(g, puertaX - 4, base + H - 30, 24, 3, "#f6b93b");
      break;
    }
  }
  return { c, ox: 0, oy: extra, generado: false };
}

/** Objeto con arte generado (si existe), del ancho de su huella. */
function generado(clave: string, w: number) {
  const img = cargadas[`mundo:${clave}`];
  if (!img) return null;
  const W = w * T;
  const { c, g } = lienzo(W, Math.round((img.height / img.width) * W));
  g.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

// --------------------------------------------------------- caché por sala
export interface Dibujable {
  /** dibujo generado con Higgsfield (sin efectos procedurales encima) */
  generado?: boolean;
  /** baldosa base (para ordenar por profundidad) */
  yBase: number;
  x: number;
  y: number;
  img: HTMLCanvasElement;
  /** luz que emite de noche (en px del mundo) */
  luz?: { x: number; y: number; r: number; color: string };
  objeto?: Objeto;
  edificio?: Edificio;
}

export interface ArteSala {
  suelo: HTMLCanvasElement;
  altos: Dibujable[];
  luces: { x: number; y: number; r: number; color: string }[];
}

const cacheArte = new Map<string, ArteSala>();

export function arteDeSala(s: Sala): ArteSala {
  const hit = cacheArte.get(s.id);
  if (hit) return hit;
  const { c: suelo, g } = lienzo(s.ancho * T, s.alto * T);
  for (let y = 0; y < s.alto; y++) for (let x = 0; x < s.ancho; x++) pintarSuelo(g, s, x, y);

  const altos: Dibujable[] = [];
  const luces: ArteSala["luces"] = [];
  const pinos = [pino(0), pino(1), pino(2)];
  const plano = (o: Objeto, img: HTMLCanvasElement, dx = 0, dy = 0) => g.drawImage(img, o.x * T + dx, o.y * T + dy);
  const alto = (o: Objeto, img: HTMLCanvasElement, dx = 0, dy = 0) => {
    const d: Dibujable = { yBase: o.y + o.h, x: o.x * T + dx, y: (o.y + o.h) * T - img.height + dy, img, objeto: o };
    altos.push(d);
    return d;
  };

  for (const o of s.objetos) {
    switch (o.tipo) {
      case "pino":
        alto(o, pinos[(o.variante ?? 0) % 3], -1, 1);
        break;
      case "farol": {
        const d = alto(o, farol(), 3, 0);
        d.luz = { x: o.x * T + 8, y: o.y * T - 10, r: 46, color: "255,214,120" };
        luces.push(d.luz);
        break;
      }
      case "banca":
        alto(o, banca(), 0, 1);
        break;
      case "muneco":
        alto(o, muneco(o.variante), 0, 0);
        break;
      case "roca":
        alto(o, roca(o.variante), 0, 0);
        break;
      case "regalos":
        alto(o, regalos(o.variante), 0, 0);
        break;
      case "valla":
        alto(o, valla(o.w), 0, 2);
        break;
      case "arbolPlaza": {
        const { c, g: gg } = lienzo(o.w * T + 8, 112);
        if (!dibujarImagen(gg, "arbol", 0, 0, o.w * T + 8)) {
          const p = pino(0);
          gg.drawImage(p, 0, 0, o.w * T + 8, 100);
        }
        const d = alto(o, c, -4, 4);
        d.luz = { x: (o.x + o.w / 2) * T, y: (o.y + 1) * T - 30, r: 90, color: "255,200,120" };
        luces.push(d.luz);
        break;
      }
      case "buzon": {
        const { c, g: gg } = lienzo(16, 26);
        if (!dibujarImagen(gg, "buzon", 0, 0, 16)) px(gg, 3, 4, 10, 20, "#e2445c");
        alto(o, c, 0, 0);
        break;
      }
      case "cofre": {
        const { c, g: gg } = lienzo(o.w * T, 26);
        if (!dibujarImagen(gg, "cofre", 0, 0, o.w * T)) px(gg, 2, 6, o.w * T - 4, 18, "#8a5a3b");
        alto(o, c, 0, 2);
        break;
      }
      case "fotos": {
        const { c, g: gg } = lienzo(o.w * T, 36);
        if (!dibujarImagen(gg, "fotos", 0, 0, o.w * T)) px(gg, 0, 0, o.w * T, 30, "#ffb3c7");
        alto(o, c, 0, 4);
        break;
      }
      case "maquina": {
        const gen = (o.variante ?? 0) === 0 ? generado("maquina", o.w) : null;
        const d = alto(o, gen ?? maquina(o.variante), gen ? 0 : 1, 2);
        d.luz = { x: o.x * T + 16, y: o.y * T - 6, r: 34, color: ["255,140,170", "120,210,255", "255,220,120"][(o.variante ?? 0) % 3] };
        luces.push(d.luz);
        break;
      }
      case "tablero":
        alto(o, tablero(o.w, o.h), 0, 4);
        break;
      case "mostrador":
      case "estante":
      case "trofeos":
      case "mesa":
      case "podio":
      case "marcador":
      case "medidor":
      case "cabina":
      case "microfono":
      case "cueva":
      case "runa": {
        const img = (o.tipo === "cueva" || o.tipo === "mostrador" ? generado(o.tipo, o.w) : null) ?? mueble(o.tipo, o.w, o.h, o.variante);
        const d = alto(o, img, 0, o.tipo === "cueva" ? 6 : 2);
        if (o.tipo === "runa") {
          d.luz = { x: o.x * T + 8, y: o.y * T - 4, r: 30, color: o.variante ? "255,143,176" : "159,227,255" };
          luces.push(d.luz);
        }
        if (o.tipo === "cueva") {
          d.luz = { x: (o.x + o.w / 2) * T, y: (o.y + 1) * T, r: 26, color: "255,90,90" };
          luces.push(d.luz);
        }
        break;
      }
      case "ring": {
        // plano en el suelo
        const W = o.w * T;
        const H = o.h * T;
        g.fillStyle = "#fff6e5";
        g.fillRect(o.x * T, o.y * T, W, H);
        g.fillStyle = "#c0392b";
        for (const [x, y] of [
          [0, 0],
          [W - 3, 0],
          [0, H - 3],
          [W - 3, H - 3],
        ])
          g.fillRect(o.x * T + x, o.y * T + y, 3, 3);
        g.fillStyle = "#e2445c";
        g.fillRect(o.x * T, o.y * T + 1, W, 1);
        g.fillRect(o.x * T, o.y * T + H - 2, W, 1);
        break;
      }
      case "cinta":
      case "neon":
      case "chimenea":
        // se dibujan animados en el motor
        if (o.tipo === "neon") luces.push({ x: (o.x + o.w / 2) * T, y: o.y * T + 10, r: 60, color: "255,120,200" });
        break;
    }
    void plano;
  }

  for (const e of s.edificios) {
    const { c, oy, generado: gen } = edificio(e);
    const d: Dibujable = { yBase: e.y + e.h, x: e.x * T, y: e.y * T - oy, img: c, edificio: e, generado: gen };
    altos.push(d);
    // ventanas encendidas de noche
    luces.push({ x: (e.x + e.w / 2) * T, y: (e.y + e.h - 1) * T, r: 60, color: "255,210,140" });
  }

  altos.sort((a, b) => a.yBase - b.yBase || a.x - b.x);
  const arte = { suelo, altos, luces };
  cacheArte.set(s.id, arte);
  return arte;
}

export function limpiarArte() {
  cacheArte.clear();
}
