"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAtmosphere } from "@/components/atmosphere/AtmosphereProvider";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { Avatar, NpcSprite } from "@/components/rpg/PixelSprite";
import { formatMinute } from "@/lib/atmosphere";
import { MODULES } from "@/lib/modules";

export interface ResumenCabecera {
  nombre: string;
  avatar: unknown;
  nivel: number;
  puntos: number;
  rol: "player" | "admin";
  estado: "pending" | "active" | "inactive" | "rejected";
  puesto: number | null;
  total: number;
  diaTexto: string;
}

/** Contador que sube número por número al montar. */
function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function LineaHora({ derecha }: { derecha: string }) {
  const { atmosphere } = useAtmosphere();
  return (
    <div className="hud-linea flex items-center justify-between px-1 font-pixel text-[0.8rem]" style={{ color: "var(--on-sky)", textShadow: "0 2px 0 rgb(0 0 0 / .2)" }}>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("time-machine"))}
        className="flex items-center gap-1 rounded-sm px-1 py-0.5 hover:bg-white/10"
        aria-label={`${atmosphere.label}, ${formatMinute(atmosphere.minute)}. Abrir máquina del tiempo`}
      >
        {atmosphere.emoji} {atmosphere.label}
        <span className="opacity-70">· {formatMinute(atmosphere.minute)}</span>
      </button>
      <span>{derecha}</span>
    </div>
  );
}

/** Cabecera: jugador, nivel, puntos y día de temporada. */
export function Cabecera({ r }: { r: ResumenCabecera | null }) {
  const puntos = useCountUp(r?.puntos ?? 0);
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-1.5 px-4" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
      <header className="flex items-center justify-between gap-2">
        {r ? (
          <Link href="/perfil" className="px-box flex min-w-0 items-center gap-2 py-1 pl-1 pr-3">
            <span className="flex h-10 w-10 shrink-0 items-end justify-center overflow-hidden bg-[var(--sky)]" aria-hidden>
              <Avatar config={r.avatar} size={30} />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-pixel text-[0.95rem]">{r.nombre}</span>
              <span className="block truncate text-[0.72rem] text-[var(--ink-soft)]">
                {r.estado === "active" ? `Nivel ${r.nivel}${r.puesto ? ` · #${r.puesto} de ${r.total}` : ""}` : r.estado === "pending" ? "⏳ Esperando aprobación" : "Sin acceso"}
              </span>
            </span>
            {r.rol === "admin" && (
              <span className="px-chip ml-1 !text-[0.66rem]" style={{ ["--chip" as string]: "var(--gold)" }}>
                Admin
              </span>
            )}
          </Link>
        ) : (
          <div className="px-box flex items-center gap-2 py-1 pl-1 pr-3">
            <span className="flex h-10 w-10 items-end justify-center overflow-hidden bg-[var(--lavender)]" aria-hidden>
              <NpcSprite id="muneco" size={30} />
            </span>
            <span className="leading-tight">
              <span className="block font-pixel text-[0.95rem]">Visitante</span>
              <span className="block text-[0.72rem] text-[var(--ink-soft)]">Paseando por Snowville</span>
            </span>
          </div>
        )}
        {r ? (
          <Link href="/ranking" className="px-box shine flex items-center gap-1.5 px-3 py-2" style={{ ["--bg" as string]: "var(--gold)", ["--shine-delay" as string]: "2.4s" }} aria-label={`${r.puntos} puntos. Ver ranking`}>
            <PixelIcon name="coin" size={20} />
            <span className="font-pixel text-lg tabular-nums">{puntos}</span>
          </Link>
        ) : (
          <Link href="/entrar" className="px-btn !min-h-[44px] !px-3 !text-[0.9rem]" style={{ ["--bg" as string]: "var(--gold)" }}>
            Entrar
          </Link>
        )}
      </header>
      <LineaHora derecha={r?.diaTexto ?? "🎄 25 nov → 24 dic"} />
    </div>
  );
}

