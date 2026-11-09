"use client";

import { useEffect, useState } from "react";
import { avatarDeAlias } from "@/features/avatar";
import { Avatar } from "@/components/rpg/PixelSprite";
import { api } from "@/lib/cliente/api";
import type { FilaEquipo, FilaJugador } from "@/lib/server/consultas";

interface Datos {
  jugadores: FilaJugador[];
  equipos: FilaEquipo[];
  yo: string;
}

const MEDALLA = ["🥇", "🥈", "🥉"];

/** Ranking en vivo: se actualiza cada 20 s mientras la pantalla está visible. */
export function Ranking({ inicial }: { inicial: Datos }) {
  const [d, setD] = useState(inicial);
  const [tab, setTab] = useState<"individual" | "equipos">("individual");
  const [actualizado, setActualizado] = useState(false);

  useEffect(() => {
    let vivo = true;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      const r = await api<Datos>("/api/ranking", { intentos: 1, tope: 8000 });
      if (vivo && r.ok) {
        setD({ jugadores: r.jugadores, equipos: r.equipos, yo: r.yo });
        setActualizado(true);
        window.setTimeout(() => vivo && setActualizado(false), 1200);
      }
    };
    const t = window.setInterval(tick, 20_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      vivo = false;
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);


  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2" role="tablist">
        {(["individual", "equipos"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className="px-chip flex-1 justify-center !min-h-[40px] !text-[0.9rem]"
            style={{ ["--chip" as string]: tab === t ? "var(--gold)" : "#fff" }}
          >
            {t === "individual" ? "Individual" : "Equipos"}
          </button>
        ))}
      </div>
      <p className="px-hint" aria-live="polite">
        {actualizado ? "✓ Actualizado" : "Se actualiza solo cada 20 segundos."}
      </p>

      {tab === "individual" ? (
        d.jugadores.length === 0 ? (
          <p className="px-hint">Todavía no hay jugadores aprobados.</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {d.jugadores.map((j) => {
              const soyYo = j.id === d.yo;
              return (
                <li key={j.id} className="px-box flex items-center gap-2 px-2 py-1.5" style={{ ["--bg" as string]: soyYo ? "var(--cream-2)" : "#fff", margin: "2px 0" }}>
                  <span className="w-8 text-center font-pixel text-lg">{MEDALLA[j.rank - 1] ?? j.rank}</span>
                  <span className="flex h-10 w-9 shrink-0 items-end justify-center bg-[var(--sky)]">
                    <Avatar config={avatarDeAlias(j.alias ?? j.id)} size={28} />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate font-pixel">
                      {j.alias ?? "Agente sin alias"}
                      {soyYo ? " (tú)" : ""}
                    </span>
                    <span className="block truncate text-[0.72rem] text-[var(--ink-soft)]">
                      {"Anónimo: las monedas solo se ven con alias"}
                    </span>
                  </span>
                  <span className="font-pixel text-lg tabular-nums">🪙 {j.monedas}</span>
                </li>
              );
            })}
          </ol>
        )
      ) : (
        <>
          <ol className="flex flex-col gap-2">
            {d.equipos.map((e) => (
              <li key={e.id} className="px-box flex items-center gap-3 px-3 py-2" style={{ ["--bg" as string]: "#fff", margin: "2px 0" }}>
                <span className="w-7 text-center font-pixel text-lg">{MEDALLA[e.rank - 1] ?? e.rank}</span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center text-xl" style={{ background: e.color, boxShadow: "0 0 0 2px var(--ink)" }} aria-hidden>
                  {e.emblem}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate font-pixel">{e.name}</span>
                  <span className="block text-[0.72rem] text-[var(--ink-soft)]">
                    {e.integrantes} integrante(s) · {e.total} monedas en total
                  </span>
                </span>
                <span className="text-right leading-tight">
                  <span className="block font-pixel text-lg tabular-nums">{e.promedio}</span>
                  <span className="block text-[0.65rem] text-[var(--ink-soft)]">promedio</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="px-box px-3 py-2 text-[0.8rem]" style={{ ["--bg" as string]: "var(--cream-2)" }}>
            <b>Regla:</b> gana el equipo con mejor <b>promedio</b> de monedas por integrante activo, no la suma. Así cuenta cada persona, no quien juega más horas.
          </p>
        </>
      )}
    </div>
  );
}
