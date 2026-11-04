"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sky } from "@/components/village/Sky";
import { Village } from "@/components/village/Village";
import { SnowCanvas } from "@/components/village/SnowCanvas";
import { ZoneNav } from "@/components/modules/ZoneNav";
import { HomeHeader, MissionPill, SwipeHint } from "./HomeHud";
import { useYo } from "./useYo";
import { Guia } from "./Guia";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { mockGroup } from "@/lib/mock";

/** Recorrido del desglose vertical de la portada, en altos de pantalla. */
const RANGE = 1.15;
const INTRO_KEY = "jdr:intro-vista";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Portada en "desglose": la cámara empieza mirando el cielo y, al bajar,
 * cada plano sube a su propia velocidad hasta armar la aldea. Más abajo
 * aparecen las zonas de juegos.
 */
export function HomeStage() {
  const yo = useYo();
  const [hud, setHud] = useState(false);
  const [inVillage, setInVillage] = useState(true);
  const arrivedRef = useRef(false);
  const autoRef = useRef(0);
  const stageRef = useRef<HTMLElement>(null);
  /** Se decide una sola vez (el modo estricto ejecuta los efectos dos veces). */
  const introRef = useRef<boolean | null>(null);

  const range = () => window.innerHeight * RANGE;

  const descend = useCallback((duration = 1800) => {
    cancelAnimationFrame(autoRef.current);
    const from = window.scrollY;
    const to = range();
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, from + (to - from) * ease(k));
      if (k < 1) autoRef.current = requestAnimationFrame(step);
    };
    autoRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const stage = stageRef.current;
    root.dataset.arrived = arrivedRef.current ? "1" : "0";
    let raf = 0;
    const update = () => {
      const r = range();
      const p = Math.max(0, Math.min(1, window.scrollY / r));
      // --p solo en el escenario (no en <html>): así no se recalcula toda la página al hacer scroll
      stage?.style.setProperty("--p", p.toFixed(3));
      setHud(p > 0.82);
      setInVillage(window.scrollY < r + window.innerHeight * 0.35);
      if (p > 0.9 && root.dataset.arrived !== "1") {
        root.dataset.arrived = "1";
        if (!arrivedRef.current) window.dispatchEvent(new CustomEvent("aldea-llegada"));
        arrivedRef.current = true;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Primera visita de la sesión: la cámara baja sola. Después, directo a la aldea.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (introRef.current === null) {
      let seen = false;
      try {
        seen = sessionStorage.getItem(INTRO_KEY) === "1";
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      introRef.current = !seen;
    }
    let introTimer = 0;
    if (!introRef.current || reduced || root.dataset.ligero === "1") {
      window.scrollTo(0, range());
    } else {
      window.scrollTo(0, 0);
      introTimer = window.setTimeout(() => descend(), 400);
    }
    update();

    const stop = () => {
      cancelAnimationFrame(autoRef.current);
      window.clearTimeout(introTimer);
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);

    return () => {
      stop();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      stage?.style.setProperty("--p", "1");
      root.dataset.arrived = "1";
    };
  }, [descend]);

  return (
    <>
      <main ref={stageRef} className="stage relative w-full" style={{ height: `calc(100svh + ${RANGE * 100}svh)` }}>
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <Sky />
          <div className="absolute inset-0 origin-bottom will-change-transform" style={{ transform: "scale(calc(1 + (1 - var(--p, 1)) * 0.08))" }}>
            <Village />
          </div>

          {/* Portada en el cielo */}
          <div
            className="pointer-events-none absolute inset-x-0 top-[13%] z-20 flex flex-col items-center px-6 text-center"
            style={{
              opacity: "clamp(0, calc(1 - var(--p, 1) * 2.4), 1)",
              transform: "translateY(calc(var(--p, 1) * -120px)) scale(calc(1 - var(--p, 1) * 0.12))",
            }}
            aria-hidden={hud}
          >
            <span className="px-chip mb-4" style={{ ["--chip" as string]: "rgb(255 246 229 / 0.9)" }}>
              ✦ Temporada navideña · Día {mockGroup.day} de {mockGroup.totalDays} ✦
            </span>
            <h1 className="hero-title font-pixel">
              {APP_NAME.split(" ").slice(0, 2).join(" ")}
              <br />
              {APP_NAME.split(" ").slice(2).join(" ")}
            </h1>
            <p className="mt-4 max-w-xs font-pixel text-[1rem]" style={{ color: "var(--on-sky)", textShadow: "0 2px 0 rgb(0 0 0 / .25)" }}>
              {APP_TAGLINE}
            </p>
            {!hud && (
              <button
                type="button"
                onClick={() => descend(1600)}
                className="px-btn shine pointer-events-auto mt-7"
                style={{ ["--bg" as string]: "var(--gold)" }}
              >
                <span className="scroll-cue">▼</span> Bajar a la aldea
              </button>
            )}
          </div>

        </div>
      </main>


      {/* Nieve sobre toda la página (aldea y zonas) */}
      <SnowCanvas />

      {/* Cabecera fija (aparece al llegar) */}
      <div
        className="fixed inset-x-0 top-0 z-30"
        style={{
          opacity: hud ? 1 : 0,
          transform: hud ? "translateY(0)" : "translateY(-18px)",
          transition: "opacity 450ms ease, transform 600ms cubic-bezier(0.2, 0.9, 0.3, 1.2)",
        }}
        inert={!hud}
      >
        <HomeHeader compact={!inVillage} yo={yo} />
      </div>

      {/* Franja de fondo bajo la cabecera y la barra de zonas (solo en las zonas) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[29]"
        style={{
          height: "calc(max(12px, env(safe-area-inset-top)) + 112px)",
          background: "linear-gradient(180deg, rgb(255 246 229 / .97) 0%, rgb(255 246 229 / .95) 72%, rgb(255 246 229 / 0) 100%)",
          opacity: hud && !inVillage ? 1 : 0,
          transition: "opacity 300ms ease",
        }}
      />
      <ZoneNav visible={hud && !inVillage} />

      {/* Misión de hoy: píldora sobre la barra inferior, solo en la aldea */}
      <div
        className="fixed inset-x-0 z-30"
        style={{
          bottom: "calc(max(10px, env(safe-area-inset-bottom)) + 86px)",
          opacity: hud && inVillage ? 1 : 0,
          transform: hud && inVillage ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 400ms ease, transform 500ms cubic-bezier(0.2, 0.9, 0.3, 1.2)",
        }}
        inert={!(hud && inVillage)}
      >
        <MissionPill yo={yo} />
      </div>
      {hud && inVillage && <SwipeHint />}
      <Guia autoAbrir={hud} />
    </>
  );
}
