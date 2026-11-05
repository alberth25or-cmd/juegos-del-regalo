/**
 * Arte pixel de los NPCs y del avatar del jugador, dibujado a mano en cuadrículas.
 * Cada letra es un color; "." es transparente. Se renderiza con pixelPaths
 * (un trazo SVG por color) y un contorno automático.
 */
import type { NpcId } from "@/features/contenido/npcs";
import type { ConfigAvatar } from "@/features/avatar";

export interface SpriteDef {
  rows: string[];
  colors: Record<string, string>;
}

const INK = "#2a2342";

export const NPC_SPRITES: Record<NpcId, SpriteDef> = {
  // Santa en bancarrota: traje con parche y cinturón que ya no cierra.
  santa: {
    rows: [
      "......RRRR..WW..",
      ".....RRRRRRRWW..",
      "....RRRRRRRR....",
      "...WWWWWWWWWW...",
      "...SSSSSSSSSS...",
      "...SKSSSSSSKS...",
      "...SSSSNNSSSS...",
      "..WWWWWWWWWWWW..",
      "..WWWWKKKKWWWW..",
      "..WWWWWWWWWWWW..",
      ".RRRWWWWWWWWRRR.",
      "RRRRRWWWWWWRRRRR",
      "KRRRRRWWWWRRRRRK",
      "KRRRRRRRRRRRRRRK",
      ".KKKKKKGGKKKKKK.",
      ".RRRPPRRRRRRRRR.",
      ".RRRPPRRRRRRRRR.",
      "..RRRRR..RRRRR..",
      "..KKKKK..KKKKK..",
      ".KKKKKK..KKKKKK.",
    ],
    colors: { R: "#c0392b", W: "#fff6e5", S: "#f2c6a0", K: INK, N: "#e8857a", G: "#f6b93b", P: "#8a5a3b" },
  },
  // Rudolf: lentes oscuros, corbata y la nariz que según él sostiene la empresa.
  rudolf: {
    rows: [
      ".A.A........A.A.",
      ".AAA........AAA.",
      "..AA........AA..",
      "...AADDDDDDAA...",
      "...DDDDDDDDDD...",
      "..DDGGGGGGGGDD..",
      "..DDGGGDDGGGDD..",
      "...DDDDDDDDDD...",
      "....LLLLLLLL....",
      "....LLLRRLLL....",
      ".....LLRRLL.....",
      "......LLLL......",
      "....DDDTTDDD....",
      "...DDDDTTDDDD...",
      "..DDDDDTTDDDDD..",
      "..DDDDDDDDDDDD..",
      "..DLLLLLLLLLLD..",
      "...DD......DD...",
      "...DD......DD...",
      "..KKK......KKK..",
    ],
    colors: { A: "#d9b38c", D: "#8a5a3b", G: INK, L: "#e8cfa8", R: "#e2445c", T: "#2f6fb0", K: INK },
  },
  // Pepe, el duende sindicalista, con su pancarta.
  duende: {
    rows: [
      "..........PPPPPP",
      "......G...PRRRRP",
      ".....GGG..PRRRRP",
      "....GGGGG.PPPPPP",
      "...GGGGGGG...B..",
      "..WWWWWWWWW..B..",
      ".ESSSSSSSSSE.B..",
      "..SKSSSSSKS..B..",
      "..SSSSMMSSS..B..",
      "...SSSSSSS...B..",
      "...RRRRRRR..SB..",
      "..GGGGGGGGGGGB..",
      ".GGGGGYGGGGG.B..",
      ".SGGGGGGGGGG.B..",
      "..KKKKYKKKK..B..",
      "..GGGGGGGGG.....",
      "..GGGG.GGGG.....",
      "..RRRR.RRRR.....",
      "..WWWW.WWWW.....",
      ".KKKKK.KKKKK....",
    ],
    colors: { P: "#fff6e5", R: "#e2445c", G: "#2e9e78", B: "#8a5a3b", W: "#fff6e5", E: "#f2c6a0", S: "#f2c6a0", K: INK, M: "#c0392b", Y: "#f6b93b" },
  },
  // El Muñeco: mirada de reojo y una sonrisa que no inspira confianza.
  muneco: {
    rows: [
      "....KKKKKK......",
      "....KKKKKK......",
      "....KRRRRK......",
      "..KKKKKKKKKK....",
      "...WWWWWWWW.....",
      "..WWWWKWWWKW....",
      "..WWWWWOOWWW....",
      "..WWWWWWOOOO....",
      "...WKWKWKWW.....",
      "..BBBBBBBBBB....",
      "..WWWWWBBWWW....",
      ".WWWWWWBBWWWW...",
      "TWWWWKWWWWWWWT..",
      ".TWWWWWWWWWWT...",
      ".WWWWWKWWWWWWW..",
      "WWWWWWWWWWWWWWW.",
      "WWWWWWKWWWWWWWW.",
      "WWWWWWWWWWWWWWW.",
      ".WWWWWWWWWWWWW..",
      "..WWWWWWWWWWW...",
    ],
    colors: { K: INK, R: "#c0392b", W: "#f4f8ff", O: "#e67e22", B: "#57b9f0", T: "#8a5a3b" },
  },
  // El Auditor: lentes, ceño fruncido y el portapapeles de los informes crueles.
  auditor: {
    rows: [
      "................",
      ".....HHHHHH.....",
      "....HSSSSSSH....",
      "....SSSSSSSS....",
      "....GGGSSGGG....",
      "....GLGSSGLG....",
      "....SSSSSSSS....",
      "....SSKKKKSS....",
      ".....SSSSSS.....",
      "....CCWTTWCC....",
      "...CCCWTTWCCC...",
      "..CCCCCWTWCCCC..",
      "..CCCCCCTCCCPPPP",
      "..CCCCCCCCCSPLLP",
      "..SCCCCCCCCCPLLP",
      "...CCCCCCCCCPPPP",
      "...CCCCCCCCC....",
      "...CCCC.CCCC....",
      "...CCCC.CCCC....",
      "..KKKKK.KKKKK...",
    ],
    colors: { H: "#b8b8c8", S: "#e8c4a0", G: INK, L: "#9fd3ff", K: INK, C: "#3b3f5c", W: "#fff6e5", T: "#c0392b", P: "#d9a441" },
  },
};

