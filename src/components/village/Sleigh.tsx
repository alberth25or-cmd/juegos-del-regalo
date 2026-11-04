"use client";

import { SPRITES } from "@/lib/assets/manifest";
import { pixelPaths } from "@/components/ui/pixelPaths";

/* Pixel art propio: trineo + dos renos, dibujados por filas. */
const DEER = [
  "..k.k.......",
  "...kk.......",
  "..kBBk......",
  ".kBkBB......",
  "kRBBBBBBBBk.",
  "..kBBBBBBBBk",
  "..kBBBBBBBk.",
  "..k.k...k.k.",
  "..k.k...k.k.",
];
const SLEIGH = [
  "kk............kk",
  "kRk..........kRk",
  ".kRRRRRRRRRRRRRk",
  ".kRRYRRRRRRRYRRk",
  "..kRRRRRRRRRRRk.",
  "...kkkkkkkkkkk..",
  "...k........k...",
  "kYYYYYYYYYYYYYYk",
  ".kkkkkkkkkkkkkk.",
];
const C: Record<string, string> = { k: "#2a2342", B: "#9a5b34", R: "#e2445c", Y: "#f6b93b" };

function Rows({ rows }: { rows: string[] }) {
  return (
    <svg viewBox={`0 0 ${rows[0].length} ${rows.length}`} width="100%" height="100%" shapeRendering="crispEdges" aria-hidden>
      {pixelPaths(rows, C).map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} />
      ))}
    </svg>
  );
}

/** El Cuy Agente cruza el cielo en trineo, solo al atardecer y de noche. */
export function Sleigh() {
  const cuy = SPRITES["mascota"];
  const s = 3; // pixeles por pixel de arte
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: "var(--lights)" }}>
      <div className="absolute left-0 top-[11%]" style={{ animation: "sleigh-fly 30s linear 4s infinite" }}>
        <div style={{ animation: "sleigh-wave 3.2s ease-in-out infinite" }}>
          <div className="relative flex items-end" style={{ gap: 2 * s }}>
            {/* estela de estrellas */}
            <div className="absolute right-full top-1/2 flex -translate-y-1/2 gap-2 pr-1">
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  className="block"
                  style={{
                    width: 4 + (i % 3) * 2,
                    height: 4 + (i % 3) * 2,
                    background: i % 2 ? "#fff1b8" : "#ffd166",
                    boxShadow: "0 0 8px 2px rgb(255 220 140 / .8)",
                    opacity: 0.25 + (i / 7) * 0.75,
                    animation: `glow-pulse ${0.8 + (i % 3) * 0.3}s steps(3) ${i * 0.1}s infinite`,
                    transform: `translateY(${(i % 3) * 5 - 5}px)`,
                  }}
                />
              ))}
            </div>
            {/* trineo con el cuy */}
            <div className="relative" style={{ width: 16 * s, height: 9 * s }}>
              {cuy && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cuy.src} alt="" className="pixelated absolute left-[18%]" style={{ height: 9 * s * 1.25, bottom: 5 * s, width: "auto" }} />
              )}
              <div className="absolute inset-0">
                <Rows rows={SLEIGH} />
              </div>
            </div>
            {/* riendas */}
            <span className="absolute h-[2px] bg-[#2a2342]" style={{ left: 15 * s, width: 8 * s, top: 3 * s, transform: "rotate(-8deg)" }} />
            {/* renos */}
            {[0, 1].map((i) => (
              <div key={i} style={{ width: 12 * s, height: 9 * s, transform: "scaleX(-1)" }}>
                <div className="h-full w-full" style={{ animation: `deer-gallop 0.5s steps(2) ${i * 0.25}s infinite` }}>
                  <Rows rows={DEER} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
