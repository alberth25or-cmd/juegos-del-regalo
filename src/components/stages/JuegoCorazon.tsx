"use client";

import Link from "next/link";
import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { GANANCIAS, VENCIDA_SIN_PASO } from "@/features/scoring/economia";
import { api } from "@/lib/cliente/api";

export interface DatosCorazon {
  dia: number;
  pregunta: { id: string; texto: string; mia: string | null; estado: string | null } | null;
}

const MAX = 120;

/**
 * Corazón: una pregunta bonita por día. La respuesta va a la ficha de quien te regala (le dice qué
 * te hace feliz y qué regalarte) y las más completas salen en "Lo más bonito" de la ficha final.
 * Sin `real` es la vista de ejemplo (no guarda).
 */
export function JuegoCorazon({ datos, real = false }: { datos: DatosCorazon; real?: boolean }) {
  const p = datos.pregunta;
  const [mia, setMia] = useState(p?.estado === "respondida" ? p.mia : null);
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  const enviar = async () => {
    if (!p || !texto.trim()) return;
    if (!real) return setMia(texto.trim());
    setOcupado(true);
    setError("");
    const r = await api("/api/casas", { body: { accion: "responder", pregunta: p.id, valor: texto } });
    setOcupado(false);
    if (r.ok) setMia(texto.trim());
    else setError(r.error);
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <Link href="/" className="boton claro !min-h-11 self-start !px-4 !text-[0.95rem]">
        ← Volver a las casas
      </Link>
      <section className="clay relative p-6 pt-9 sm:p-8 sm:pt-10">
        <span className="absolute inset-x-0 top-0 h-[14px] rounded-t-[24px] bg-[#d6457a]" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="pastilla" style={{ ["--pb" as string]: "#fde6ef", ["--pf" as string]: "#b0306a" }}>
            <PixelIcon name="sparkle" size={14} /> Corazón · día {datos.dia}
          </span>
          <span className="flex items-center gap-1.5 text-[0.85rem] font-bold text-[var(--tinta-suave)]">
            <PixelIcon name="clock" size={15} /> Cierra 23:59
          </span>
        </div>
        {!p ? (
          <p className="mt-5">Hoy no hay pregunta.</p>
        ) : (
          <>
            <h1 className="f-titulo mt-5 text-[1.8rem] font-semibold leading-tight [text-wrap:balance]">{p.texto}</h1>
            {mia ? (
              <div className="mt-5 rounded-[18px] bg-[#fdf0f5] p-4" role="status">
                <p className="text-[0.85rem] font-extrabold uppercase tracking-[0.08em] text-[#b0306a]">Tu respuesta · +{GANANCIAS.corazon} monedas</p>
                <p className="mt-1 whitespace-pre-line text-[1.05rem]">{mia}</p>
                <p className="mt-2 text-[0.85rem] text-[var(--tinta-suave)]">Mañana sale otra pregunta bonita.</p>
              </div>
            ) : (
              <form
                className="mt-5"
                onSubmit={(ev) => {
                  ev.preventDefault();
                  void enviar();
                }}
              >
                <label htmlFor="corazon" className="etiqueta">
                  Tu respuesta (hasta 2 líneas)
                </label>
                <textarea id="corazon" className="campo min-h-[96px] resize-none" maxLength={MAX} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Cuéntalo en pocas palabras…" />
                <p className="ayuda mt-1 text-right">
                  {texto.length}/{MAX}
                </p>
                {error && (
                  <p className="error mt-1" role="alert">
                    {error}
                  </p>
                )}
                <button type="submit" className="boton mt-3 w-full" disabled={ocupado || texto.trim().length < 2}>
                  {ocupado ? "Enviando…" : `Responder · +${GANANCIAS.corazon} monedas`}
                </button>
                <p className="mt-2 text-[0.8rem] text-[var(--tinta-suave)]">Si no respondes antes de las 23:59 pierdes {VENCIDA_SIN_PASO[6]} monedas.</p>
              </form>
            )}
            <p className="mt-5 flex items-start gap-2 rounded-[14px] bg-[#f3eef7] px-3 py-2.5 text-[0.82rem] text-[var(--tinta-suave)]">
              <PixelIcon name="heart" size={14} className="mt-0.5 shrink-0" /> Va a la ficha de quien te regala: le ayuda a elegir tu regalo y a describirte el día del intercambio. Las más completas salen en &quot;Lo más bonito&quot;.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
