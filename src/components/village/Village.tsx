"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BUILDINGS, buildingSize } from "@/lib/village";
import { FOREGROUND, LAYERS, type LayerAsset } from "@/lib/assets/manifest";
import { mockGroup, mockHotspots } from "@/lib/mock";
import { Building } from "./Building";
import { Forest, Ridge } from "./procedural";
import { Mascot, type MascotHandle } from "./Mascot";
import { Train } from "./Train";
import { Fireflies } from "./Ambient";
import { Garland } from "./Garland";

/** Pixeles de arte por alto de escena: define el "tamaño" del pixel. */
const ART_ROWS = 200;

/**
 * Profundidad de cada plano para el "desglose" vertical: cuánto (en altos de
 * pantalla) está desplazado hacia abajo cuando la cámara mira al cielo (--p = 0).
 */
const DROP: Record<string, number> = {
  "mountains-far": 0.16,
  "mountains-near": 0.3,
  "mist-high": 0.42,
  hills: 0.55,
  "mist-low": 0.7,
  ground: 0.9,
  village: 0.9,
  foreground: 1.35,
};

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/** Transformación común: pan horizontal + desglose vertical + cámara (mouse/giroscopio). */
function planeTransform(speed: number, drop: number, vh: number) {
  const shift = 1 - speed;
  const ax = (-speed * 30).toFixed(1);
  const ay = (-speed * 12).toFixed(1);
  const dy = Math.round(drop * vh);
  return `translate3d(calc(var(--scroll, 0) * ${shift}px + var(--mx, 0) * ${ax}px - 24px), calc((1 - var(--p, 1)) * ${dy}px + var(--my, 0) * ${ay}px), 0)`;
}

function ProceduralLayer({ id, w, h }: { id: string; w: number; h: number }) {
  const W = Math.max(40, Math.round(w));
  const H = Math.max(20, Math.round(h));
  switch (id) {
    case "mountains-far":
      return <Ridge w={W} h={H} seed={7} base={0.35} amp={0.6} freq={W / 260} color="#9aa3e6" shade="#8790d6" snow="#eef1ff" snowLine={0.66} step={3} />;
    case "mountains-near":
      return <Ridge w={W} h={H} seed={19} base={0.3} amp={0.55} freq={W / 200} color="#7d86d0" shade="#6870bd" snow="#e6ebff" snowLine={0.62} step={2} />;
    case "hills":
      return <Ridge w={W} h={H} seed={33} base={0.25} amp={0.3} freq={W / 160} color="#5aa98e" shade="#4a9580" snow="#f1f6ff" snowLine={0.38} step={2} />;
    case "ground":
      return <Ridge w={W} h={H} seed={51} base={0.72} amp={0.14} freq={W / 220} color="#f4f8ff" shade="#e3ebfb" step={2} />;
    case "foreground":
      return <Forest w={W} h={H} seed={88} count={Math.max(4, Math.round(W / 70))} color="#24485a" shade="#1c3a4b" snow="#dfe8f7" minH={0.6} maxH={0.98} groundY={1} />;
    default:
      return null;
  }
}

function Layer({
  layer,
  sceneH,
  vw,
  vh,
  maxScroll,
  artPx,
  z,
  floor,
}: {
  layer: LayerAsset;
  sceneH: number;
  vw: number;
  vh: number;
  maxScroll: number;
  artPx: number;
  z: number;
  floor: number;
}) {
  const height = layer.height * sceneH;
  const width = vw + maxScroll * layer.speed + 60;
  return (
    <div
      className="absolute left-0 will-change-transform"
      style={{
        bottom: layer.bottom * sceneH + (layer.bottom > 0 ? floor : 0),
        height: height + (layer.bottom > 0 ? 0 : floor),
        width,
        zIndex: z,
        transform: planeTransform(layer.speed, DROP[layer.id] ?? 0.5, vh),
        filter: `brightness(calc(var(--light) * ${layer.tone ?? 1})) saturate(var(--sat))`,
      }}
    >
      {layer.src ? (
        <div className="relative h-full w-full" style={{ transform: layer.flip ? "scaleX(-1)" : undefined }}>
          <div
            className="pixelated absolute inset-0"
            style={{
              backgroundImage: `url(${layer.src})`,
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              backgroundPosition: "left bottom",
            }}
          />
          {layer.haze > 0 && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: "linear-gradient(180deg, color-mix(in srgb, var(--haze) 40%, transparent) 0%, var(--haze) 100%)",
                opacity: layer.haze,
                maskImage: `url(${layer.src})`,
                maskRepeat: "repeat-x",
                maskSize: "auto 100%",
                maskPosition: "left bottom",
                WebkitMaskImage: `url(${layer.src})`,
                WebkitMaskRepeat: "repeat-x",
                WebkitMaskSize: "auto 100%",
                WebkitMaskPosition: "left bottom",
              }}
            />
          )}
        </div>
      ) : (
        <ProceduralLayer id={layer.id} w={width / artPx} h={height / artPx} />
      )}
    </div>
  );
}