function Pestanas() {
  return (
    <div className="flex justify-center gap-2">
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("abrir-guia"))} className="px-chip -mb-1 !px-3 !py-1 !text-[0.72rem]" style={{ ["--chip" as string]: "var(--gold)" }}>
        📖 ¿Cómo se juega?
      </button>
      <button
        type="button"
        onClick={() => {
          const el = document.getElementById("plaza");
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
        }}
        className="px-chip -mb-1 gap-1.5 !px-3 !py-1 !text-[0.72rem]"
        style={{ ["--chip" as string]: "var(--ink)", color: "var(--cream)" }}
      >
        <span className="scroll-cue">▼</span> Plaza + {MODULES.length} zonas
      </button>
    </div>
  );
}

export type EstadoPildora =
  | { tipo: "visitante" }
  | { tipo: "pendiente"; temporada: string }
  | { tipo: "sinAcceso" }
  | { tipo: "activo"; titulo: string; detalle: string; puntosHoy: number; tope: number };

/** Píldora compacta con lo más importante para hacer ahora. */
export function Pildora({ e }: { e: EstadoPildora }) {
  return (
    <div className="mx-auto w-full max-w-md px-4">
      <Pestanas />
      {e.tipo === "visitante" && (
        <div className="px-box flex items-center gap-3 py-2 pl-3 pr-2">
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block font-pixel text-[1rem]">¿Te invitaron a jugar?</span>
            <span className="block text-[0.74rem] text-[var(--ink-soft)]">Abre el enlace que te mandaron por WhatsApp.</span>
          </span>
          <Link href="/crear" className="px-btn !min-h-[44px] !px-3 !text-[0.85rem]" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
            Crear temporada
          </Link>
        </div>
      )}
      {e.tipo === "pendiente" && (
        <div className="px-box flex items-center gap-3 py-2 pl-2 pr-3" style={{ ["--bg" as string]: "var(--mint)" }}>
          <NpcSprite id="duende" size={40} />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block font-pixel text-[1rem]">Esperando aprobación</span>
            <span className="block text-[0.74rem]">El organizador de {e.temporada} tiene que aprobarte. Mientras, puedes practicar.</span>
          </span>
        </div>
      )}
      {e.tipo === "sinAcceso" && (
        <div className="px-box px-3 py-2" style={{ ["--bg" as string]: "#f3c9d1" }}>
          <span className="font-pixel">Tu acceso está pausado.</span> <span className="text-[0.8rem]">Habla con el organizador.</span>
        </div>
      )}
      {e.tipo === "activo" && (
        <div className="px-box flex items-center gap-3 py-2 pl-2 pr-2">
          <span className="flex h-12 w-12 shrink-0 items-end justify-center bg-[var(--rose)]" aria-hidden>
            <span className="anim-bob">
              <NpcSprite id="santa" size={36} />
            </span>
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[0.68rem] uppercase tracking-wide text-[var(--ink-soft)]">{e.detalle}</span>
            <span className="block truncate font-pixel text-[1.05rem]">{e.titulo}</span>
            <span className="text-[0.7rem] text-[var(--ink-soft)]">
              Hoy: {e.puntosHoy}/{e.tope} pts
            </span>
          </span>
          <Link href="/arcade/gift-catcher" className="px-btn shine !min-h-[44px] !px-3 !text-[0.9rem]" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
            ¡Jugar!
          </Link>
        </div>
      )}
    </div>
  );
}

/** Pista "desliza" que desaparece al primer movimiento. */
export function SwipeHint() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const hide = () => setShow(false);
    const sc = document.querySelector(".no-scrollbar");
    sc?.addEventListener("scroll", hide, { once: true, passive: true });
    const t = window.setTimeout(hide, 8000);
    return () => {
      sc?.removeEventListener("scroll", hide);
      window.clearTimeout(t);
    };
  }, []);
  if (!show) return null;
  return (
    <span aria-hidden className="px-chip pointer-events-none fixed left-1/2 top-[44%] z-30" style={{ animation: "nudge 1.4s ease-in-out infinite", ["--chip" as string]: "rgb(255 246 229 / 0.92)" }}>
      ◀ desliza la aldea ▶
    </span>
  );
}
