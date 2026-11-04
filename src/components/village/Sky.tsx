"use client";

import { useMemo } from "react";
import { rng } from "./procedural";
import { Aurora, Birds, SunRays } from "./Ambient";
import { Sleigh } from "./Sleigh";

const CLOUD = [
  "......WWWW..........",
  "....WWWWWWWW...WWW..",
  "..WWWWWWWWWWWWWWWWW.",
  ".WWWWWWWWWWWWWWWWWWW",
  "SSWWWWWWWWWWWWWWWWSS",
  ".SSSSSSSSSSSSSSSSSS.",
];
const CLOUD_2 = [
  "....WWWW......",
  "..WWWWWWWWW...",
  ".WWWWWWWWWWWW.",
  "SSWWWWWWWWWWSS",
  ".SSSSSSSSSSSS.",
];

function PixelCloud({ rows }: { rows: string[] }) {
  const w = rows[0].length;
  const h = rows.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" shapeRendering="crispEdges" aria-hidden>
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={c === "W" ? "color-mix(in srgb, #ffffff 72%, var(--glow))" : "color-mix(in srgb, var(--sky-mid) 55%, #ffffff)"}
            />
          ),
        ),
      )}
    </svg>
  );
}

const SUN = [
  "....YYYY....",
  "..YYWWWWYY..",
  ".YWWWWWWWWY.",
  ".YWWWWWWWWY.",
  "YWWWWWWWWWWY",
  "YWWWWWWWWWWY",
  "YWWWWWWWWWWY",
  "YWWWWWWWWWWY",
  ".YWWWWWWWWY.",
  ".YWWWWWWWWY.",
  "..YYWWWWYY..",
  "....YYYY....",
];
const MOON = [
  "....MMMM....",
  "..MMMMMM....",
  ".MMMMMM.....",
  ".MMMMM......",
  "MMMMM.......",
  "MMMMM.......",
  "MMMMM.......",
  "MMMMMM......",
  ".MMMMMM.....",
  ".MMMMMMMM..M",
  "..MMMMMMMMM.",
  "....MMMM....",
];

function PixelDisc({ rows, colors }: { rows: string[]; colors: Record<string, string> }) {
  return (
    <svg viewBox="0 0 12 12" width="100%" height="100%" shapeRendering="crispEdges" aria-hidden>
      {rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={colors[c]} />)),
      )}
    </svg>
  );
}

export function Sky() {
  const stars = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 70 }, (_, i) => ({
      x: r() * 100,
      y: r() * 62,
      s: r() > 0.85 ? 2 : 1,
      d: r() * 4,
      dur: 2 + r() * 3,
      key: i,
    }));
  }, []);

  const clouds = useMemo(
    () => [
      { top: "10%", w: 30, dur: 160, delay: -40, rows: CLOUD, o: 0.95 },
      { top: "22%", w: 18, dur: 210, delay: -150, rows: CLOUD_2, o: 0.8 },
      { top: "6%", w: 14, dur: 260, delay: -90, rows: CLOUD_2, o: 0.6 },
      { top: "30%", w: 24, dur: 190, delay: -10, rows: CLOUD, o: 0.7 },
    ],
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden>
      {/* Degradado del cielo */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 52%, var(--sky-bottom) 100%)" }}
      />
      {/* Bandas pixeladas (dithering) para que el degradado no se vea "liso" */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, #fff 0 calc(var(--px)*2), transparent calc(var(--px)*2) calc(var(--px)*6))",
        }}
      />
      {/* Resplandor del horizonte */}
      <div
        className="absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background: "radial-gradient(120% 70% at var(--sun-x) 100%, color-mix(in srgb, var(--glow) 55%, transparent) 0%, transparent 70%)",
          opacity: "calc(0.35 + var(--sun-o) * 0.4)",
        }}
      />

      {/* Todo lo celeste baja un poco cuando la cámara mira hacia arriba */}
      <div className="absolute inset-0" style={{ transform: "translateY(calc((1 - var(--p, 1)) * 18vh))" }}>
      <SunRays />
      <Aurora />

      {/* Estrellas */}
      <div className="absolute inset-0" style={{ opacity: "var(--stars)" }}>
        {stars.map((s) => (
          <span
            key={s.key}
            className="absolute bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `calc(var(--px) * ${s.s})`,
              height: `calc(var(--px) * ${s.s})`,
              animation: `twinkle ${s.dur}s steps(3) ${s.d}s infinite`,
              boxShadow: s.s > 1 ? "0 0 6px rgba(255,255,255,.8)" : undefined,
            }}
          />
        ))}
        <span className="shooting-star" />
      </div>

      {/* Sol */}
      <div
        className="absolute"
        style={{
          left: "var(--sun-x)",
          top: "var(--sun-y)",
          width: "calc(var(--px) * 18)",
          height: "calc(var(--px) * 18)",
          transform: "translate(-50%, -50%)",
          opacity: "var(--sun-o)",
          filter: "drop-shadow(0 0 24px color-mix(in srgb, var(--glow) 80%, transparent))",
        }}
      >
        <PixelDisc rows={SUN} colors={{ Y: "color-mix(in srgb, #ffd166 70%, var(--glow))", W: "color-mix(in srgb, #fff6d8 80%, var(--glow))" }} />
      </div>

      {/* Luna */}
      <div
        className="absolute"
        style={{
          left: "var(--moon-x)",
          top: "var(--moon-y)",
          width: "calc(var(--px) * 15)",
          height: "calc(var(--px) * 15)",
          transform: "translate(-50%, -50%)",
          opacity: "var(--moon-o)",
          filter: "drop-shadow(0 0 18px rgba(220, 225, 255, 0.55))",
        }}
      >
        <PixelDisc rows={MOON} colors={{ M: "#f3f0ff" }} />
      </div>

      <Birds />
      <Sleigh />

      {/* Nubes */}
      {clouds.map((c, i) => (
        <div
          key={i}
          className="absolute left-0"
          style={{
            top: c.top,
            width: `calc(var(--px) * ${c.w * 2.2})`,
            aspectRatio: `${c.rows[0].length} / ${c.rows.length}`,
            animation: `drift ${c.dur}s linear ${c.delay}s infinite`,
            opacity: `calc(${c.o} * (0.35 + var(--light) * 0.6))`,
            filter: "brightness(var(--light))",
          }}
        >
          <PixelCloud rows={c.rows} />
        </div>
      ))}
      </div>
    </div>
  );
}
