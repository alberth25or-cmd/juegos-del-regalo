/**
 * Arte procedural en pixel (placeholders y capas extra de profundidad).
 * Todo se dibuja con <rect> en una cuadrícula de pixeles de arte.
 */

import { memo } from "react";

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface RidgeProps {
  w: number; // ancho en pixeles de arte
  h: number;
  seed: number;
  base: number; // 0–1 altura mínima
  amp: number; // 0–1 amplitud
  freq: number;
  color: string;
  shade: string;
  snow?: string;
  snowLine?: number; // 0–1: sobre esta altura hay nieve
  step?: number;
}

/** Cordillera / colinas escalonadas con nieve y luz de borde atmosférica. */
export const Ridge = memo(function Ridge({ w, h, seed, base, amp, freq, color, shade, snow, snowLine = 0.7, step = 2 }: RidgeProps) {
  const r = rng(seed);
  const p = [r() * 10, r() * 10, r() * 10];
  const cols = Math.ceil(w / step);
  const heights: number[] = [];
  for (let i = 0; i < cols; i++) {
    const x = (i / cols) * Math.PI * 2 * freq;
    const n = 0.55 * Math.sin(x + p[0]) + 0.3 * Math.sin(x * 2.3 + p[1]) + 0.15 * Math.sin(x * 5.1 + p[2]);
    heights.push(Math.round((base + amp * (n * 0.5 + 0.5)) * h));
  }
  const rects: React.ReactNode[] = [];
  for (let i = 0; i < cols; i++) {
    const top = h - heights[i];
    const x = i * step;
    const prev = heights[i - 1] ?? heights[i];
    const next = heights[i + 1] ?? heights[i];
    const facingSun = next < heights[i] || prev < heights[i] ? next <= prev : false;
    rects.push(<rect key={`b${i}`} x={x} y={top} width={step} height={h - top} fill={facingSun ? color : shade} />);
    if (snow && heights[i] > snowLine * h) {
      const depth = 2 + Math.round((heights[i] - snowLine * h) * 0.35) + (i % 3 === 0 ? 2 : 0);
      rects.push(<rect key={`s${i}`} x={x} y={top} width={step} height={Math.min(depth, h - top)} fill={snow} />);
    }
    // Luz de borde (color del sol/luna).
    rects.push(<rect key={`g${i}`} x={x} y={top} width={step} height={1} fill="var(--glow)" opacity={0.55} />);
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden>
      {rects}
    </svg>
  );
});

interface ForestProps {
  w: number;
  h: number;
  seed: number;
  count: number;
  color: string;
  shade: string;
  snow: string;
  minH: number; // 0–1
  maxH: number;
  groundY?: number; // 0–1 desde arriba, línea base de los árboles
}

function pine(x: number, baseY: number, th: number, color: string, shade: string, snow: string, key: string) {
  const out: React.ReactNode[] = [];
  const levels = 3;
  const tierH = Math.max(3, Math.round(th / levels));
  for (let l = 0; l < levels; l++) {
    const tierTop = baseY - th + l * Math.round(tierH * 0.75);
    const maxW = Math.round(tierH * (1.1 + l * 0.35));
    for (let row = 0; row < tierH; row++) {
      const rw = Math.max(1, Math.round((row / tierH) * maxW)) | 1;
      const y = tierTop + row;
      const half = Math.floor(rw / 2);
      out.push(<rect key={`${key}-${l}-${row}`} x={x - half} y={y} width={half} height={1} fill={shade} />);
      out.push(<rect key={`${key}-${l}-${row}r`} x={x} y={y} width={rw - half} height={1} fill={color} />);
      if (row === Math.floor(tierH * 0.35) && rw > 2) {
        out.push(<rect key={`${key}-${l}-${row}s`} x={x - half} y={y} width={rw} height={1} fill={snow} />);
      }
    }
  }
  out.push(<rect key={`${key}-tip`} x={x} y={baseY - th - 1} width={1} height={2} fill={snow} />);
  out.push(<rect key={`${key}-trunk`} x={x - 1} y={baseY} width={2} height={2} fill="#5a3a2a" />);
  return out;
}

/** Bosque de pinos nevados. */
export const Forest = memo(function Forest({ w, h, seed, count, color, shade, snow, minH, maxH, groundY = 0.92 }: ForestProps) {
  const r = rng(seed);
  const trees: { x: number; th: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(r() * w);
    const th = Math.round((minH + r() * (maxH - minH)) * h);
    const y = Math.round(groundY * h + (r() - 0.5) * h * 0.06);
    trees.push({ x, th, y });
  }
  trees.sort((a, b) => a.y - b.y);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden>
      {trees.flatMap((t, i) => pine(t.x, t.y, t.th, color, shade, snow, `t${i}`))}
    </svg>
  );
});

