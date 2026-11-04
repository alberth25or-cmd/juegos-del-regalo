"use client";

import { SPRITES } from "@/lib/assets/manifest";
import { AGENT_PALETTES, PixelAgent } from "@/components/ui/PixelAgent";
import { PixelIcon } from "@/components/ui/PixelIcon";
import type { SceneId } from "@/lib/modules";
import { Ogre, Snowman } from "./Characters";

/** Partícula que sale en arco (agua, chocolate, monedas…). */
function Arc({
  dx,
  h,
  dur,
  delay,
  children,
}: {
  dx: number;
  h: number;
  dur: number;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <span
      className="absolute left-0 top-0 block"
      style={{ ["--dx" as string]: `${dx}px`, animation: `arc-x ${dur}s linear ${delay}s infinite` }}
    >
      <span className="block" style={{ ["--h" as string]: `${-h}px`, animation: `arc-y ${dur}s linear ${delay}s infinite` }}>
        {children}
      </span>
    </span>
  );
}

function Sprite({ id, h, className, style }: { id: string; h: number; className?: string; style?: React.CSSProperties }) {
  const s = SPRITES[id];
  if (!s) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={s.src} alt="" draggable={false} className={`pixelated block ${className ?? ""}`} style={{ height: h, width: "auto", ...style }} />;
}

/* ---------------- Plaza de la Chocolatada ---------------- */
function Fountain() {
  const drops = Array.from({ length: 18 }, (_, i) => ({
    dx: ((i % 6) - 2.5) * 22,
    h: 70 + (i % 3) * 18,
    dur: 1.3 + (i % 4) * 0.12,
    delay: -(i * 0.17),
    s: i % 3 === 0 ? 8 : 6,
  }));
  return (
    <div className="relative mx-auto h-[220px] w-[300px]">
      {/* chorro central que fluye */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[34px] h-[56px] w-[12px] -translate-x-1/2"
        style={{
          background: "repeating-linear-gradient(180deg, #9a5b34 0 6px, #7a3f22 6px 12px)",
          boxShadow: "0 0 0 2px #2a2342",
          animation: "flow 0.5s linear infinite",
        }}
      />
      <div aria-hidden className="absolute left-1/2 top-[24px] h-[16px] w-[34px] -translate-x-1/2 rounded-[40%]" style={{ background: "#9a5b34", boxShadow: "0 0 0 2px #2a2342", animation: "crown 0.6s steps(2) infinite" }} />
      {/* chorros */}
      <div className="absolute left-1/2 top-[86px]">
        {drops.map((d, i) => (
          <Arc key={i} dx={d.dx} h={d.h} dur={d.dur} delay={d.delay}>
            <span className="block" style={{ width: d.s, height: d.s, background: i % 2 ? "#7a3f22" : "#9a5b34", boxShadow: "0 0 0 2px #2a2342" }} />
          </Arc>
        ))}
      </div>
      {/* vapor */}
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="absolute block rounded-[3px] bg-white/80"
          style={{ left: 110 + i * 22, top: 120, width: 12, height: 12, animation: `steam 3.2s ease-out ${i * 0.8}s infinite` }}
        />
      ))}
      {/* pileta */}
      <svg viewBox="0 0 60 30" className="pixelated absolute bottom-0 left-1/2 w-[260px] -translate-x-1/2" shapeRendering="crispEdges" aria-hidden>
        <rect x="24" y="0" width="12" height="14" fill="#2a2342" />
        <rect x="25" y="1" width="10" height="13" fill="#c48a5a" />
        <rect x="20" y="0" width="20" height="3" fill="#2a2342" />
        <rect x="21" y="1" width="18" height="2" fill="#7a3f22" />
        <rect x="2" y="12" width="56" height="18" fill="#2a2342" />
        <rect x="3" y="13" width="54" height="16" fill="#d9a06c" />
        <rect x="3" y="13" width="54" height="4" fill="#7a3f22" />
        <rect x="6" y="14" width="12" height="1" fill="#b06a3a" />
        <rect x="30" y="15" width="16" height="1" fill="#b06a3a" />
        <rect x="3" y="17" width="54" height="2" fill="#f4f8ff" />
        <rect x="8" y="21" width="4" height="4" fill="#c48a5a" />
        <rect x="28" y="21" width="4" height="4" fill="#c48a5a" />
        <rect x="48" y="21" width="4" height="4" fill="#c48a5a" />
      </svg>
      {/* tazas */}
      {[0, 1].map((i) => (
        <span key={i} className="absolute bottom-1 text-3xl" style={{ left: i ? 262 : -6, animation: `bob 1.6s steps(2) ${i * 0.4}s infinite` }}>
          ☕
        </span>
      ))}
    </div>
  );
}

