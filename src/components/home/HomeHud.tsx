"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useAtmosphere } from "@/components/atmosphere/AtmosphereProvider";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { mockChallenge, mockGroup } from "@/lib/mock";
import { formatMinute } from "@/lib/atmosphere";
import { SPRITES } from "@/lib/assets/manifest";
import { MODULES } from "@/lib/modules";
import type { Yo } from "./useYo";

const noop = () => () => {};

function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

function timeLeft(minuteNow: number) {
  const left = Math.max(0, 1439 - minuteNow);
  const h = Math.floor(left / 60);
  const m = Math.floor(left % 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
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

/** Cabecera: agente, puntos, fase del día y cuenta regresiva. */
export function HomeHeader({ compact = false, yo }: { compact?: boolean; yo: Yo }) {
  const { atmosphere } = useAtmosphere();
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  const days = isClient ? daysUntil(mockGroup.giftDate) : null;
  const agente = yo.agente;
  const points = useCountUp(agente?.points ?? 0);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-1.5 px-4" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
      <header className="flex items-center justify-between gap-2">
        {agente ? (
          <div className="px-box flex min-w-0 items-center gap-2 py-1 pl-1 pr-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--lavender)] text-xl" aria-hidden>
              {agente.avatar}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-pixel text-[0.95rem]">{agente.codename}</span>
              <span className="block truncate text-[0.72rem] text-[var(--ink-soft)]">
                {agente.status === "approved"
                  ? `Puesto #${agente.rank ?? "–"} de ${agente.agentes}`
                  : agente.status === "pending"
                    ? "⏳ Esperando aprobación"
                    : "Ingreso rechazado"}
              </span>
            </span>
            {agente.role === "organizer" && (
              <Link href="/panel" className="px-chip ml-1 !text-[0.66rem]" style={{ ["--chip" as string]: "var(--gold)" }}>
                Panel
              </Link>
            )}
          </div>
        ) : (
          <div className="px-box flex items-center gap-2 py-1 pl-1 pr-3">
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden bg-[var(--lavender)]" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/sprites/mascota.png" alt="" className="pixelated h-[130%] w-auto translate-y-[18%]" />
            </span>
            <span className="leading-tight">
              <span className="block font-pixel text-[0.95rem]">{yo.cargando ? "Cargando…" : "Agente invitado"}</span>
              <span className="block text-[0.72rem] text-[var(--ink-soft)]">{yo.cargando ? "\u00a0" : "Paseando por la aldea"}</span>
            </span>
          </div>
        )}
        {agente ? (
          <div className="px-box shine flex items-center gap-1.5 px-3 py-2" style={{ ["--bg" as string]: "var(--gold)", ["--shine-delay" as string]: "2.4s" }}>
            <PixelIcon name="coin" size={20} />
            <span className="font-pixel text-lg tabular-nums">{points}</span>
          </div>
        ) : (
          !yo.cargando && (
            <Link href="/entrar" className="px-btn !min-h-[44px] !px-3 !text-[0.9rem]" style={{ ["--bg" as string]: "var(--gold)" }}>
              Entrar
            </Link>
          )
        )}
      </header>
      <div
        className="flex items-center justify-between px-1 font-pixel text-[0.8rem] transition-opacity duration-300"
        style={{ color: "var(--on-sky)", textShadow: "0 2px 0 rgb(0 0 0 / .2)", opacity: compact ? 0 : 1, pointerEvents: compact ? "none" : undefined }}
      >
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("time-machine"))}
          className="flex items-center gap-1 rounded-sm px-1 py-0.5 hover:bg-white/10"
          aria-label={`${atmosphere.label}, ${formatMinute(atmosphere.minute)}. Abrir máquina del tiempo`}
        >
          {atmosphere.emoji} {atmosphere.label}
          <span className="opacity-70">· {formatMinute(atmosphere.minute)}</span>
        </button>
        <span>{days === null ? "" : `🎁 ${days} días`}</span>
      </div>
    </div>
  );
}

/** Píldora compacta con la misión de hoy (no tapa la aldea). */
export function MissionPill({ yo }: { yo: Yo }) {
  const { atmosphere } = useAtmosphere();
  const icon = SPRITES["muro-fotos"];
  const agente = yo.agente;
  return (
    <div className="mx-auto w-full max-w-md px-4">
      {/* Pestaña: baja a las zonas de juegos */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("abrir-guia"))}
          className="px-chip -mb-1 !px-3 !py-1 !text-[0.72rem]"
          style={{ ["--chip" as string]: "var(--gold)" }}
        >
          📖 ¿Cómo se juega?
        </button>
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("zona-chocolatada");
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
          }}
          className="px-chip -mb-1 gap-1.5 !px-3 !py-1 !text-[0.72rem]"
          style={{ ["--chip" as string]: "var(--ink)", color: "var(--cream)" }}
        >
          <span className="scroll-cue">▼</span> {MODULES.length} zonas
        </button>
      </div>
      {!yo.cargando && !agente && (
        <div className="px-box flex items-center gap-3 py-2 pl-3 pr-2">
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block font-pixel text-[1rem]">¿Te invitaron a jugar?</span>
            <span className="block text-[0.74rem] text-[var(--ink-soft)]">Abre el enlace que te mandaron por WhatsApp.</span>
          </span>
          <Link href="/crear" className="px-btn !min-h-[44px] !px-3 !text-[0.85rem]" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
            Crear grupo
          </Link>
        </div>
      )}
      {agente && agente.status !== "approved" && (
        <div className="px-box flex items-center gap-3 py-2 pl-3 pr-3" style={{ ["--bg" as string]: "var(--mint)" }}>
          <span className="text-2xl" aria-hidden>
            ⏳
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block font-pixel text-[1rem]">{agente.status === "pending" ? "Esperando aprobación" : "Ingreso rechazado"}</span>
            <span className="block truncate text-[0.74rem]">
              {agente.status === "pending" ? `El organizador de ${agente.groupName} debe aprobarte.` : "Habla con el organizador del grupo."}
            </span>
          </span>
        </div>
      )}
      {agente?.status === "approved" && (
      <div className="px-box flex items-center gap-3 py-2 pl-2 pr-2">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--rose)]" aria-hidden>
          {icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon.src} alt="" className="pixelated h-10 w-auto" style={{ animation: "bob 1.2s steps(2) infinite" }} />
          )}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[0.68rem] uppercase tracking-wide text-[var(--ink-soft)]">
            Misión de hoy · {mockGroup.completedToday}/{mockGroup.members} luces
          </span>
          <span className="block truncate font-pixel text-[1.05rem]">{mockChallenge.title}</span>
          <span className="flex items-center gap-1 text-[0.7rem] text-[var(--ink-soft)]">
            <PixelIcon name="clock" size={11} /> {timeLeft(atmosphere.minute)}
          </span>
        </span>
        <Link
          href="/reto"
          className="px-btn shine !min-h-[44px] !px-3 !text-[0.9rem]"
          style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}
        >
          ¡Vamos! +{mockChallenge.points}
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
    <span
      aria-hidden
      className="px-chip pointer-events-none fixed left-1/2 top-[44%] z-30"
      style={{ animation: "nudge 1.4s ease-in-out infinite", ["--chip" as string]: "rgb(255 246 229 / 0.92)" }}
    >
      ◀ desliza la aldea ▶
    </span>
  );
}
