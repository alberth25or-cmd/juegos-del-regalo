"use client";

import { memo } from "react";

type R = [number, number, number, number, string];
const K = "#2a2342";

export interface TrainPalette {
  loco: string;
  wagons: [string, string, string];
  cargo: [string, string, string, string, string, string];
}

export const TRAIN_PALETTES: Record<string, TrainPalette> = {
  rojo: { loco: "#e2445c", wagons: ["#2e9e78", "#f6b93b", "#b9a7f5"], cargo: ["#ffb3c7", "#b9a7f5", "#e2445c", "#9fe3cf", "#2e9e78", "#ffb3c7"] },
  azul: { loco: "#57b9f0", wagons: ["#fff6e5", "#e2445c", "#2e9e78"], cargo: ["#e2445c", "#f6b93b", "#9fe3cf", "#b9a7f5", "#f6b93b", "#e2445c"] },
  dorado: { loco: "#f6b93b", wagons: ["#e2445c", "#b9a7f5", "#57b9f0"], cargo: ["#2e9e78", "#fff6e5", "#f6b93b", "#2e9e78", "#ffb3c7", "#fff6e5"] },
};

function wagon(x: number, body: string, cargo: string[]): R[] {
  const r: R[] = [
    [x, 5, 16, 7, K],
    [x + 1, 6, 14, 5, body],
    [x + 1, 6, 14, 1, "rgb(255 255 255 / .35)"],
  ];
  cargo.forEach((c, i) => {
    r.push([x + 2 + i * 5, 1, 4, 5, K], [x + 3 + i * 5, 2, 2, 3, c], [x + 2 + i * 5, 3, 4, 1, "#f6b93b"]);
  });
  r.push([x - 2, 9, 2, 1, K]);
  return r;
}

function rects(p: TrainPalette): R[] {
  return [
    [56, 2, 12, 10, K],
    [57, 3, 10, 8, p.loco],
    [58, 4, 4, 3, "#ffd27a"],
    [66, 0, 4, 6, K],
    [67, 1, 2, 5, "#5d5677"],
    [64, 7, 8, 5, K],
    [65, 8, 6, 3, p.loco],
    [71, 9, 2, 2, "#ffd27a"],
    [56, 2, 12, 1, "#f4f8ff"],
    ...wagon(38, p.wagons[0], [p.cargo[0], p.cargo[1]]),
    ...wagon(20, p.wagons[1], [p.cargo[2], p.cargo[3]]),
    ...wagon(2, p.wagons[2], [p.cargo[4], p.cargo[5]]),
  ];
}
const WHEELS = [5, 13, 23, 31, 41, 49, 59, 67];

/** Agrupa rectángulos en un trazo por color (respeta el orden de dibujo por capas). */
function porColor(list: R[]): [string, string][] {
  const out: [string, string][] = [];
  for (const [x, y, w, h, f] of list) {
    const last = out[out.length - 1];
    const seg = `M${x} ${y}h${w}v${h}h-${w}z`;
    if (last && last[0] === f) last[1] += seg;
    else out.push([f, seg]);
  }
  return out;
}

/** Trencito navideño que recorre la aldea sin parar. */
export const Train = memo(function Train({
  worldW,
  bottom,
  scale,
  palette = "rojo",
  reverse = false,
  pxPerSec = 55,
  delay = 0,
  zIndex,
}: {
  worldW: number;
  bottom: number;
  scale: number;
  palette?: keyof typeof TRAIN_PALETTES;
  reverse?: boolean;
  pxPerSec?: number;
  delay?: number;
  zIndex?: number;
}) {
  const p = TRAIN_PALETTES[palette];
  const dur = Math.round((worldW + 360) / pxPerSec);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0"
      style={{
        bottom,
        zIndex,
        ["--tw" as string]: `${worldW + 40}px`,
        animation: `train-run ${dur}s linear ${delay}s infinite`,
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      <div className="relative" style={{ width: 74 * scale, height: 15 * scale, transform: reverse ? "scaleX(-1)" : undefined }}>
        {/* humo */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute block rounded-[2px] bg-white/85"
            style={{ left: 67 * scale, top: -2 * scale, width: 3 * scale, height: 3 * scale, animation: `steam 1.6s ease-out ${i * 0.5}s infinite` }}
          />
        ))}
        {/* faro: se nota de noche */}
        <span
          className="absolute block rounded-full"
          style={{
            left: 72 * scale,
            top: 6 * scale,
            width: 26 * scale,
            height: 10 * scale,
            background: "radial-gradient(closest-side at 0% 50%, rgb(255 220 140 / .8), transparent)",
            opacity: "var(--lights)",
          }}
        />
        <svg viewBox="0 0 74 15" width="100%" height="100%" shapeRendering="crispEdges">
          {porColor(rects(p)).map(([f, d], i) => (
            <path key={i} d={d} fill={f} />
          ))}
          {WHEELS.map((x, i) => (
            <g key={i} className="tren-rueda" style={{ animation: `wheel 0.3s steps(2) ${i * 0.07}s infinite` }}>
              <rect x={x - 2} y={11} width={4} height={4} fill={K} />
              <rect x={x - 1} y={12} width={2} height={2} fill="#c9d6f0" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
});
