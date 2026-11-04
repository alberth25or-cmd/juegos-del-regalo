"use client";

import { useEffect, useState } from "react";
import { formatMinute } from "@/lib/atmosphere";
import { useAtmosphere } from "./AtmosphereProvider";

/** Control para probar la atmósfera a cualquier hora (botón ⏱ arriba a la derecha). */
export function TimeMachine() {
  const { atmosphere, override, setOverride, cycling, setCycling } = useAtmosphere();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener("time-machine", toggle);
    return () => window.removeEventListener("time-machine", toggle);
  }, []);
  if (!open) return null;

  return (
    <div className="fixed right-2 z-50" style={{ top: "max(118px, calc(env(safe-area-inset-top) + 106px))" }}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-chip hidden opacity-80 hover:opacity-100"
          aria-label="Abrir máquina del tiempo"
        >
          ⏱ {formatMinute(atmosphere.minute)}
        </button>
      ) : (
        <div className="px-box w-64 p-3 text-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-pixel">Máquina del tiempo</span>
            <button type="button" onClick={() => setOpen(false)} className="font-pixel" aria-label="Cerrar">
              ✕
            </button>
          </div>
          <div className="mb-1 font-pixel text-xl tabular-nums">{formatMinute(atmosphere.minute)}</div>
          <input
            type="range"
            min={0}
            max={1439}
            value={Math.round(atmosphere.minute)}
            onChange={(e) => setOverride(Number(e.target.value))}
            className="w-full accent-[var(--cherry)]"
            aria-label="Hora del día"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {[
              ["Amanecer", 355],
              ["Día", 660],
              ["Atardecer", 1065],
              ["Noche", 1260],
            ].map(([l, m]) => (
              <button key={l} type="button" className="px-chip" onClick={() => setOverride(m as number)}>
                {l}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            <button type="button" className="px-chip" style={{ ["--chip" as string]: cycling ? "var(--gold)" : undefined }} onClick={() => setCycling(!cycling)}>
              {cycling ? "⏸ Pausar" : "▶ Día en 60 s"}
            </button>
            <button type="button" className="px-chip" disabled={override === null && !cycling} onClick={() => setOverride(null)}>
              Hora real
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