/** Banco de neblina que se desplaza entre planos (da profundidad y movimiento). */
function Mist({
  id,
  speed,
  bottom,
  height,
  sceneH,
  vw,
  vh,
  maxScroll,
  floor,
  z,
  strength,
  dur,
}: {
  id: string;
  speed: number;
  bottom: number;
  height: number;
  sceneH: number;
  vw: number;
  vh: number;
  maxScroll: number;
  floor: number;
  z: number;
  strength: number;
  dur: number;
}) {
  const width = vw + maxScroll * speed + 60;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 overflow-hidden will-change-transform"
      style={{
        bottom: floor + bottom * sceneH,
        height: height * sceneH,
        width,
        zIndex: z,
        transform: planeTransform(speed, DROP[id] ?? 0.5, vh),
        opacity: `calc(${strength} * (0.55 + var(--lights) * 0.25 + var(--tint-alpha)))`,
      }}
    >
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: "200%",
          background:
            "radial-gradient(40% 55% at 15% 60%, color-mix(in srgb, #ffffff 55%, var(--haze)) 0%, transparent 70%), radial-gradient(35% 50% at 45% 55%, color-mix(in srgb, #ffffff 45%, var(--haze)) 0%, transparent 70%), radial-gradient(45% 60% at 75% 65%, color-mix(in srgb, #ffffff 55%, var(--haze)) 0%, transparent 70%)",
          backgroundSize: "50% 100%",
          backgroundRepeat: "repeat-x",
          maskImage: "repeating-linear-gradient(180deg, #000 0 6px, rgb(0 0 0 / 0.7) 6px 9px)",
          WebkitMaskImage: "repeating-linear-gradient(180deg, #000 0 6px, rgb(0 0 0 / 0.7) 6px 9px)",
          animation: `mist-drift ${dur}s linear infinite`,
        }}
      />
    </div>
  );
}

