"use client";

import { useEffect, useRef, useState } from "react";

/** Nieve pixel en un solo canvas: barata, se pausa al ocultar la pestaña. */
export function SnowCanvas({ count = 70 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ligero, setLigero] = useState(false);

  useEffect(() => {
    const leer = () => setLigero(document.documentElement.dataset.ligero === "1");
    leer();
    window.addEventListener("ligero-cambio", leer);
    return () => window.removeEventListener("ligero-cambio", leer);
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const PX = 3;
    let w = 0;
    let h = 0;
    const resize = () => {
      w = Math.ceil(window.innerWidth / PX);
      h = Math.ceil(window.innerHeight / PX);
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    // Tres profundidades: lejos (pequeña, lenta), medio y cerca (grande, rápida).
    const DEPTH = [
      { size: 1, v: 0.07, a: 0.45, sway: 0.05 },
      { size: 2, v: 0.17, a: 0.8, sway: 0.09 },
      { size: 3, v: 0.36, a: 0.95, sway: 0.16 },
    ];
    const total = reduced ? 16 : ligero ? Math.round(count * 0.35) : count;
    const flakes = Array.from({ length: total }, (_, i) => {
      const r = i / total;
      const d = r < 0.5 ? 0 : r < 0.85 ? 1 : 2;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        d,
        s: DEPTH[d].size,
        v: DEPTH[d].v * (0.8 + Math.random() * 0.4),
        p: Math.random() * Math.PI * 2,
        a: DEPTH[d].a * (0.75 + Math.random() * 0.25),
      };
    });

    let raf = 0;
    let frameN = 0;
    let light = 1;
    let last = performance.now();
    let running = true;
    const frame = (now: number) => {
      const dt = Math.min(64, now - last) / 16.67;
      last = now;
      ctx.clearRect(0, 0, w, h);
      frameN++;
      if (frameN % 30 === 1) light = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--light")) || 1;
      // viento: brisa suave + ráfagas ocasionales
      const t = now / 1000;
      const gust = Math.max(0, Math.sin(t * 0.21) - 0.75) * 4;
      const wind = Math.sin(t * 0.37) * 0.12 + gust * 0.5;
      for (const f of flakes) {
        f.y += f.v * dt;
        f.p += 0.02 * dt;
        f.x += (Math.sin(f.p) * DEPTH[f.d].sway + wind * (f.d + 1) * 0.6) * dt;
        if (f.x > w + 2) f.x = -2;
        if (f.x < -2) f.x = w + 2;
        if (f.y > h) {
          f.y = -2;
          f.x = Math.random() * w;
        }
        ctx.globalAlpha = f.a * Math.min(1, 0.5 + light * 0.5);
        ctx.fillStyle = f.d === 2 ? "#ffffff" : f.d === 1 ? "#f4f8ff" : "#e6eeff";
        ctx.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s);
      }
      if (running && !reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) {
        last = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [count, ligero]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pixelated pointer-events-none fixed inset-0 z-20 h-full w-full"
    />
  );
}