/* ----------------------------------------------------------------
   Edificios placeholder (32×32 pixeles de arte)
   ---------------------------------------------------------------- */

const INK = "#2a2342";
const SNOW = "#f4f8ff";
const SNOW_SH = "#c9d6f0";
const WIN_DARK = "#3b3560";
const WIN_LIT = "#ffd27a";

type R = [number, number, number, number, string, number?];

function windowRects(x: number, y: number, w: number, h: number): R[] {
  return [
    [x - 1, y - 1, w + 2, h + 2, INK],
    [x, y, w, h, WIN_DARK],
    [x, y, w, h, WIN_LIT, -1], // -1 = opacidad ligada a --lights
    [x + Math.floor(w / 2), y, 1, h, INK],
  ];
}

function roofRects(cx: number, top: number, halfW: number, rows: number, color: string): R[] {
  const out: R[] = [];
  for (let i = 0; i < rows; i++) {
    const half = Math.round((i / (rows - 1)) * halfW);
    out.push([cx - half - 1, top + i, half * 2 + 2, 1, INK]);
    out.push([cx - half, top + i, half * 2, 1, color]);
  }
  // nieve sobre el techo
  for (let i = 0; i < Math.ceil(rows / 2); i++) {
    const half = Math.round((i / (rows - 1)) * halfW);
    out.push([cx - half, top + i, half * 2, 1, i < 2 ? SNOW : SNOW_SH]);
  }
  return out;
}