export function Village() {
  const [frameRef, { w: vw, h: vh }] = useSize<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cuyRef = useRef<MascotHandle>(null);

  const sceneH = Math.min(Math.max(vh * 0.6, 360), 760);
  /** espacio libre bajo la aldea para la barra inferior */
  const floor = vw < 768 ? 150 : 120;
  const worldW = Math.max(vw * 1.15, sceneH * 3.3);
  const maxScroll = Math.max(0, worldW - vw);
  const artPx = sceneH / ART_ROWS;
  const ready = vw > 0 && vh > 0;

  // Pan horizontal: un solo valor CSS que leen todas las capas.
  useEffect(() => {
    const sc = scrollRef.current;
    const world = worldRef.current;
    if (!sc || !world) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => world.style.setProperty("--scroll", String(sc.scrollLeft)));
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      sc.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ready]);

  // Centrar al inicio en la misión pendiente.
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc || !ready) return;
    const target = BUILDINGS.find((b) => mockHotspots[b.id] === "pending") ?? BUILDINGS[0];
    sc.scrollLeft = Math.max(0, Math.min(maxScroll, target.x * worldW - vw / 2));
    worldRef.current?.style.setProperty("--scroll", String(sc.scrollLeft));
  }, [ready, maxScroll, worldW, vw]);

  // Cámara con inercia: mouse, giroscopio o "respiración" en reposo.
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let lastInput = -1e9;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      lastInput = performance.now();
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 22));
      ty = Math.max(-1, Math.min(1, (e.beta - 40) / 26));
      lastInput = performance.now();
    };
    // iOS pide permiso para el giroscopio: se solicita con el primer toque.
    const askTilt = () => {
      const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      D?.requestPermission?.().catch(() => {});
    };
    const loop = (now: number) => {
      if (now - lastInput > 2500) {
        const t = now / 1000;
        tx = Math.sin(t * 0.23) * 0.45;
        ty = Math.sin(t * 0.17 + 1) * 0.3;
      }
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      world.style.setProperty("--mx", cx.toFixed(4));
      world.style.setProperty("--my", cy.toFixed(4));
      raf = requestAnimationFrame(loop);
    };
    if (!reduced) {
      raf = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("deviceorientation", onTilt);
      window.addEventListener("pointerdown", askTilt, { once: true });
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("pointerdown", askTilt);
    };
  }, [ready]);

  // Arrastre con mouse (en celular el gesto es nativo).
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let moved = 0;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startScroll = sc.scrollLeft;
    };
    const drag = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      sc.scrollLeft = startScroll - dx;
    };
    const up = () => {
      dragging = false;
    };
    const click = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    sc.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", drag);
    window.addEventListener("pointerup", up);
    sc.addEventListener("click", click, true);
    return () => {
      sc.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", drag);
      window.removeEventListener("pointerup", up);
      sc.removeEventListener("click", click, true);
    };
  }, [ready]);

  const pan = (dir: number) => scrollRef.current?.scrollBy({ left: dir * vw * 0.6, behavior: "smooth" });

  // Puntos de la guirnalda: sobre los techos de los edificios.
  const garland = useMemo(() => {
    if (!ready) return [];
    return BUILDINGS.map((b) => {
      const { h } = buildingSize(b, sceneH);
      return { x: b.x * worldW, y: vh - (floor + b.bottom * sceneH - 30 + h * 0.8) };
    });
  }, [ready, sceneH, worldW, vh, floor]);

  const common = { sceneH, vw, vh, maxScroll, floor };

  return (
    <div ref={frameRef} className="absolute inset-0">
      <div
        ref={scrollRef}
        className="no-scrollbar absolute inset-0 overflow-x-auto overflow-y-hidden"
        style={{ cursor: "grab", touchAction: "pan-x pan-y", overscrollBehaviorX: "contain" }}
      >
        {ready && (
          <div ref={worldRef} className="relative h-full" style={{ width: worldW, ["--px" as string]: `${artPx}px` }}>
            <Layer layer={LAYERS[0]} {...common} artPx={artPx} z={2} />
            <Layer layer={LAYERS[1]} {...common} artPx={artPx} z={4} />
            <Mist id="mist-high" speed={0.36} bottom={0.3} height={0.26} z={5} strength={0.55} dur={70} {...common} />
            <Layer layer={LAYERS[2]} {...common} artPx={artPx} z={6} />
            {/* Tren lejano en las colinas (va al revés y más lento) */}
            <div
              className="pointer-events-none absolute left-0 top-0 h-full z-[6] will-change-transform"
              style={{ width: vw + maxScroll * 0.5 + 60, transform: planeTransform(0.5, DROP.hills, vh) }}
            >
              <Train worldW={vw + maxScroll * 0.5} bottom={floor + sceneH * 0.3} scale={Math.max(1, artPx * 0.5)} palette="azul" reverse pxPerSec={24} delay={-20} />
            </div>
            <Mist id="mist-low" speed={0.72} bottom={0.2} height={0.2} z={7} strength={0.42} dur={48} {...common} />
            <Layer layer={LAYERS[3]} {...common} artPx={artPx} z={8} />

            {/* Tinte atmosférico sobre los planos */}
            <div
              className="pointer-events-none absolute inset-0 z-[9]"
              style={{ background: "var(--tint)", opacity: "var(--tint-alpha)", mixBlendMode: "multiply" }}
            />

            {/* Aldea: se mueve con el suelo. Tocar la nieve hace caminar al cuy. */}
            <div
              className="absolute inset-0 z-[10] will-change-transform"
              style={{ transform: planeTransform(1, DROP.village, vh) }}
              onClick={(e) => {
                const r = worldRef.current?.getBoundingClientRect();
                if (r) cuyRef.current?.walkTo(e.clientX - r.left);
              }}
            >
              <Train worldW={worldW} bottom={floor + sceneH * 0.27} scale={Math.max(2, artPx * 1.1)} palette="rojo" />
              <div className="absolute inset-0">
                <Garland points={garland} lit={mockGroup.completedToday} total={mockGroup.members} />
              </div>
              <div
                className="absolute inset-0"
                style={{ filter: "brightness(calc(0.5 + var(--light) * 0.5)) saturate(var(--sat))" }}
              >
                <Mascot ref={cuyRef} sceneH={sceneH} worldW={worldW} floor={floor} startX={worldW * 0.41} />
                {BUILDINGS.map((b, i) => (
                  <Building key={b.id} index={i} def={b} state={mockHotspots[b.id] ?? "available"} sceneH={sceneH} worldW={worldW} floor={floor} />
                ))}
                <Fireflies worldW={worldW} sceneH={sceneH} floor={floor} />
              </div>
              {/* Tren del frente (en sentido contrario) */}
              <Train worldW={worldW} bottom={floor - 8} scale={Math.max(2.4, artPx * 1.3)} palette="dorado" reverse pxPerSec={72} delay={-9} />
            </div>

            <div className="pointer-events-none absolute inset-0 z-[12]">
              <Layer layer={FOREGROUND} {...common} artPx={artPx} z={12} />
            </div>
          </div>
        )}
      </div>

      {/* Flechas para recorrer la aldea en escritorio (solo si hay qué recorrer) */}
      {maxScroll > 140 && (
      <>
      <div className="absolute left-3 top-[40%] z-20 hidden md:block">
        <button type="button" onClick={() => pan(-1)} aria-label="Ver la aldea hacia la izquierda" className="px-btn !min-h-0 !px-3 !py-3" style={{ ["--bg" as string]: "var(--cream)" }}>
          ◀
        </button>
      </div>
      <div className="absolute right-3 top-[40%] z-20 hidden md:block">
        <button type="button" onClick={() => pan(1)} aria-label="Ver la aldea hacia la derecha" className="px-btn !min-h-0 !px-3 !py-3" style={{ ["--bg" as string]: "var(--cream)" }}>
          ▶
        </button>
      </div>
      </>
      )}

      {/* Viñeta suave para dar profundidad */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "radial-gradient(130% 90% at 50% 45%, transparent 60%, rgba(27, 31, 74, 0.3) 100%)" }}
      />
    </div>
  );
}
