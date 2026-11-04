"use client";

import { memo, useMemo } from "react";
import { rng } from "./procedural";

/** Luciérnagas / polvo dorado que flota en la aldea (se ve más de noche). */
export const Fireflies = memo(function Fireflies({ worldW, sceneH, floor, count = 22 }: { worldW: number; sceneH: number; floor: number; count?: number }) {
  const flies = useMemo(() => {
    const r = rng(1234);
    return Array.from({ length: count }, (_, i) => ({
      x: r() * worldW,
      y: floor + sceneH * (0.16 + r() * 0.38),
      s: r() > 0.7 ? 5 : 3,
      dur: 6 + r() * 6,
      pulse: 1.6 + r() * 2.2,
      delay: -r() * 10,
      hue: i % 3,
      key: i,
    }));
  }, [worldW, sceneH, floor, count]);

  const colors = ["#ffd166", "#fff1b8", "#ffb3c7"];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: "calc(0.15 + var(--lights) * 0.85)" }}>
      {flies.map((f) => (
        <span key={f.key} className="absolute" style={{ left: f.x, bottom: f.y, animation: `float-fly ${f.dur}s ease-in-out ${f.delay}s infinite` }}>
          <span
            className="block"
            style={{
              width: f.s,
              height: f.s,
              background: colors[f.hue],
              boxShadow: `0 0 8px 2px ${colors[f.hue]}`,
              animation: `glow-pulse ${f.pulse}s steps(4) ${f.delay}s infinite`,
            }}
          />
        </span>
      ))}
    </div>
  );
});

const BIRD = ["k...k", ".k.k.", "..k.."];

function PixelBird() {
  return (
    <svg viewBox="0 0 5 3" width="100%" height="100%" shapeRendering="crispEdges" aria-hidden>
      {BIRD.flatMap((row, y) =>
        [...row].map((c, x) => (c === "k" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#2a2342" /> : null)),
      )}
    </svg>
  );
}

/** Bandada de pájaros cruzando el cielo de día. */
export function Birds() {
  const birds = [
    { top: "16%", dur: 26, delay: -4, s: 1 },
    { top: "18.5%", dur: 26, delay: -3.4, s: 0.8 },
    { top: "14.5%", dur: 26, delay: -2.9, s: 0.7 },
    { top: "34%", dur: 38, delay: -20, s: 0.6 },
    { top: "35.5%", dur: 38, delay: -19.4, s: 0.5 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: "calc((1 - var(--lights)) * 0.7)" }}>
      {birds.map((b, i) => (
        <span key={i} className="absolute left-0" style={{ top: b.top, animation: `fly-across ${b.dur}s linear ${b.delay}s infinite` }}>
          <span
            className="block"
            style={{ width: 18 * b.s, height: 11 * b.s, animation: `flap 0.42s steps(2) ${i * 0.1}s infinite` }}
          >
            <PixelBird />
          </span>
        </span>
      ))}
    </div>
  );
}

/** Aurora de colores en la noche, en franjas pixeladas. */
export function Aurora() {
  return (
    <div aria-hidden className="fx-pesado pointer-events-none absolute inset-x-0 top-0 h-[48%] overflow-hidden" style={{ opacity: "calc(var(--stars) * 0.6)" }}>
      {[
        { top: "6%", h: "42%", c: "#9fe3cf", c2: "#b9a7f5", d: 0, dur: 14 },
        { top: "18%", h: "36%", c: "#b9a7f5", c2: "#ffb3c7", d: -6, dur: 18 },
      ].map((a, i) => (
        <div
          key={i}
          className="absolute -inset-x-[10%]"
          style={{
            top: a.top,
            height: a.h,
            background: `linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${a.c} 70%, transparent) 35%, color-mix(in srgb, ${a.c2} 45%, transparent) 70%, transparent 100%)`,
            maskImage:
              "repeating-linear-gradient(90deg, #000 0 9px, rgb(0 0 0 / 0.45) 9px 15px, rgb(0 0 0 / 0.8) 15px 21px), linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
            WebkitMaskImage:
              "repeating-linear-gradient(90deg, #000 0 9px, rgb(0 0 0 / 0.45) 9px 15px, rgb(0 0 0 / 0.8) 15px 21px), linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)",
            animation: `aurora ${a.dur}s ease-in-out ${a.d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** Rayos de sol suaves que se mecen. */
export function SunRays() {
  return (
    <div
      aria-hidden
      className="fx-pesado pointer-events-none absolute"
      style={{
        left: "var(--sun-x)",
        top: "var(--sun-y)",
        width: "160vmax",
        height: "160vmax",
        background:
          "repeating-conic-gradient(from 0deg at 50% 0%, rgb(255 255 255 / 0.22) 0deg 3deg, transparent 3deg 11deg)",
        maskImage: "radial-gradient(closest-side at 50% 0%, #000 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(closest-side at 50% 0%, #000 0%, transparent 70%)",
        opacity: "calc(var(--sun-o) * (1 - var(--lights)) * 0.55)",
        transformOrigin: "50% 0%",
        animation: "rays 16s ease-in-out infinite",
        mixBlendMode: "screen",
      }}
    />
  );
}
