"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { SPRITES, SPRITE_SCALE } from "@/lib/assets/manifest";
import { useAtmosphere } from "@/components/atmosphere/AtmosphereProvider";

const TIPS: Record<string, string[]> = {
  dia: [
    "¡Habla, agente! La misión de hoy no se cumple sola.",
    "Dicen que alguien ya sabe quién le regala… 👀",
    "Tip de cuy: el escudo te salva de un robo, no de tu tía preguntando por tu tesis.",
    "Si prendemos todas las luces, la plaza brilla. Cumple tu misión, pe.",
    "Abajo hay más juegos. Baja nomás ▼",
  ],
  noche: [
    "Psst… de noche los expedientes se leen mejor.",
    "Todavía estás a tiempo de cumplir la misión. Ya, rapidito.",
    "Las luces de la aldea dependen de ti, agente. Sin presión. Bueno, un poquito.",
  ],
};
const WALK_LINES = ["¡Voy, voy!", "¿Aquí, jefe?", "Patitas pa' qué te quiero", "En camino 🐹"];
const WELCOME = "¡Hola, agente! Toca un edificio para entrar, tócame a mí o toca la nieve para que camine. Baja ▼ para ver los juegos.";

export interface MascotHandle {
  walkTo: (x: number) => void;
}

/** El Cuy Agente: camina a donde toques, salta si lo tocas y pasea solo. */
export const Mascot = forwardRef<MascotHandle, { sceneH: number; worldW: number; floor: number; startX: number }>(function Mascot(
  { sceneH, worldW, floor, startX },
  ref,
) {
  const sprite = SPRITES["mascota"];
  const { atmosphere } = useAtmosphere();
  const [x, setX] = useState(startX);
  const [dur, setDur] = useState(0);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [joy, setJoy] = useState(0);
  const [tip, setTip] = useState<string | null>(null);
  const [hearts, setHearts] = useState<number[]>([]);
  const n = useRef(0);
  const lastCommand = useRef(0);
  const tipTimer = useRef(0);
  const xRef = useRef(startX);

  const h = sprite ? sprite.h * SPRITE_SCALE * sceneH * 0.85 : 0;
  const w = sprite ? (h * sprite.w) / sprite.h : 0;

  const say = useCallback((t: string, ms = 4200) => {
    window.clearTimeout(tipTimer.current);
    setTip(t);
    tipTimer.current = window.setTimeout(() => setTip(null), ms);
  }, []);

  const walkTo = useCallback(
    (target: number, talk = true) => {
      const tx = Math.max(w, Math.min(worldW - w, target));
      const dist = Math.abs(tx - xRef.current);
      if (dist < 8) return;
      setFacing(tx > xRef.current ? 1 : -1);
      setDur(dist / 140);
      setWalking(true);
      setX(tx);
      xRef.current = tx;
      if (talk && Math.random() < 0.6) say(WALK_LINES[Math.floor(Math.random() * WALK_LINES.length)], 1800);
    },
    [w, worldW, say],
  );

  useImperativeHandle(ref, () => ({
    walkTo: (tx: number) => {
      lastCommand.current = performance.now();
      walkTo(tx);
    },
  }), [walkTo]);

  // Pasea solo cuando nadie le hace caso.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (performance.now() - lastCommand.current < 12000) return;
      if (Math.random() < 0.55) walkTo(xRef.current + (Math.random() - 0.5) * 320, false);
    }, 6500);
    return () => window.clearInterval(id);
  }, [walkTo]);

  // Saludo al llegar a la aldea.
  useEffect(() => {
    const hello = () => window.setTimeout(() => say(WELCOME, 6500), 900);
    if (document.documentElement.dataset.arrived === "1") hello();
    window.addEventListener("aldea-llegada", hello);
    return () => window.removeEventListener("aldea-llegada", hello);
  }, [say]);

  if (!sprite) return null;
  const pool = atmosphere.isNight ? TIPS.noche : TIPS.dia;

  const poke = (e: React.MouseEvent) => {
    e.stopPropagation();
    lastCommand.current = performance.now();
    n.current = (n.current + 1) % pool.length;
    say(pool[n.current]);
    setJoy((j) => j + 1);
    setHearts((hs) => [...hs.slice(-6), Date.now()]);
    navigator.vibrate?.([10, 30, 10]);
  };

  return (
    <div
      className="absolute"
      style={{
        zIndex: tip ? 30 : 2,
        left: 0,
        bottom: floor + 0.12 * sceneH,
        width: w,
        height: h,
        transform: `translateX(${x - w / 2}px)`,
        transition: `transform ${dur}s linear`,
      }}
      onTransitionEnd={() => setWalking(false)}
    >
      {tip && (
        <span
          role="status"
          className="px-box anim-pop absolute bottom-full left-1/2 z-10 mb-3 w-60 -translate-x-1/2 px-3 py-2 text-left text-[0.85rem] leading-snug"
          style={{ ["--bg" as string]: "#fff" }}
        >
          {tip}
        </span>
      )}
      {hearts.map((id, i) => (
        <span
          key={id}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 text-lg"
          style={{ ["--hx" as string]: `${(i % 2 ? 1 : -1) * (10 + (i % 3) * 12)}px`, animation: "heart-up 1.1s ease-out forwards" }}
        >
          {["💛", "✨", "❤️", "⭐"][i % 4]}
        </span>
      ))}
      <button
        type="button"
        onClick={poke}
        aria-label="Cuy Agente: tócalo para que salte y te dé un consejo"
        className="block h-full w-full"
      >
        <span
          key={joy}
          className="block h-full w-full origin-bottom"
          style={{ animation: joy ? "cuy-joy 700ms cubic-bezier(.3,1.3,.5,1)" : undefined }}
        >
          <span
            className="block h-full w-full origin-bottom"
            style={{ animation: walking ? "cuy-walk 0.32s steps(2) infinite" : "bob 1.2s steps(2, jump-none) infinite" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sprite.src}
              alt=""
              draggable={false}
              className="pixelated h-full w-full object-contain"
              style={{ transform: `scaleX(${facing})`, transition: "transform 120ms steps(1)" }}
            />
          </span>
        </span>
      </button>
    </div>
  );
});