// ------------------------------------------------------------- avatar
const BASE = [
  "..............",
  "..............",
  "..............",
  "..............",
  "....PPPPPP....",
  "...PFFFFFFP...",
  "...FFFFFFFF...",
  "...FkFFFFkF...",
  "...FFFFFFFF...",
  "....FFmmFF....",
  "...WWWWWWWW...",
  "..CCCCWWCCCC..",
  ".CCCCCCCCCCCC.",
  ".FCCCCCCCCCCF.",
  "..CCCCCCCCCC..",
  "..CCCCCCCCCC..",
  "...BB....BB...",
  "..BBB....BBB..",
];

/** Capas de gorro: filas 0..4 que se pintan encima de la base. */
const GORROS: Record<string, string[]> = {
  santa: ["......hhh.pp..", ".....hhhhhpp..", "....hhhhhh....", "...pppppppp...", "...pppppppp..."],
  duende: ["......h.......", ".....hhh......", "....hhhhh.....", "...hhhhhhh....", "...pppppppp..."],
  reno: ["..............", "..a.a....a.a..", "..aaa....aaa..", "...aa....aa...", ".............."],
  lana: ["..............", "......pp......", "....hhhhhh....", "...hhhhhhhh...", "...hphphphp..."],
  corona: ["..............", "..............", "...g.g..g.g...", "...gggggggg...", "...gjggggjg..."],
  auditor: ["..............", "..............", "....hhhhhh....", "....hhhhhh....", "..qqqqqqqqqq.."],
  ninguno: [],
};

/** Accesorios: [fila, contenido] que se pintan encima. */
const ACCESORIOS: Record<string, [number, string][]> = {
  lentes: [[7, "..LLLLLLLLLL.."]],
  bigote: [[9, "....PPPPPP...."]],
  audifonos: [
    [5, "..A........A.."],
    [6, "..A........A.."],
    [7, "..A........A.."],
  ],
  mejillas: [[8, "...FrFFFFrF..."]],
  ninguno: [],
};

function pintar(base: string[], capa: string[], desde = 0): string[] {
  const out = [...base];
  capa.forEach((fila, k) => {
    const y = desde + k;
    if (!out[y]) return;
    let r = "";
    for (let x = 0; x < out[y].length; x++) r += fila[x] && fila[x] !== "." ? fila[x] : out[y][x];
    out[y] = r;
  });
  return out;
}

function oscurecer(hex: string, f = 0.7) {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.round(((n >> s) & 255) * f);
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
}

export function avatarSprite(a: ConfigAvatar): SpriteDef {
  let rows = BASE;
  rows = pintar(rows, GORROS[a.gorro] ?? []);
  for (const [y, fila] of ACCESORIOS[a.accesorio] ?? []) rows = pintar(rows, [fila], y);
  // Los lentes dejan ver los ojos.
  if (a.accesorio === "lentes") rows = pintar(rows, ["...FkFFFFkF..."].map((f) => f.replace(/F/g, ".")), 7);
  const blanco = "#fff6e5";
  return {
    rows,
    colors: {
      P: a.pelo,
      F: a.piel,
      k: INK,
      m: "#9a4a3a",
      W: a.bufanda,
      C: a.abrigo,
      B: INK,
      h: a.colorGorro,
      p: a.gorro === "lana" ? oscurecer(a.colorGorro, 0.75) : blanco,
      q: oscurecer(a.colorGorro, 0.6),
      a: "#8a5a3b",
      g: "#f6b93b",
      j: "#e2445c",
      L: INK,
      A: "#57b9f0",
      r: "#ff8fb0",
    },
  };
}
