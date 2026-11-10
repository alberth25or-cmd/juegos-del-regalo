"use client";

import Link from "next/link";
import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { GANANCIAS } from "@/features/scoring/economia";
import { api } from "@/lib/cliente/api";
import type { EstadoCasas, Premio } from "@/lib/server/casas";

export interface DatosJuicio {
  dia: number;
  caso: { id: string; texto: string; mia: string | null; estado: string | null } | null;
  ayer: EstadoCasas["juicioAyer"];
  premios: Premio[];
  final: boolean;
}

/**
 * Juicio final: un caso absurdo por día (¿culpable o inocente?) y el Ranking de la vergüenza.
 * Votar da monedas y, si coincides con el jurado, al día siguiente llegan más. El último tramo
 * de la temporada muestra el veredicto final con los premios. Sin `real`, es vista de ejemplo.
 */
export function JuegoJuicio({ datos, real = false }: { datos: DatosJuicio; real?: boolean }) {
  const [mia, setMia] = useState(datos.caso?.estado === "respondida" ? datos.caso.mia : null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const votar = async (v: "Culpable" | "Inocente") => {
    if (!datos.caso) return;
    if (!real) return setMia(v);
    setOcupado(true);
    setError("");
    const r = await api("/api/casas", { body: { accion: "responder", pregunta: datos.caso.id, valor: v } });
    setOcupado(false);
    if (r.ok) setMia(v);
    else setError(r.error);
  };
  const a = datos.ayer;
  const total = a ? a.culpable + a.inocente : 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <Link href="/" className="boton claro !min-h-11 self-start !px-4 !text-[0.95rem]">
        ← Volver a las casas
      </Link>

      {a && total > 0 && (
        <section className="clay p-5" aria-label="Veredicto de ayer">
          <p className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-[var(--tinta-suave)]">Veredicto de ayer</p>
          <p className="mt-1 font-semibold">{a.texto}</p>
          <p className="f-titulo mt-2 text-[1.4rem] font-semibold" style={{ color: a.veredicto === "Culpable" ? "var(--rojo-boton)" : a.veredicto === "Inocente" ? "var(--verde)" : "var(--tinta)" }}>
            {a.veredicto === "Empate" ? "¡Empate! El jurado no se pone de acuerdo" : `${a.veredicto} (${Math.round((Math.max(a.culpable, a.inocente) / total) * 100)} %)`}
          </p>
          <div className="mt-2 flex h-4 overflow-hidden rounded-full bg-[#f1edf5]" aria-hidden>
            <div style={{ width: `${(a.culpable / total) * 100}%`, background: "var(--rojo-boton)" }} />
            <div style={{ width: `${(a.inocente / total) * 100}%`, background: "var(--verde)" }} />
          </div>
          {a.mia && <p className="mt-2 text-[0.88rem] text-[var(--tinta-suave)]">Tú votaste {a.mia}{a.veredicto === a.mia || a.veredicto === "Empate" ? ` · +${GANANCIAS.juicioCoincidir} por coincidir` : " · esta vez no coincidiste"}.</p>}
        </section>
      )}

      {datos.caso && (
        <section className="clay relative p-6 pt-9 sm:p-8 sm:pt-10">
          <span className="absolute inset-x-0 top-0 h-[14px] rounded-t-[24px] bg-[#2c4aa8]" aria-hidden />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="pastilla" style={{ ["--pb" as string]: "#e6ecfb", ["--pf" as string]: "#2c4aa8" }}>
              <PixelIcon name="star" size={14} /> Juicio final · caso del día {datos.dia}
            </span>
            <span className="flex items-center gap-1.5 text-[0.85rem] font-bold text-[var(--tinta-suave)]">
              <PixelIcon name="clock" size={15} /> Cierra 23:59
            </span>
          </div>
          <h1 className="f-titulo mt-5 text-[1.8rem] font-semibold leading-tight [text-wrap:balance]">{datos.caso.texto}</h1>
          {mia ? (
            <p className="mt-5 flex items-center gap-2 rounded-[16px] bg-[#e8f6ee] px-4 py-3 font-bold" role="status">
              <PixelIcon name="check" size={18} /> Tu veredicto: {mia} · +{GANANCIAS.juicioResponder}. Mañana se sabe qué dijo el jurado (+{GANANCIAS.juicioCoincidir} si coincides).
            </p>
          ) : (
            <>
              <p className="mt-2 text-[var(--tinta-suave)]">¿Culpable o inocente? Votar da {GANANCIAS.juicioResponder} monedas; coincidir con la mayoría del jurado, {GANANCIAS.juicioCoincidir} más.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" className="boton !min-h-[64px] !text-[1.2rem]" disabled={ocupado} onClick={() => votar("Culpable")}>
                  Culpable
                </button>
                <button type="button" className="boton verde !min-h-[64px] !text-[1.2rem]" disabled={ocupado} onClick={() => votar("Inocente")}>
                  Inocente
                </button>
              </div>
              {error && (
                <p className="error mt-3" role="alert">
                  {error}
                </p>
              )}
            </>
          )}
        </section>
      )}

      <section className="clay p-6" aria-labelledby="premios-t">
        <h2 id="premios-t" className="f-titulo flex items-center gap-2 text-[1.5rem] font-semibold">
          {datos.final ? "🏆 Veredicto final" : "🥴 Ranking de la vergüenza"}
        </h2>
        <p className="mt-1 text-[0.9rem] text-[var(--tinta-suave)]">
          {datos.final ? "Los premios de la temporada. Solo alias: nadie sabe quién es quién… todavía." : "Premios absurdos hasta hoy. El último tramo de la temporada se vuelven el veredicto final."}
        </p>
        {datos.premios.length === 0 ? (
          <p className="mt-4 rounded-[14px] bg-[#f3eef7] px-4 py-3 text-[0.95rem]">Todavía no hay premios: el jurado está deliberando.</p>
        ) : (
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {datos.premios.map((p) => (
              <li key={p.titulo} className="flex items-start gap-3 rounded-[16px] bg-white px-3.5 py-3 shadow-[0_0_0_2px_#eee6f3]">
                <span className="text-[1.6rem] leading-none" aria-hidden>
                  {p.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-[var(--tinta-suave)]">{p.titulo}</p>
                  <p className="f-titulo text-[1.15rem] font-semibold leading-tight">{p.ganadores.join(" y ")}</p>
                  <p className="text-[0.82rem] text-[var(--tinta-suave)]">{p.detalle}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
