"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { buildingSize, type BuildingDef } from "@/lib/village";
import type { HotspotState } from "@/lib/mock";
import { SPRITES } from "@/lib/assets/manifest";
import { PixelBuilding } from "./procedural";
import { PixelIcon } from "@/components/ui/PixelIcon";

/** Animación de espera según el tipo de edificio. */
const IDLE: Record<string, string> = {
  tree: "sway 4.8s ease-in-out infinite",
  chest: "breathe 1.6s steps(2, jump-none) infinite",
  mailbox: "breathe 2.2s steps(2, jump-none) infinite",
  house: "breathe 3s ease-in-out infinite",
  stall: "breathe 2.6s ease-in-out infinite",
  board: "breathe 3.4s ease-in-out infinite",
  tower: "breathe 3.4s ease-in-out infinite",
};

/** Dónde salen destellos (en % del sprite). */
const SPARKLES: Record<string, [number, number, number][]> = {
  chest: [[30, 30, 0], [62, 22, 0.6], [80, 40, 1.2], [48, 10, 0.3]],
  tree: [[50, 2, 0], [30, 40, 0.9], [68, 58, 1.5], [40, 75, 0.4]],
  stall: [[14, 52, 0.2], [70, 30, 1.1]],
  board: [[50, 0, 0.5]],
};

const BURST_COLORS = ["#f6b93b", "#e2445c", "#9fe3cf", "#b9a7f5", "#ffffff", "#ffb3c7"];

