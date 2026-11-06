"use client";

import { useEffect, useState } from "react";
import { NpcSprite } from "@/components/rpg/PixelSprite";
import { Retrato } from "@/components/rpg/Retrato";
import { NPCS, type NpcId } from "@/features/contenido/npcs";

export interface LineaNpc {
  npc: NpcId;
  texto: string;
}

/** Caja de diálogo estilo RPG: el texto aparece letra por letra; tocar avanza. */
export function DialogoNpc({ lineas }: { lineas: LineaNpc[] }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const linea = lineas[i % lineas.length];
  const npc = NPCS[linea.npc];
  const completo = n >= linea.texto.length;

  useEffect(() => {
    if (completo) return;
    const reducido = document.documentElement.dataset.ligero === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setN((v) => (reducido ? linea.texto.length : v + 2)), reducido ? 0 : 28);
    return () => window.clearTimeout(t);
  }, [n, completo, linea.texto.length]);

  const avanzar = () => {
    if (!completo) return setN(linea.texto.length);
    setI((v) => v + 1);
    setN(0);
  };

  return (
    <div className="relative">
      <div className="flex items-end gap-1 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Personajes de Snowville">
        {lineas.map((l, k) => (
          <button
            key={l.npc}
            type="button"
            role="tab"
            aria-selected={k === i % lineas.length}
            aria-label={NPCS[l.npc].nombre}
            onClick={() => {
              setI(k);
              setN(0);
            }}
            className="shrink-0 px-1 transition-transform"
            style={{ transform: k === i % lineas.length ? "translateY(-6px) scale(1.08)" : "scale(0.86)", opacity: k === i % lineas.length ? 1 : 0.7 }}
          >
            <span className={k === i % lineas.length ? "anim-bob block" : "block"}>
              <NpcSprite id={l.npc} size={k === i % lineas.length ? 74 : 50} />
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={avanzar}
        className="px-box mt-1 block w-full px-4 pb-3 pt-2 text-left"
        style={{ ["--bg" as string]: "#1b1f4a", color: "var(--cream)" }}
        aria-live="polite"
      >
        <span className="float-left mr-3 mt-1 overflow-hidden" style={{ boxShadow: "0 0 0 3px var(--gold)", background: npc.color }} aria-hidden>
          <Retrato npc={linea.npc} size={76} />
        </span>
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-pixel text-[1.05rem]" style={{ color: "var(--gold)" }}>
            {npc.nombre}
          </span>
          <span className="truncate text-[0.68rem] opacity-70">{npc.cargo}</span>
        </span>
        <span className="mt-1 block min-h-[3.2em] text-[0.95rem] leading-snug">
          {linea.texto.slice(0, n)}
          <span className="sr-only">{linea.texto.slice(n)}</span>
        </span>
        <span className="clear-both mt-1 block text-right font-pixel text-[0.75rem]" style={{ animation: completo ? "bob 0.9s steps(2) infinite" : undefined, opacity: completo ? 1 : 0 }}>
          ▼ toca para seguir
        </span>
      </button>
    </div>
  );
}
