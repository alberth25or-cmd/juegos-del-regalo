"use client";

import Link from "next/link";
import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { GANANCIAS, VENCIDA_SIN_PASO } from "@/features/scoring/economia";
import { api } from "@/lib/cliente/api";

type Pregunta = { id: string; texto: string; mia: string | null; estado: string | null };

export interface DatosCorazon {
  dia: number;
  fase: "normal" | "final";
  preguntas: Pregunta[];
}

const MAX = 120;

/**
 * Corazón: preguntas bonitas del día (2; en la recta final, 3 más profundas). Las respuestas van a
 * la ficha de quien te regala y las más completas salen en "Lo más bonito". Sin `real`, ejemplo.
 */
export function JuegoCorazon({ datos, real = false }: { datos: DatosCorazon; real?: boolean }) {
  const [mias, setMias] = useState<Record<string, string>>(() =>
    Object.fromEntries(datos.preguntas.filter((p) => p.estado === "respondida" && p.mia).map((p) => [p.id, p.mia as string])),
  );
  const [textos, setTextos] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState("");

  const enviar = async (p: Pregunta) => {
    const t = (textos[p.id] ?? "").trim();
    if (t.length < 2) return;
    if (!real) return setMias({ ...mias, [p.id]: t });
    setOcupado(p.id);
    setError("");
    const r = await api("/api/casas", { body: { accion: "responder", pregunta: p.id, valor: t } });
    setOcupado(null);
    if (r.ok) setMias({ ...mias, [p.id]: t });
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
            <PixelIcon name="clock" size={15} /> Cierran 23:59
          </span>
        </div>
        {datos.fase === "final" && (
          <p className="mt-4 rounded-[14px] bg-[#fdf0f5] px-4 py-3 font-bold text-[#b0306a]">💛 Recta final: hoy las preguntas van más hondo. Es lo que más va a recordar quien te regala.</p>
        )}
        <ol className="mt-4 flex flex-col gap-4">
          {datos.preguntas.map((p, k) => (
            <li key={p.id} className="rounded-[18px] bg-white p-4 shadow-[0_0_0_2px_#f6c9da]">
              <p className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-[var(--tinta-suave)]">Pregunta {k + 1}</p>
              <p className="f-titulo mt-0.5 text-[1.35rem] font-semibold leading-tight [text-wrap:balance]">{p.texto}</p>
              {mias[p.id] || p.estado ? (
                <div className="mt-3 rounded-[14px] bg-[#fdf0f5] px-3 py-2.5" role="status">
                  {mias[p.id] ? (
                    <>
                      <p className="text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-[#b0306a]">Tu respuesta · +{GANANCIAS.corazon}</p>
                      <p className="mt-0.5 whitespace-pre-line">{mias[p.id]}</p>
                    </>
                  ) : (
                    <p className="font-bold">{p.estado === "vencida" ? "Se venció" : "Ya respondida"}</p>
                  )}
                </div>
              ) : (
                <form
                  className="mt-3"
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    void enviar(p);
                  }}
                >
                  <label htmlFor={`c-${p.id}`} className="sr-only">
                    Tu respuesta
                  </label>
                  <textarea id={`c-${p.id}`} className="campo min-h-[88px] resize-none" maxLength={MAX} value={textos[p.id] ?? ""} onChange={(e) => setTextos({ ...textos, [p.id]: e.target.value })} placeholder="Cuéntalo en pocas palabras…" />
                  <p className="ayuda mt-1 text-right">
                    {(textos[p.id] ?? "").length}/{MAX}
                  </p>
                  <button type="submit" className="boton mt-2 w-full" disabled={ocupado === p.id || (textos[p.id] ?? "").trim().length < 2}>
                    {ocupado === p.id ? "Enviando…" : `Responder · +${GANANCIAS.corazon}`}
                  </button>
                </form>
              )}
            </li>
          ))}
        </ol>
        {error && (
          <p className="error mt-3" role="alert">
            {error}
          </p>
        )}
        <p className="mt-4 text-[0.8rem] text-[var(--tinta-suave)]">Si no respondes antes de las 23:59 pierdes {VENCIDA_SIN_PASO[6]} monedas por pregunta.</p>
        <p className="mt-3 flex items-start gap-2 rounded-[14px] bg-[#f3eef7] px-3 py-2.5 text-[0.82rem] text-[var(--tinta-suave)]">
          <PixelIcon name="heart" size={14} className="mt-0.5 shrink-0" /> Va a la ficha de quien te regala: le ayuda a elegir tu regalo y a describirte el día del intercambio. Las más completas salen en &quot;Lo más bonito&quot;.
        </p>
      </section>
    </div>
  );
}
