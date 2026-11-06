"use client";

import Link from "next/link";
import { Retrato } from "@/components/rpg/Retrato";

export interface ResultadoServidor {
  valida: boolean;
  motivo?: string;
  puntaje: number;
  mejorDelDia: number;
  record: number;
  xp: number;
  coins: number;
  puntos: number;
  puntosHoy: number;
  topeHoy: number;
  pretemporada: boolean;
  detalle?: Record<string, unknown>;
}

/** Bloque de resultado común a los juegos individuales (puntaje, premios y el Auditor). */
export function ResultadoJuego({
  r,
  resumen,
  comentario,
  onOtraVez,
  extra,
}: {
  r: ResultadoServidor | null;
  resumen?: React.ReactNode;
  comentario: string;
  onOtraVez: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="px-box anim-pop p-4 text-center" style={{ ["--bg" as string]: "#1b1f4a", color: "var(--cream)" }}>
        <p className="font-pixel text-[0.9rem] opacity-80">{r && !r.valida ? "Partida no válida" : "Puntaje"}</p>
        <p className="font-pixel text-[3.2rem] leading-none text-[var(--gold)]" style={{ textShadow: "0 4px 0 #000" }}>
          {r?.puntaje ?? 0}
        </p>
        {resumen && <div className="mt-2 text-[0.85rem] opacity-90">{resumen}</div>}
      </div>
      {r?.valida && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <Premio e="✨" t="XP" v={`+${r.xp}`} />
          <Premio e="🪙" t="Monedas" v={`+${r.coins}`} />
          <Premio e="⭐" t="Puntos" v={r.pretemporada ? "—" : `+${r.puntos}`} />
        </div>
      )}
      {r?.valida && (
        <p className="text-center text-[0.82rem] text-[var(--ink-soft)]">
          {r.pretemporada
            ? "Pretemporada: los puntos del ranking empiezan el 25 de noviembre."
            : r.topeHoy === 0
              ? "Temporada de prueba: cada partida suma."
              : r.puntos > 0
                ? `¡Nuevo mejor del día! Hoy llevas ${r.puntosHoy}/${r.topeHoy} pts en este juego.`
                : `Tu mejor de hoy sigue siendo ${r.mejorDelDia}. Supéralo para sumar más.`}
          {r.record === r.puntaje && r.puntaje > 0 ? " 🏆 ¡Récord personal!" : ""}
        </p>
      )}
      {r && !r.valida && (
        <p className="px-box px-3 py-2 text-[0.85rem]" style={{ ["--bg" as string]: "#f3c9d1" }}>
          {r.motivo}
        </p>
      )}
      {extra}
      <div className="flex items-end gap-2">
        <Retrato npc="auditor" size={52} className="shrink-0" />
        <div className="px-box flex-1 px-3 py-2 text-[0.88rem]" style={{ ["--bg" as string]: "#fff" }}>
          {comentario}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onOtraVez} className="px-btn shine flex-1" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
          ↻ Otra vez
        </button>
        <Link href="/ranking" className="px-btn flex-1" style={{ ["--bg" as string]: "var(--gold)" }}>
          Ranking
        </Link>
      </div>
    </div>
  );
}

export function Premio({ e, t, v }: { e: string; t: string; v: string }) {
  return (
    <div className="px-box anim-pop px-2 py-2" style={{ ["--bg" as string]: "var(--cream-2)" }}>
      <div className="text-xl" aria-hidden>
        {e}
      </div>
      <div className="font-pixel text-lg">{v}</div>
      <div className="text-[0.7rem] uppercase text-[var(--ink-soft)]">{t}</div>
    </div>
  );
}

export function Dato({ t, v }: { t: string; v: number | string }) {
  return (
    <span className="leading-tight">
      <span className="block text-[0.68rem] uppercase text-[var(--ink-soft)]">{t}</span>
      <span className="block font-pixel text-lg tabular-nums">{v}</span>
    </span>
  );
}