function building(kind: string, roof: string, wall: string, chimney?: boolean): { w: number; h: number; rects: R[] } {
  const r: R[] = [];
  switch (kind) {
    case "house": {
      if (chimney) r.push([22, 4, 5, 9, INK], [23, 5, 3, 8, "#b5523b"], [22, 4, 5, 2, SNOW]);
      r.push(...roofRects(16, 3, 15, 12, roof));
      r.push([3, 15, 26, 17, INK], [4, 15, 24, 16, wall], [4, 15, 24, 2, "rgb(0 0 0 / 0.08)"]);
      r.push(...windowRects(7, 18, 5, 5), ...windowRects(20, 18, 5, 5));
      r.push([13, 21, 6, 11, INK], [14, 22, 4, 10, "#8a4b2c"], [17, 27, 1, 1, "#f6b93b"]);
      r.push([12, 20, 8, 1, "#2e9e78"], [15, 19, 2, 1, "#e2445c"]); // corona
      return { w: 32, h: 32, rects: r };
    }
    case "stall": {
      if (chimney) r.push([24, 2, 4, 8, INK], [25, 3, 2, 7, "#b5523b"], [24, 2, 4, 2, SNOW]);
      r.push([2, 9, 28, 6, INK]);
      for (let i = 0; i < 7; i++) r.push([3 + i * 4, 10, 4, 4, i % 2 ? "#fff6e5" : roof]);
      r.push([3, 14, 26, 2, INK]);
      for (let i = 0; i < 7; i++) r.push([3 + i * 4, 14, 4, 2, i % 2 ? "#fff6e5" : roof]);
      r.push([2, 8, 28, 2, SNOW]);
      r.push([4, 16, 24, 16, INK], [5, 16, 22, 15, wall]);
      r.push(...windowRects(8, 19, 16, 6));
      r.push([5, 27, 22, 4, "#9a5b34"], [5, 27, 22, 1, INK]);
      r.push([9, 25, 3, 2, "#e2445c"], [14, 25, 3, 2, "#f6b93b"], [19, 25, 3, 2, "#9fe3cf"]);
      return { w: 32, h: 32, rects: r };
    }
    case "board": {
      r.push([5, 12, 3, 20, INK], [6, 12, 1, 20, "#9a5b34"], [24, 12, 3, 20, INK], [25, 12, 1, 20, "#9a5b34"]);
      r.push([2, 4, 28, 18, INK], [3, 5, 26, 16, "#c48a5a"], [3, 5, 26, 1, "#d9a06c"]);
      r.push([2, 2, 28, 3, INK], [3, 2, 26, 2, roof], [3, 2, 26, 1, SNOW]);
      r.push([5, 8, 6, 5, wall], [13, 7, 6, 6, "#ffb3c7"], [21, 8, 6, 5, "#9fe3cf"], [7, 14, 7, 5, "#fff6e5"], [17, 14, 8, 5, "#f6b93b"]);
      r.push([7, 8, 1, 1, "#e2445c"], [15, 7, 1, 1, "#e2445c"], [23, 8, 1, 1, "#e2445c"], [10, 14, 1, 1, "#e2445c"], [20, 14, 1, 1, "#e2445c"]);
      r.push([3, 5, 26, 16, WIN_LIT, -2]);
      return { w: 32, h: 32, rects: r };
    }
    case "mailbox": {
      r.push([7, 12, 3, 20, INK], [8, 12, 1, 20, "#9a5b34"]);
      r.push([1, 3, 15, 11, INK], [2, 4, 13, 9, wall], [2, 4, 13, 2, SNOW], [2, 6, 13, 1, "rgb(255 255 255 / .35)"]);
      r.push([4, 8, 9, 2, INK]);
      r.push([15, 2, 1, 7, INK], [16, 2, 4, 3, roof]);
      r.push([6, 10, 5, 2, "#f6b93b"]);
      return { w: 20, h: 32, rects: r };
    }
    case "chest": {
      r.push([1, 4, 22, 14, INK], [2, 5, 20, 5, "#b06a3a"], [2, 5, 20, 1, SNOW], [2, 10, 20, 7, "#9a5b34"]);
      r.push([2, 9, 20, 2, INK], [5, 5, 2, 12, "#f6b93b"], [17, 5, 2, 12, "#f6b93b"]);
      r.push([10, 8, 4, 5, INK], [11, 9, 2, 3, "#f6b93b"]);
      r.push([2, 5, 20, 12, WIN_LIT, -2]);
      return { w: 24, h: 18, rects: r };
    }
    case "tree": {
      const cx = 16;
      for (let tier = 0; tier < 4; tier++) {
        const top = 5 + tier * 9;
        const rows = 12;
        for (let i = 0; i < rows; i++) {
          const half = Math.round(((i + 2) / (rows + 1)) * (6 + tier * 3));
          r.push([cx - half - 1, top + i, half * 2 + 2, 1, INK]);
          r.push([cx - half, top + i, half, 1, wall]);
          r.push([cx, top + i, half, 1, roof]);
          if (i === 3) r.push([cx - half, top + i, half * 2, 1, SNOW]);
        }
      }
      r.push([14, 49, 4, 5, INK], [15, 49, 2, 5, "#8a4b2c"]);
      // estrella
      r.push([15, 0, 2, 5, INK], [13, 2, 6, 1, INK], [15, 1, 2, 3, "#f6b93b"], [14, 2, 4, 1, "#f6b93b"]);
      // adornos
      const orn: [number, number, string][] = [
        [13, 12, "#e2445c"], [19, 15, "#f6b93b"], [10, 22, "#b9a7f5"], [21, 24, "#e2445c"], [15, 28, "#8fd3ff"],
        [8, 33, "#f6b93b"], [24, 34, "#ffb3c7"], [12, 40, "#e2445c"], [20, 43, "#f6b93b"], [6, 45, "#8fd3ff"], [26, 46, "#b9a7f5"],
      ];
      for (const [x, y, c] of orn) r.push([x, y, 2, 2, c], [x, y, 2, 2, "#fff4c0", -1]);
      return { w: 32, h: 54, rects: r };
    }
    default:
      return { w: 32, h: 32, rects: r };
  }
}

export function buildingAspect(kind: string) {
  const b = building(kind, "#000", "#000");
  return b.w / b.h;
}

export const PixelBuilding = memo(function PixelBuilding({
  kind,
  roof,
  wall,
  chimney,
}: {
  kind: string;
  roof: string;
  wall: string;
  chimney?: boolean;
}) {
  const b = building(kind, roof, wall, chimney);
  return (
    <svg viewBox={`0 0 ${b.w} ${b.h}`} width="100%" height="100%" shapeRendering="crispEdges" aria-hidden>
      {b.rects.map(([x, y, w, h, fill, o], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          fill={fill}
          style={
            o === -1
              ? { opacity: "calc(0.15 + var(--lights) * 0.85)", animation: "flicker 3s steps(3) infinite" }
              : o === -2
                ? { opacity: "calc(var(--lights) * 0.18)" }
                : undefined
          }
        />
      ))}
    </svg>
  );
});