export function Building({
  def,
  state,
  sceneH,
  worldW,
  floor = 0,
  index = 0,
}: {
  def: BuildingDef;
  state: HotspotState;
  sceneH: number;
  worldW: number;
  floor?: number;
  index?: number;
}) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const [bursts, setBursts] = useState<number[]>([]);
  const burstId = useRef(0);
  const sprite = SPRITES[def.id];
  const { w, h } = buildingSize(def, sceneH);
  const locked = state === "locked";
  const sparkles = locked ? [] : (SPARKLES[def.kind] ?? []);

  const go = () => {
    if (locked) return;
    setPressed(true);
    const id = ++burstId.current;
    setBursts((b) => [...b, id]);
    navigator.vibrate?.(12);
    window.setTimeout(() => {
      if (def.href.startsWith("#")) {
        const el = document.getElementById(def.href.slice(1));
        const top = el ? el.getBoundingClientRect().top + window.scrollY - 110 : 0;
        window.scrollTo({ top, behavior: "smooth" });
      } else {
        router.push(def.href);
      }
    }, 260);
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        go();
      }}
      aria-label={`${def.label}${state === "pending" ? " (pendiente hoy)" : state === "done" ? " (completado)" : locked ? " (bloqueado)" : ""}`}
      aria-disabled={locked}
      className="group absolute flex flex-col items-center focus-visible:outline-none"
      style={{ left: def.x * worldW - w / 2, bottom: floor + def.bottom * sceneH - 30, width: w }}
    >
      {/* Halo cálido de noche */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: w * 2,
          height: h * 1.3,
          background: "radial-gradient(closest-side, rgba(255, 196, 110, 0.6), rgba(255, 160, 90, 0.16) 60%, transparent)",
          opacity: locked ? 0 : "calc(var(--lights) * 0.95)",
          animation: "glow-pulse 4s ease-in-out infinite",
          animationDelay: `${index * 0.5}s`,
        }}
      />

      {/* Anillo que llama la atención sobre la misión pendiente */}
      {state === "pending" && (
        <span aria-hidden className="pointer-events-none absolute left-1/2" style={{ bottom: 30, width: w * 0.9, height: w * 0.25 }}>
          <span
            className="absolute bottom-0 left-1/2 block h-full w-full rounded-[50%] border-2"
            style={{ borderColor: "var(--gold)", animation: "ring 1.8s ease-out infinite" }}
          />
        </span>
      )}

      {/* Globo de estado */}
      {state === "pending" && (
        <span
          className="px-box absolute left-1/2 z-10 flex items-center justify-center"
          style={{ top: -22, width: 28, height: 32, ["--bg" as string]: "#fff", animation: "float-badge 1s steps(2) infinite" }}
        >
          <PixelIcon name="bang" size={9} />
        </span>
      )}
      {state === "done" && (
        <span className="absolute left-1/2 z-10 -translate-x-1/2" style={{ top: -18 }}>
          <PixelIcon name="check" size={24} />
        </span>
      )}
      {locked && (
        <span className="absolute left-1/2 z-10 -translate-x-1/2" style={{ top: h * 0.35 }}>
          <PixelIcon name="lock" size={24} />
        </span>
      )}

      {/* Sombra pixel en la nieve */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: 26,
          width: w * 0.92,
          height: Math.max(6, h * 0.07),
          background: "radial-gradient(closest-side, rgba(42, 35, 66, 0.32), rgba(42, 35, 66, 0.12) 70%, transparent)",
          clipPath:
            "polygon(8% 0, 92% 0, 92% 25%, 100% 25%, 100% 75%, 92% 75%, 92% 100%, 8% 100%, 8% 75%, 0 75%, 0 25%, 8% 25%)",
        }}
      />

      {/* Entrada con rebote */}
      <span className="anim-drop relative block" style={{ animationDelay: `${350 + index * 90}ms` }}>
        {/* Sprite con animación de espera */}
        <span
          className="relative block origin-bottom transition-transform duration-150 group-hover:-translate-y-1 group-focus-visible:-translate-y-1"
          style={{
            width: w,
            height: h,
            animation: pressed ? "squash 260ms ease-out" : IDLE[def.kind],
            animationDelay: pressed ? undefined : `${index * 0.37}s`,
            filter: locked ? "grayscale(1) brightness(0.7)" : undefined,
          }}
        >
          {sprite ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sprite.src} alt="" className="pixelated h-full w-full object-contain object-bottom" draggable={false} />
              {/* Tinte de la hora del día, recortado a la silueta del sprite */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "var(--tint)",
                  opacity: "calc(var(--tint-alpha) * 1.1)",
                  mixBlendMode: "multiply",
                  maskImage: `url(${sprite.src})`,
                  maskSize: "100% 100%",
                  WebkitMaskImage: `url(${sprite.src})`,
                  WebkitMaskSize: "100% 100%",
                }}
              />
              {/* Luz de borde cálida al atardecer */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "linear-gradient(100deg, color-mix(in srgb, var(--glow) 70%, transparent), transparent 45%)",
                  opacity: "calc(var(--tint-alpha) * 1.4)",
                  mixBlendMode: "screen",
                  maskImage: `url(${sprite.src})`,
                  maskSize: "100% 100%",
                  WebkitMaskImage: `url(${sprite.src})`,
                  WebkitMaskSize: "100% 100%",
                }}
              />
            </>
          ) : (
            <PixelBuilding kind={def.kind} roof={def.roof} wall={def.wall} chimney={def.chimney} />
          )}

          {/* Humo de chimenea (posición del sprite de la casa) */}
          {def.kind === "house" && !locked && (
            <span aria-hidden className="pointer-events-none absolute" style={{ left: "63%", top: "6%" }}>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="absolute block rounded-[2px]"
                  style={{
                    width: 7 + (i % 2) * 3,
                    height: 7 + (i % 2) * 3,
                    background: "color-mix(in srgb, #ffffff 80%, var(--lavender))",
                    animation: `smoke 4s steps(10) ${i * 1}s infinite`,
                  }}
                />
              ))}
            </span>
          )}

          {sparkles.map(([x, y, d], i) => (
            <span key={i} className="sparkle" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d + index * 0.2}s` }} />
          ))}

          {/* Explosión de pixeles al tocar */}
          {bursts.map((id) => (
            <span key={id} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2;
                const r = 40 + (i % 3) * 18;
                return (
                  <span
                    key={i}
                    className="burst-p"
                    style={{
                      background: BURST_COLORS[i % BURST_COLORS.length],
                      ["--dx" as string]: `${Math.cos(a) * r}px`,
                      ["--dy" as string]: `${Math.sin(a) * r - 20}px`,
                    }}
                  />
                );
              })}
            </span>
          ))}
        </span>
      </span>

      {/* Letrero de zona */}
      <span
        className="anim-drop mt-2 flex flex-col items-center"
        style={{ animationDelay: `${600 + index * 90}ms` }}
      >
        {def.zone && (
          <span
            className="px-chip !py-0.5 !text-[0.62rem] uppercase tracking-wider"
            style={{ ["--chip" as string]: def.zoneColor, color: def.zoneColor === "#f6b93b" || def.zoneColor === "#b9a7f5" || def.zoneColor === "#57b9f0" ? "var(--ink)" : "var(--cream)" }}
          >
            {def.zone}
          </span>
        )}
        <span
          className="px-chip -mt-0.5 transition-transform group-hover:-translate-y-0.5 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-[var(--lavender)]"
          style={{ ["--chip" as string]: state === "pending" ? "var(--gold)" : "rgb(255 246 229 / 0.92)", fontSize: "0.74rem" }}
        >
          {def.label}
        </span>
      </span>
    </button>
  );
}
