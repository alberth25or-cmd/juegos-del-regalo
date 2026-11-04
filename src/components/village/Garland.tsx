"use client";

import { memo } from "react";

const COLORS = ["#e2445c", "#f6b93b", "#9fe3cf", "#b9a7f5", "#ffb3c7", "#8fd3ff"];

/**
 * Guirnalda de luces que cruza la aldea. Cada bombilla encendida representa
 * a un agente que ya cumplió la misión de hoy: la aldea se ilumina en grupo.
 */
export const Garland = memo(function Garland({
  points,
  lit,
  total,
}: {
  points: { x: number; y: number }[];
  lit: number;
  total: number;
}) {
  if (points.length < 2) return null;
  const bulbs: { x: number; y: number; i: number }[] = [];
  const segments = points.length - 1;
  const perSeg = Math.ceil(total / segments);
  let count = 0;
  const paths: string[] = [];
  for (let s = 0; s < segments; s++) {
    const a = points[s];
    const b = points[s + 1];
    const sag = Math.abs(b.x - a.x) * 0.14;
    const cx = (a.x + b.x) / 2;
    const cy = Math.max(a.y, b.y) + sag;
    paths.push(`M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`);
    for (let k = 1; k <= perSeg && count < total; k++) {
      const t = k / (perSeg + 1);
      const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cx + t * t * b.x;
      const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cy + t * t * b.y;
      bulbs.push({ x, y, i: count++ });
    }
  }

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#2a2342" strokeWidth={2} />
      ))}
      {bulbs.map((b) => {
        const on = b.i < lit;
        const c = COLORS[b.i % COLORS.length];
        return (
          <g key={b.i} transform={`translate(${Math.round(b.x)}, ${Math.round(b.y)})`}>
            {on && (
              <>
                <circle r={14} fill={c} style={{ opacity: "calc(0.06 + var(--lights) * 0.18)" }} />
                <circle r={8} fill={c} style={{ opacity: "calc(0.12 + var(--lights) * 0.32)" }} />
              </>
            )}
            <rect x={-2} y={0} width={4} height={3} fill="#2a2342" />
            <rect
              x={-3}
              y={3}
              width={6}
              height={8}
              fill={on ? c : "#5d5677"}
              stroke="#2a2342"
              strokeWidth={2}
              style={on ? { animation: `bulb 2.4s steps(1) ${(b.i % 4) * 0.6}s infinite` } : undefined}
            />
            {on && <rect x={-1} y={4} width={2} height={2} fill="#fff" opacity={0.8} />}
          </g>
        );
      })}
    </svg>
  );
});