function Walkers({ count = 3 }: { count?: number }) {
  return (
    <div className="pointer-events-none relative mx-auto mt-1 h-10 max-w-md [container-type:inline-size]">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="absolute bottom-0 left-0 block"
          style={{ animation: `walk-across ${16 + i * 5}s linear ${-i * 6}s infinite` }}
        >
          <span className="block" style={{ animation: "walk-bob 0.36s steps(2) infinite" }}>
            <PixelAgent colors={AGENT_PALETTES[(i + 2) % AGENT_PALETTES.length]} size={26} />
          </span>
        </span>
      ))}
    </div>
  );
}

/* ---------------- Pista de hielo ---------------- */
const RINK_PATH = "path('M44,96 A116,34 0 1,1 276,96 A116,34 0 1,1 44,96')";

function Rink() {
  return (
    <div className="relative mx-auto h-[180px] w-[320px]">
      <svg viewBox="0 0 320 180" className="absolute inset-0" aria-hidden>
        <ellipse cx="160" cy="92" rx="150" ry="62" fill="#2a2342" />
        <ellipse cx="160" cy="88" rx="146" ry="58" fill="#e8f6ff" />
        <ellipse cx="160" cy="88" rx="132" ry="48" fill="#cdeeff" />
        <ellipse cx="120" cy="74" rx="40" ry="8" fill="#ffffff" opacity=".7" />
        <ellipse cx="210" cy="100" rx="30" ry="5" fill="#ffffff" opacity=".6" />
      </svg>
      {/* brillo que recorre el hielo */}
      <div
        aria-hidden
        className="absolute left-[10px] top-[30px] h-[116px] w-[300px] overflow-hidden rounded-[50%]"
      >
        <div className="absolute inset-y-0 w-16 bg-white/50" style={{ animation: "ice-shine 4s ease-in-out infinite", transform: "skewX(-20deg)" }} />
      </div>
      {AGENT_PALETTES.slice(0, 5).map((c, i) => (
        <span
          key={i}
          className="absolute left-0 top-0 block"
          style={{
            offsetPath: RINK_PATH,
            offsetRotate: "0deg",
            animation: `skate ${9 + (i % 2) * 2}s linear ${-i * 2}s infinite`,
          }}
        >
          <span className="block -translate-y-[85%]" style={{ animation: "skate-lean 0.9s ease-in-out infinite" }}>
            <PixelAgent colors={c} size={24} flip={i % 2 === 1} />
          </span>
        </span>
      ))}
      {/* banderines */}
      <svg viewBox="0 0 320 30" className="absolute inset-x-0 top-0" aria-hidden>
        <path d="M0,6 Q160,30 320,6" stroke="#2a2342" strokeWidth="2" fill="none" />
        {Array.from({ length: 13 }, (_, i) => {
          const x = 12 + i * 24;
          const y = Math.round(6 + Math.sin((x / 320) * Math.PI) * 11);
          return (
            <polygon
              key={i}
              points={`${x - 7},${y} ${x + 7},${y} ${x},${y + 12}`}
              fill={["#e2445c", "#f6b93b", "#2e9e78", "#b9a7f5"][i % 4]}
              stroke="#2a2342"
              strokeWidth="1.5"
              style={{ transformOrigin: `${x}px ${y}px`, animation: `flag 1.6s ease-in-out ${i * 0.12}s infinite` }}
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------- Oficina de Inteligencia ---------------- */
function Intel() {
  return (
    <div className="relative mx-auto h-[210px] w-[320px]">
      {/* reflectores */}
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden
          className="absolute bottom-6"
          style={{
            left: i ? 250 : 40,
            width: 0,
            height: 0,
            animation: `search ${6 + i}s ease-in-out ${i * -2}s infinite`,
            transformOrigin: "0 0",
          }}
        >
          <div
            className="absolute bottom-0 left-[-60px] h-[220px] w-[120px]"
            style={{
              background: "linear-gradient(0deg, rgb(255 230 150 / .55), rgb(255 230 150 / 0))",
              clipPath: "polygon(45% 100%, 55% 100%, 100% 0, 0 0)",
            }}
          />
        </div>
      ))}
      {/* cartas volando */}
      <div className="absolute bottom-[70px] left-[60px]">
        {[0, 1, 2, 3].map((i) => (
          <Arc key={i} dx={150 + i * 10} h={90 + i * 12} dur={3.6} delay={-i * 0.9}>
            <span className="block" style={{ animation: "spin-slow 1.8s steps(8) infinite" }}>
              <PixelIcon name="friend" size={26} />
            </span>
          </Arc>
        ))}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2" style={{ animation: "breathe 1.8s steps(2) infinite" }}>
        <Sprite id="buzon" h={120} />
      </div>
      <div className="absolute bottom-2 left-[38px]" style={{ animation: "peek 5s ease-in-out infinite" }}>
        <Sprite id="mascota" h={70} style={{ filter: "brightness(0.25) saturate(0)" }} />
      </div>
      {/* sello */}
      <span className="stamp absolute right-2 top-6 font-pixel text-xl">CONFIDENCIAL</span>
    </div>
  );
}

/* ---------------- Bóveda del Pozo ---------------- */
function Vault() {
  return (
    <div className="relative mx-auto h-[210px] w-[320px]">
      <div className="absolute bottom-[86px] left-[70%]">
        {Array.from({ length: 10 }, (_, i) => (
          <Arc key={i} dx={((i % 5) - 2) * 34} h={80 + (i % 3) * 20} dur={1.6 + (i % 3) * 0.2} delay={-i * 0.21}>
            <span className="block" style={{ animation: "spin-slow 0.8s steps(4) infinite" }}>
              <PixelIcon name="coin" size={18} />
            </span>
          </Arc>
        ))}
      </div>
      <div className="absolute bottom-2 left-[70%] -translate-x-1/2" style={{ animation: "breathe 1.2s steps(2) infinite" }}>
        <Sprite id="cofre" h={110} />
      </div>
      {/* podio */}
      {[
        { l: 6, h: 44, c: "#c9d6f0", n: "2", a: 1 },
        { l: 52, h: 60, c: "#f6b93b", n: "1", a: 0 },
        { l: 98, h: 32, c: "#d9a06c", n: "3", a: 2 },
      ].map((p, i) => (
        <div key={i} className="absolute bottom-2 w-[46px]" style={{ left: p.l }}>
          <div className="mx-auto mb-0.5 w-fit" style={{ animation: `hop 2.4s ease-in-out ${i * 0.5}s infinite` }}>
            <PixelAgent colors={AGENT_PALETTES[p.a]} size={22} />
          </div>
          <div className="flex items-start justify-center font-pixel text-sm" style={{ height: p.h, background: p.c, boxShadow: "0 0 0 2px #2a2342" }}>
            {p.n}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Galería del Tendedero ---------------- */
const PHOTO_TINTS = ["#ffb3c7", "#9fe3cf", "#8fd3ff", "#f6b93b", "#b9a7f5"];
const PHOTO_ICONS = ["🍎", "🧣", "🎈", "🍓", "🧤"];

function Gallery() {
  return (
    <div className="relative mx-auto h-[220px] w-[320px]">
      {/* flash de cámara */}
      <div aria-hidden className="pointer-events-none absolute inset-[-20px] rounded-[40%] bg-white" style={{ animation: "flash 3.6s ease-out infinite" }} />
      {/* cuerda */}
      <svg viewBox="0 0 320 60" className="absolute inset-x-0 top-0" aria-hidden>
        <path d="M0,10 Q160,52 320,10" stroke="#2a2342" strokeWidth="2" fill="none" />
      </svg>
      {PHOTO_TINTS.map((c, i) => {
        const x = 24 + i * 62;
        const y = Math.round(10 + Math.sin(((x + 18) / 320) * Math.PI) * 20);
        return (
          <div
            key={i}
            className="absolute"
            style={{ left: x, top: y, transformOrigin: "50% 0", animation: `swing ${2.4 + (i % 3) * 0.4}s ease-in-out ${-i * 0.5}s infinite` }}
          >
            <span className="mx-auto block h-2 w-1.5 bg-[#c48a5a]" style={{ boxShadow: "0 0 0 1px #2a2342" }} />
            <div className="w-[44px] bg-white p-1 pb-3" style={{ boxShadow: "0 0 0 2px #2a2342, 3px 4px 0 0 rgb(42 35 66 / .5)" }}>
              <div className="flex h-[34px] items-center justify-center text-lg" style={{ background: c }}>
                {PHOTO_ICONS[i]}
              </div>
            </div>
          </div>
        );
      })}
      {/* cámara en trípode */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <svg viewBox="0 0 30 30" width="96" height="96" shapeRendering="crispEdges" aria-hidden>
          <rect x="4" y="6" width="22" height="13" fill="#2a2342" />
          <rect x="5" y="7" width="20" height="11" fill="#5d5677" />
          <rect x="11" y="8" width="9" height="9" fill="#2a2342" />
          <rect x="12" y="9" width="7" height="7" fill="#8fd3ff" />
          <rect x="13" y="10" width="2" height="2" fill="#fff" />
          <rect x="6" y="4" width="6" height="3" fill="#2a2342" />
          <rect x="7" y="5" width="4" height="2" fill="#e2445c" />
          <rect x="14" y="19" width="2" height="11" fill="#2a2342" />
          <rect x="9" y="26" width="2" height="4" fill="#2a2342" />
          <rect x="19" y="26" width="2" height="4" fill="#2a2342" />
          <rect x="10" y="24" width="10" height="2" fill="#2a2342" />
        </svg>
      </div>
      {/* emojis que suben */}
      {["😂", "🎄", "🔥", "😍", "👀"].map((e, i) => (
        <span key={i} aria-hidden className="absolute bottom-10 text-2xl" style={{ left: 30 + i * 60, animation: `emoji-rise 4.5s ease-out ${i * 0.9}s infinite` }}>
          {e}
        </span>
      ))}
    </div>
  );
}

/* ---------------- Mirador de las Semanales ---------------- */
function Lookout() {
  return (
    <div className="relative mx-auto h-[230px] w-[320px]">
      {/* torre del reloj */}
      <div className="absolute bottom-0 left-1/2 h-[210px] w-[120px] -translate-x-1/2">
        <svg viewBox="0 0 40 70" width="120" height="210" shapeRendering="crispEdges" aria-hidden>
          <rect x="8" y="2" width="24" height="6" fill="#2a2342" />
          <rect x="10" y="0" width="20" height="4" fill="#2a2342" />
          <rect x="11" y="1" width="18" height="3" fill="#e2445c" />
          <rect x="9" y="3" width="22" height="4" fill="#f4f8ff" />
          <rect x="6" y="8" width="28" height="62" fill="#2a2342" />
          <rect x="7" y="9" width="26" height="60" fill="#c48a5a" />
          <rect x="7" y="9" width="26" height="3" fill="#d9a06c" />
          <rect x="9" y="14" width="22" height="22" fill="#2a2342" />
          <rect x="10" y="15" width="20" height="20" fill="#fff6e5" />
          <rect x="19" y="16" width="2" height="2" fill="#2a2342" />
          <rect x="19" y="32" width="2" height="2" fill="#2a2342" />
          <rect x="11" y="24" width="2" height="2" fill="#2a2342" />
          <rect x="27" y="24" width="2" height="2" fill="#2a2342" />
          <rect x="12" y="40" width="16" height="22" fill="#2a2342" />
          <rect x="13" y="41" width="14" height="20" fill="#3b3560" />
          <rect x="16" y="62" width="8" height="8" fill="#8a4b2c" />
        </svg>
        {/* agujas */}
        <span className="absolute block origin-bottom bg-[#2a2342]" style={{ left: 58, top: 50, width: 4, height: 26, animation: "spin-slow 6s linear infinite" }} />
        <span className="absolute block origin-bottom bg-[#e2445c]" style={{ left: 58, top: 60, width: 4, height: 16, animation: "spin-slow 60s linear infinite" }} />
        {/* péndulo */}
        <span className="absolute block origin-top" style={{ left: 59, top: 123, width: 2, height: 46, background: "#f6b93b", animation: "pendulum 1.6s ease-in-out infinite" }}>
          <span className="absolute -bottom-2 -left-[7px] block h-4 w-4 rounded-full bg-[#f6b93b]" style={{ boxShadow: "0 0 0 2px #2a2342" }} />
        </span>
      </div>
      {/* duelo de bolas de nieve */}
      <div className="absolute bottom-0 left-2" style={{ animation: "walk-bob 0.6s steps(2) infinite" }}>
        <PixelAgent colors={AGENT_PALETTES[0]} size={30} />
      </div>
      <div className="absolute bottom-0 right-2" style={{ animation: "walk-bob 0.6s steps(2) 0.3s infinite" }}>
        <PixelAgent colors={AGENT_PALETTES[2]} size={30} flip />
      </div>
      <div className="absolute bottom-[32px] left-[38px]">
        <Arc dx={238} h={70} dur={1.8} delay={0}>
          <span className="block h-3 w-3 rounded-[3px] bg-white" style={{ boxShadow: "0 0 0 2px #2a2342" }} />
        </Arc>
      </div>
      <div className="absolute bottom-[32px] right-[38px]">
        <Arc dx={-238} h={90} dur={1.8} delay={-0.9}>
          <span className="block h-3 w-3 rounded-[3px] bg-white" style={{ boxShadow: "0 0 0 2px #2a2342" }} />
        </Arc>
      </div>
      {/* cumplidos volando */}
      {[0, 1, 2].map((i) => (
        <span key={i} aria-hidden className="absolute top-6 text-xl" style={{ left: 20 + i * 110, animation: `float-fly ${5 + i}s ease-in-out ${-i}s infinite` }}>
          💌
        </span>
      ))}
    </div>
  );
}

/* ---------------- Callejón del Traidor ---------------- */
function Alley() {
  return (
    <div className="relative mx-auto h-[220px] w-[320px] overflow-hidden">
      {/* carteles SE BUSCA */}
      {[0, 1].map((i) => (
        <div
          key={i}
          className="absolute top-4 w-[66px] bg-[#fbe9c9] px-1 pb-1 pt-0.5 text-center font-pixel text-[9px] text-[#2a2342]"
          style={{ left: i ? 236 : 18, boxShadow: "0 0 0 2px #2a2342", transformOrigin: "50% 0", animation: `swing ${3 + i}s ease-in-out ${-i}s infinite` }}
        >
          SE BUSCA
          <div className="mx-auto my-1 flex h-[40px] items-center justify-center bg-[#2a2342] text-2xl text-white">?</div>
          traidor
        </div>
      ))}
      {/* láseres */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="absolute left-1/2 top-[-40px] block h-[300px] w-[2px] origin-top"
          style={{
            background: "linear-gradient(#ff3b5c, rgb(255 59 92 / .2))",
            boxShadow: "0 0 8px 2px rgb(255 59 92 / .6)",
            animation: `laser ${3 + i * 0.7}s ease-in-out ${-i * 1.1}s infinite`,
          }}
        />
      ))}
      {/* huellas */}
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute block h-2 w-3 rounded-full bg-white/60"
          style={{ left: 60 + i * 34, bottom: 18 + (i % 2) * 10, animation: `footprint 3.6s steps(1) ${i * 0.45}s infinite` }}
        />
      ))}
      {/* periscopio */}
      <div className="absolute bottom-0 left-[139px]" style={{ animation: "periscope 4.4s ease-in-out infinite" }}>
        <svg viewBox="0 0 14 40" width="42" height="120" shapeRendering="crispEdges" aria-hidden>
          <rect x="5" y="6" width="4" height="34" fill="#2a2342" />
          <rect x="6" y="6" width="2" height="34" fill="#5d5677" />
          <rect x="0" y="0" width="12" height="8" fill="#2a2342" />
          <rect x="1" y="1" width="10" height="6" fill="#5d5677" />
          <rect x="1" y="2" width="4" height="4" fill="#8fd3ff" />
        </svg>
      </div>
    </div>
  );
}

/* ---------------- Salón de la Fama ---------------- */
function Hall() {
  const doors = Array.from({ length: 8 }, (_, i) => i + 1);
  return (
    <div className="relative mx-auto h-[230px] w-[320px] overflow-hidden">
      {/* reflectores */}
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden
          className="absolute bottom-0"
          style={{ left: i ? 290 : 30, width: 0, height: 0, transformOrigin: "0 0", animation: `search ${5 + i}s ease-in-out ${-i * 2}s infinite` }}
        >
          <div
            className="absolute bottom-0 left-[-50px] h-[240px] w-[100px]"
            style={{ background: "linear-gradient(0deg, rgb(255 255 255 / .55), transparent)", clipPath: "polygon(45% 100%, 55% 100%, 100% 0, 0 0)" }}
          />
        </div>
      ))}
      {/* repisa con medallas */}
      <div className="absolute inset-x-0 top-6 flex justify-center gap-3">
        {["🏅", "🥇", "🕵️", "📸", "🌅", "😎"].map((m, i) => (
          <span
            key={i}
            className="relative text-2xl"
            style={{ animation: `bob 1.4s steps(2) ${i * 0.2}s infinite`, opacity: i < 3 ? 1 : 0.35, filter: i < 3 ? undefined : "grayscale(1)" }}
          >
            {m}
            {i < 3 && <span className="sparkle" style={{ left: "70%", top: "-10%", animationDelay: `${i * 0.5}s` }} />}
          </span>
        ))}
      </div>
      <div className="absolute left-[30px] top-[62px] h-2 w-[260px] bg-[#9a5b34]" style={{ boxShadow: "0 0 0 2px #2a2342" }} />
      {/* calendario de adviento */}
      <div className="absolute inset-x-0 bottom-3 flex justify-center">
        <div className="grid grid-cols-4 gap-1.5 bg-[#2e9e78] p-2" style={{ boxShadow: "0 0 0 2px #2a2342" }}>
          {doors.map((d) => (
            <div key={d} className="relative h-[30px] w-[34px] bg-[#fff6e5] font-pixel text-[11px]" style={{ boxShadow: "0 0 0 2px #2a2342", perspective: 200 }}>
              <span className="absolute inset-0 flex items-center justify-center text-base">{d <= 3 ? "🎁" : ""}</span>
              <span
                className="absolute inset-0 flex origin-left items-center justify-center"
                style={{
                  background: d <= 3 ? "#e2445c" : "#f6b93b",
                  color: "#fff6e5",
                  transform: d < 3 ? "rotateY(-75deg)" : undefined,
                  animation: d === 3 ? "door 3s ease-in-out infinite" : undefined,
                }}
              >
                {d}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* confeti */}
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute top-0 block h-2 w-1.5"
          style={{
            left: `${(i * 23) % 100}%`,
            background: ["#e2445c", "#f6b93b", "#2e9e78", "#b9a7f5", "#57b9f0"][i % 5],
            animation: `confetti ${3 + (i % 4) * 0.6}s linear ${-i * 0.4}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Cueva del Ogro Panetonero ---------------- */
function OgreCave() {
  return (
    <div className="relative mx-auto h-[236px] w-[320px] overflow-hidden">
      {/* cueva */}
      <div
        aria-hidden
        className="absolute bottom-0 left-[14px] h-[200px] w-[292px]"
        style={{
          background: "radial-gradient(70% 80% at 50% 100%, #3b3560 0%, #1d1838 70%)",
          borderRadius: "146px 146px 0 0",
          boxShadow: "0 0 0 3px #2a2342, inset 0 0 0 12px #6b7392, inset 0 0 0 15px #2a2342",
        }}
      />
      {/* nieve sobre la cueva */}
      <div aria-hidden className="absolute left-[40px] top-[30px] h-[16px] w-[240px] rounded-[50%] bg-[#f4f8ff]" style={{ boxShadow: "0 0 0 3px #2a2342" }} />
      {/* carámbanos que tiemblan con los ronquidos */}
      {Array.from({ length: 7 }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute block bg-[#dff3ff]"
          style={{
            left: 66 + i * 30,
            top: 42,
            width: 10,
            height: 14 + (i % 3) * 6,
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            transformOrigin: "50% 0",
            animation: `icicle 2.4s ease-in-out ${i * 0.08}s infinite`,
          }}
        />
      ))}
      {/* regalos robados */}
      {["🎁", "🎁", "🎁", "🍞", "🎁"].map((g, i) => (
        <span key={i} aria-hidden className="absolute bottom-1 text-2xl" style={{ left: 196 + (i % 3) * 22, bottom: 4 + Math.floor(i / 3) * 22 }}>
          {g}
        </span>
      ))}
      {/* el ogro */}
      <div className="absolute bottom-0 left-[82px]" style={{ animation: "snore 2.4s ease-in-out infinite", transformOrigin: "50% 100%" }}>
        <Ogre size={150} />
      </div>
      {/* Zzz */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="absolute font-pixel font-bold text-white"
          style={{ left: 196, top: 72, fontSize: 14 + i * 5, animation: `zzz 2.4s ease-out ${i * 0.8}s infinite`, textShadow: "0 2px 0 #2a2342" }}
        >
          Z
        </span>
      ))}
      {/* agente que avanza de puntillas y huye cuando el ogro abre los ojos */}
      <div className="absolute bottom-0 left-[16px]" style={{ animation: "sneak 6s linear infinite" }}>
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 font-pixel text-xl text-[var(--cherry)]" style={{ animation: "alert 6s steps(1) infinite", textShadow: "0 2px 0 #fff" }}>
          !
        </span>
        <div style={{ animation: "walk-bob 0.5s steps(2) infinite" }}>
          <PixelAgent colors={AGENT_PALETTES[3]} size={28} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Taller del Muñeco Gigante (colaborativo) ---------------- */
function Workshop() {
  return (
    <div className="relative mx-auto h-[230px] w-[320px] overflow-hidden">
      {/* muñeco que se arma entre todos */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <Snowman size={130} build />
      </div>
      <span className="sparkle" style={{ left: "38%", top: "12%" }} />
      <span className="sparkle" style={{ left: "62%", top: "24%", animationDelay: "0.7s" }} />
      {/* agentes rodando bolas de nieve hacia el centro */}
      {[
        { side: "left", anim: "roll-right", c: AGENT_PALETTES[1], d: 0 },
        { side: "right", anim: "roll-left", c: AGENT_PALETTES[4], d: -2 },
      ].map((r, i) => (
        <div
          key={i}
          className="absolute bottom-0 flex items-end gap-0.5"
          style={{
            [r.side]: 0,
            flexDirection: r.side === "left" ? "row" : "row-reverse",
            animation: `${r.anim} 4s ease-in ${r.d}s infinite`,
          }}
        >
          <div style={{ animation: "walk-bob 0.4s steps(2) infinite" }}>
            <PixelAgent colors={r.c} size={26} flip={r.side === "right"} />
          </div>
          <span
            className="block rounded-full bg-[#f4f8ff]"
            style={{ width: 22, height: 22, boxShadow: "0 0 0 2px #2a2342, inset -4px -4px 0 #c9d6f0", animation: `ball-grow 4s ease-in ${r.d}s infinite`, transformOrigin: "50% 100%" }}
          />
        </div>
      ))}
      {/* corazones de trabajo en equipo */}
      {[0, 1, 2].map((i) => (
        <span key={i} aria-hidden className="absolute text-lg" style={{ left: 70 + i * 80, bottom: 60, animation: `emoji-rise 3.6s ease-out ${i * 1.2}s infinite` }}>
          {["💛", "🤝", "💙"][i]}
        </span>
      ))}
    </div>
  );
}

export function Scene({ id }: { id: SceneId }) {
  switch (id) {
    case "chocolatada":
      return (
        <div className="relative">
          <Fountain />
          <Walkers />
        </div>
      );
    case "pista":
      return (
        <div className="relative">
          <Rink />
          <Walkers count={2} />
        </div>
      );
    case "galeria":
      return <Gallery />;
    case "mirador":
      return <Lookout />;
    case "inteligencia":
      return <Intel />;
    case "callejon":
      return <Alley />;
    case "ogro":
      return <OgreCave />;
    case "taller":
      return <Workshop />;
    case "salon":
      return <Hall />;
    case "boveda":
      return <Vault />;
  }
}
