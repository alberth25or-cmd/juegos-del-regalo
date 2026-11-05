"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CLAVE = "jdr:guia-cc-vista";

const PASOS = [
  { e: "🏛️", t: "Entra a la plaza", d: "Santa, Rudolf, el duende sindicalista, el Muñeco y el Auditor te cuentan qué está pasando en Snowville." },
  { e: "🕹️", t: "Juega 1 minuto", d: "Tu mejor partida del día suma puntos al ranking. Repetir mejora tu récord, no te da puntos infinitos." },
  { e: "🤝", t: "Ayuda a tu equipo", d: "Son 4 equipos. Gana el que tiene mejor PROMEDIO, así que cada integrante cuenta." },
  { e: "🎄", t: "30 días de caos", d: "Del 25 nov al 24 dic se abren votaciones, roast voluntario, misiones cooperativas, sabotajes y el amigo secreto." },
];


/** Guía rápida: se abre sola la primera vez y con el evento "abrir-guia". */
export function Guia({ autoAbrir }: { autoAbrir: boolean }) {
  const [abierta, setAbierta] = useState(false);

  useEffect(() => {
    const abrir = () => setAbierta(true);
    window.addEventListener("abrir-guia", abrir);
    return () => window.removeEventListener("abrir-guia", abrir);
  }, []);

  useEffect(() => {
    if (!autoAbrir) return;
    let vista = true;
    try {
      vista = localStorage.getItem(CLAVE) === "1";
    } catch {}
    if (vista) return;
    const t = window.setTimeout(() => setAbierta(true), 2200);
    return () => window.clearTimeout(t);
  }, [autoAbrir]);

  const cerrar = () => {
    setAbierta(false);
    try {
      localStorage.setItem(CLAVE, "1");
    } catch {}
  };

  if (!abierta) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgb(27_31_74/0.55)] px-3 pb-28 sm:items-center sm:pb-6" onClick={cerrar} role="dialog" aria-modal="true" aria-labelledby="guia-titulo">
      <div className="px-box anim-pop w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/sprites/mascota.png" alt="" className="pixelated h-16 w-auto" style={{ animation: "bob 1.2s steps(2) infinite" }} />
          <div>
            <h2 id="guia-titulo" className="font-pixel text-[1.5rem] leading-tight">
              ¿Cómo se juega?
            </h2>
            <p className="px-hint">Unos minutos al día. Faltar un día no te hunde.</p>
          </div>
        </div>
        <ol className="mt-4 flex flex-col gap-2">
          {PASOS.map((p, i) => (
            <li key={i} className="px-box flex items-start gap-3 px-3 py-2" style={{ ["--bg" as string]: i === 1 ? "var(--cream-2)" : "#fff", margin: "3px 0" }}>
              <span className="text-2xl" aria-hidden>
                {p.e}
              </span>
              <span className="leading-snug">
                <span className="block font-pixel">
                  {i + 1}. {p.t}
                </span>
                <span className="block text-[0.85rem] text-[var(--ink-soft)]">{p.d}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[0.85rem]">
          <b>XP</b> sube tu nivel, <b>monedas</b> compran cosméticos (sin ventaja) y <b>puntos</b> deciden el ranking.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link href="/reglas" onClick={cerrar} className="px-btn w-full" style={{ ["--bg" as string]: "var(--gold)" }}>
            📜 Reglas completas
          </Link>
          <button type="button" onClick={cerrar} className="px-btn w-full" style={{ ["--bg" as string]: "var(--cream)" }}>
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}
