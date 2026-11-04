"use client";

import { useState } from "react";
import { rejugar } from "@/lib/sim/store";

/** Marco de cada juego: título, "cómo se juega" y botón para volver a probar. */
export function Marco({
  juego,
  emoji,
  titulo,
  como,
  jugado,
  children,
  extra,
}: {
  juego: string;
  emoji: string;
  titulo: string;
  como: string[];
  jugado?: boolean;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  const [verReglas, setVerReglas] = useState(!jugado);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-pixel text-[1.45rem] leading-tight">
          <span aria-hidden>{emoji}</span> {titulo}
        </h3>
        {extra}
      </div>
      <div className="px-box px-3 py-2" style={{ ["--bg" as string]: "var(--cream-2)" }}>
        <button type="button" className="flex w-full items-center justify-between font-pixel text-[0.95rem]" onClick={() => setVerReglas((v) => !v)} aria-expanded={verReglas}>
          📖 Cómo se juega <span>{verReglas ? "▲" : "▼"}</span>
        </button>
        {verReglas && (
          <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-[0.88rem] leading-snug">
            {como.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ol>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
      {jugado && (
        <button type="button" onClick={() => rejugar(juego)} className="px-chip self-start" title="Solo en modo prueba">
          ↺ Volver a jugar (prueba)
        </button>
      )}
    </div>
  );
}

export function Boton({
  children,
  onClick,
  color = "var(--cherry)",
  disabled,
  claro,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  disabled?: boolean;
  claro?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-btn shine w-full"
      style={{ ["--bg" as string]: color, color: claro ? "var(--ink)" : color === "var(--cherry)" ? "var(--cream)" : "var(--ink)" }}
    >
      {children}
    </button>
  );
}

export function Opcion({
  children,
  onClick,
  estado,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  estado?: "elegida" | "correcta" | "incorrecta" | null;
  disabled?: boolean;
}) {
  const bg = estado === "correcta" ? "var(--mint)" : estado === "incorrecta" ? "#ffc7cf" : estado === "elegida" ? "var(--gold)" : "#fff";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-box w-full px-3 py-2.5 text-left text-[0.95rem] leading-snug transition-transform active:translate-y-0.5"
      style={{ ["--bg" as string]: bg, margin: "3px 0" }}
    >
      {children}
    </button>
  );
}

export function Resultado({ children, tipo = "ok" }: { children: React.ReactNode; tipo?: "ok" | "mal" | "info" }) {
  const bg = tipo === "ok" ? "var(--mint)" : tipo === "mal" ? "#ffd6dc" : "var(--sky)";
  return (
    <div className="px-box anim-pop px-3 py-2.5 text-[0.95rem]" style={{ ["--bg" as string]: bg }} role="status">
      {children}
    </div>
  );
}

export function Agente({ avatar, nombre, sub }: { avatar: string; nombre: string; sub?: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--lavender)] text-lg" style={{ boxShadow: "0 0 0 2px var(--ink)" }} aria-hidden>
        {avatar}
      </span>
      <span className="leading-tight">
        <span className="block font-pixel text-[0.95rem]">{nombre}</span>
        {sub && <span className="block text-[0.75rem] text-[var(--ink-soft)]">{sub}</span>}
      </span>
    </span>
  );
}

export function Puntos({ n }: { n: number }) {
  return (
    <span className="px-chip" style={{ ["--chip" as string]: n >= 0 ? "var(--gold)" : "#ffc7cf" }}>
      {n >= 0 ? "+" : ""}
      {n}
    </span>
  );
}

export function Texto({ valor, onChange, placeholder, filas = 1, max = 140 }: { valor: string; onChange: (v: string) => void; placeholder?: string; filas?: number; max?: number }) {
  return filas > 1 ? (
    <textarea className="px-input" rows={filas} maxLength={max} placeholder={placeholder} value={valor} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <input className="px-input" maxLength={max} placeholder={placeholder} value={valor} onChange={(e) => onChange(e.target.value)} />
  );
}
