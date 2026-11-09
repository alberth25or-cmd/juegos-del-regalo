"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/rpg/PixelSprite";
import { Retrato } from "@/components/rpg/Retrato";
import { HITOS, MENSAJE_HITO } from "@/features/social/energia";
import { api } from "@/lib/cliente/api";
import type { EstadoEnergia } from "@/lib/server/energia";

const LUCES = ["#ff5a7a", "#ffd23f", "#7ce0ff", "#b9f5a7", "#ffffff"];

/** Árbol pixel que se enciende según el porcentaje (luces + estrella al 100 %). */
function ArbolEnergia({ pct }: { pct: number }) {
  const filas = 9;
  const luces: { x: number; y: number; c: string; on: boolean }[] = [];
  let k = 0;
  for (let f = 1; f < filas; f++) {
    const ancho = 2 + f * 2;
    for (let x = 0; x < ancho; x += 2) {
      luces.push({ x: 50 - ancho * 2.6 + x * 5.2 + ((f % 2) * 2.6), y: 18 + f * 9, c: LUCES[k % LUCES.length], on: (k * 37) % 100 < pct });
      k++;
    }
  }
  return (
    <svg viewBox="0 0 100 110" className="pixelated mx-auto block w-full max-w-[240px]" shapeRendering="crispEdges" role="img" aria-label={`Árbol al ${pct} %`}>
      {Array.from({ length: filas }, (_, f) => {
        const ancho = 8 + f * 10;
        return <rect key={f} x={50 - ancho / 2} y={14 + f * 9} width={ancho} height={10} fill={f % 2 ? "#1f7a4d" : "#25915b"} stroke="#2a2342" strokeWidth={1.5} />;
      })}
      <rect x={44} y={95} width={12} height={12} fill="#7a4a2b" stroke="#2a2342" strokeWidth={1.5} />
      {luces.map((l, i) => (
        <rect key={i} x={l.x} y={l.y} width={3} height={3} fill={l.on ? l.c : "#14532d"} className={l.on ? "anim-twinkle" : undefined} style={{ animationDelay: `${(i % 7) * 0.2}s` }} />
      ))}
      <polygon points="50,2 53,9 60,9 54,13 56,20 50,16 44,20 46,13 40,9 47,9" fill={pct >= 100 ? "#ffd23f" : "#6b6f8a"} stroke="#2a2342" strokeWidth={1.2} className={pct >= 100 ? "anim-twinkle" : undefined} />
    </svg>
  );
}

/** Misión global: la energía de todos enciende el árbol de la plaza. */
export function Energia({ inicial }: { inicial: EstadoEnergia }) {
  const [e, setE] = useState(inicial);
  useEffect(() => {
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      const r = await api<{ energia: EstadoEnergia }>("/api/energia", { intentos: 1, tope: 8000 });
      if (r.ok) setE(r.energia);
    };
    const t = window.setInterval(tick, 15_000);
    return () => window.clearInterval(t);
  }, []);

  const falta = Math.max(0, e.meta - e.energia);
  const maxEq = Math.max(1, ...e.equipos.map((q) => q.energia));

  return (
    <div className="flex flex-col gap-4">
      <div className="px-box p-4 text-center" style={{ ["--bg" as string]: "#1b1f4a", color: "var(--cream)" }}>
        <ArbolEnergia pct={e.pct} />
        <p className="mt-2 font-pixel text-[2.4rem] leading-none text-[var(--gold)]" style={{ textShadow: "0 3px 0 #000" }}>
          {e.pct} %
        </p>
        <p className="mt-1 text-[0.9rem] opacity-90">
          {e.energia.toLocaleString("es-PE")} / {e.meta.toLocaleString("es-PE")} de energía
        </p>
        <div className="mx-auto mt-3 h-4 w-full max-w-sm bg-[#0e1234]" style={{ boxShadow: "0 0 0 2px var(--cream)" }}>
          <div className="h-full transition-[width] duration-700" style={{ width: `${e.pct}%`, background: "linear-gradient(90deg, #ff5a7a, #ffd23f, #7ce0ff)" }} />
        </div>
        <p className="mt-2 text-[0.85rem] opacity-80">{e.pct >= 100 ? "¡El árbol de Snowville está encendido!" : `Faltan ${falta.toLocaleString("es-PE")} para encender el árbol.`}</p>
      </div>

      <div className="flex items-start gap-2">
        <Retrato npc="duende" size={52} className="shrink-0" />
        <p className="px-box px-3 py-2 text-[0.9rem]" style={{ ["--bg" as string]: "var(--cream-2)" }}>
          Todas las monedas que ganan suman energía: Gift Catcher, Memory, la trivia y cada voto. Al 100 % Santa reparte <b>50 monedas a cada uno</b>. ¡Es trabajo en equipo, compañeros!
        </p>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-center">
        {HITOS.map((h) => {
          const ok = e.hitos.includes(h);
          return (
            <div key={h} className="px-box px-1 py-2" style={{ ["--bg" as string]: ok ? "var(--gold)" : "#fff" }} title={MENSAJE_HITO[h]}>
              <div className="font-pixel">{h}%</div>
              <div className="text-[0.7rem]">{ok ? "✓ logrado" : "pendiente"}</div>
            </div>
          );
        })}
      </div>

      {e.equipos.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-pixel">Aporte por equipo</p>
          {e.equipos.map((q) => (
            <div key={q.id} className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center" style={{ background: q.color, boxShadow: "0 0 0 2px var(--ink)" }}>
                {q.emblema}
              </span>
              <span className="w-24 truncate font-pixel text-[0.85rem]">{q.nombre}</span>
              <span className="h-3 flex-1 bg-white" style={{ boxShadow: "0 0 0 2px var(--ink)" }}>
                <span className="block h-full" style={{ width: `${(q.energia / maxEq) * 100}%`, background: q.color }} />
              </span>
              <span className="w-14 text-right font-pixel text-[0.85rem] tabular-nums">{q.energia}</span>
            </div>
          ))}
        </div>
      )}

      {e.top.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-pixel">Los que más energía dieron</p>
          <ol className="flex flex-col gap-1.5">
            {e.top.map((t, i) => (
              <li key={t.id} className="flex items-center gap-2">
                <span className="w-6 text-center font-pixel">{["🥇", "🥈", "🥉"][i] ?? i + 1}</span>
                <span className="flex h-9 w-8 items-end justify-center bg-[var(--sky)]">
                  <Avatar config={t.avatar} size={26} />
                </span>
                <span className="min-w-0 flex-1 truncate font-pixel text-[0.9rem]">{t.nombre}</span>
                <span className="font-pixel tabular-nums">⚡ {t.energia}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Link href="/arcade/gift-catcher" className="px-btn" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
          Gift Catcher
        </Link>
        <Link href="/arcade/memory" className="px-btn" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
          Memory Gifts
        </Link>
        <Link href="/arena/trivia" className="px-btn" style={{ ["--bg" as string]: "var(--gold)" }}>
          Trivia
        </Link>
        <Link href="/votacion" className="px-btn" style={{ ["--bg" as string]: "var(--gold)" }}>
          Votar
        </Link>
      </div>
    </div>
  );
}
