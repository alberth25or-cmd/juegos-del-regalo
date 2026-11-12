"use client";

import Link from "next/link";
import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { costoPasar, costoVencida, GANANCIAS, PASES_POR_CASA } from "@/features/scoring/economia";
import { api } from "@/lib/cliente/api";
import type { EstadoCasas } from "@/lib/server/casas";

type Pregunta = EstadoCasas["amor"][number];

const CASA = {
  3: { nombre: "Amor y relaciones", icono: "heart", color: "#6b3fa0", gana: GANANCIAS.amor },
  4: { nombre: "Picante", icono: "chili", color: "#c8102e", gana: GANANCIAS.picante },
} as const;

/**
 * Preguntas de HOY de Amor (respuesta corta) o Picante (sí o no), conectadas al servidor.
 * Responder da monedas; pasar cuesta y gasta un pase. Todos juegan todas las casas (la mayoría de
 * edad y las reglas se aceptan una vez, en la pantalla de inicio).
 */
export function PreguntasCasa({ casa, inicial }: { casa: 3 | 4; inicial: EstadoCasas }) {
  const c = CASA[casa];
  const [e, setE] = useState(inicial);
  const [textos, setTextos] = useState<Record<string, string>>({});
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  const preguntas: Pregunta[] = casa === 3 ? e.amor : e.picante;
  const usados = e.pases[casa];
  const pase = costoPasar(casa, usados);
  const vencida = costoVencida(casa, usados);

  const enviar = async (body: Record<string, unknown>) => {
    setOcupado(true);
    setError("");
    const r = await api<{ estado: EstadoCasas }>("/api/casas", { body });
    setOcupado(false);
    setConfirmar(null);
    if (r.ok) setE(r.estado);
    else setError(r.error);
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <Link href="/" className="boton claro !min-h-11 self-start !px-4 !text-[0.95rem]">
        ← Volver a las casas
      </Link>

      <section className="clay relative p-6 pt-9 sm:p-8 sm:pt-10">
        <span className="absolute inset-x-0 top-0 h-[14px] rounded-t-[24px]" style={{ background: c.color }} aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="pastilla" style={{ ["--pb" as string]: "#f3eef7", ["--pf" as string]: c.color }}>
            <PixelIcon name={c.icono} size={14} /> {c.nombre} · día {e.dia}
          </span>
          <span className="flex items-center gap-1.5 text-[0.9rem] font-extrabold" aria-live="polite">
            <PixelIcon name="coin" size={16} /> {e.yo.monedas}
          </span>
        </div>

        {(
          <>
            <h1 className="f-titulo mt-5 text-[1.6rem] font-semibold leading-tight">Preguntas de hoy</h1>
            <p className="mt-1 text-[0.88rem] text-[var(--tinta-suave)]">Responder da +{c.gana} monedas. Vencen a las 23:59.</p>
            <ol className="mt-4 flex flex-col gap-4">
              {preguntas.map((p, k) => (
                <li key={p.id} className="rounded-[18px] bg-white p-4 shadow-[0_0_0_2px_#eee6f3]">
                  <p className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-[var(--tinta-suave)]">Pregunta {k + 1}</p>
                  <p className="f-titulo mt-0.5 text-[1.35rem] font-semibold leading-tight [text-wrap:balance]">{p.texto}</p>

                  {p.estado ? (
                    <p className="mt-3 flex items-center gap-2 rounded-[12px] bg-[#e8f6ee] px-3 py-2 text-[0.95rem] font-bold" role="status">
                      <PixelIcon name="check" size={16} /> {p.estado === "paso" ? "Pasaste esta pregunta" : p.estado === "vencida" ? "Se venció" : `Respondiste: ${p.mia}`}
                    </p>
                  ) : confirmar === p.id && pase.permitido ? (
                    <div className="mt-3 rounded-[14px] bg-[#fff1d6] p-3" role="alertdialog" aria-label="Confirmar paso">
                      <p className="text-[0.9rem]">
                        Pierdes <b>{pase.monedas} monedas</b> (bajas de {e.yo.monedas} a {e.yo.monedas - pase.monedas}) y te quedan {pase.quedan} pases en esta casa.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button type="button" className="boton !min-h-11 flex-1 !text-[0.95rem]" disabled={ocupado} onClick={() => enviar({ accion: "pasar", pregunta: p.id })}>
                          Sí, pasar
                        </button>
                        <button type="button" className="boton claro !min-h-11 flex-1 !text-[0.95rem]" onClick={() => setConfirmar(null)}>
                          Mejor respondo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {casa === 3 ? (
                        <form
                          className="mt-3"
                          onSubmit={(ev) => {
                            ev.preventDefault();
                            const t = (textos[p.id] ?? "").trim();
                            if (t) void enviar({ accion: "responder", pregunta: p.id, valor: t });
                          }}
                        >
                          <label htmlFor={`r-${p.id}`} className="sr-only">
                            Tu respuesta
                          </label>
                          <input id={`r-${p.id}`} className="campo" maxLength={40} value={textos[p.id] ?? ""} onChange={(ev) => setTextos({ ...textos, [p.id]: ev.target.value })} placeholder="Respuesta corta" autoComplete="off" />
                          <button type="submit" className="boton mt-2 w-full" disabled={ocupado || !(textos[p.id] ?? "").trim()}>
                            Responder · +{c.gana}
                          </button>
                        </form>
                      ) : (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {(["Sí", "No"] as const).map((r) => (
                            <button key={r} type="button" disabled={ocupado} className={`boton ${r === "Sí" ? "" : "verde"} !min-h-[56px] !text-[1.25rem]`} onClick={() => enviar({ accion: "responder", pregunta: p.id, valor: r })}>
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                      {pase.permitido ? (
                        <button type="button" className="mt-2 min-h-11 w-full rounded-[12px] text-[0.9rem] font-extrabold text-[var(--tinta-suave)] hover:bg-black/5 disabled:opacity-60" disabled={ocupado || e.yo.monedas < pase.monedas} onClick={() => setConfirmar(p.id)}>
                          {e.yo.monedas < pase.monedas ? `No te alcanza para pasar (${pase.monedas})` : `Pasar · −${pase.monedas} · te quedan ${PASES_POR_CASA - usados} de ${PASES_POR_CASA}`}
                        </button>
                      ) : (
                        <p className="mt-2 text-center text-[0.85rem] font-bold text-[var(--tinta-suave)]">{pase.motivo} Solo queda responder.</p>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ol>
            {error && (
              <p className="error mt-3" role="alert">
                {error}
              </p>
            )}
            <p className="mt-4 text-[0.8rem] text-[var(--tinta-suave)]">
              Si no respondes antes de las 23:59 pierdes {vencida.monedas} monedas{vencida.gastaPase ? " y un pase" : " (sin pases: cuesta el doble)"}.
            </p>
            <p className="mt-3 flex items-start gap-2 rounded-[14px] bg-[#f3eef7] px-3 py-2.5 text-[0.82rem] text-[var(--tinta-suave)]">
              <PixelIcon name="lock" size={14} className="mt-0.5 shrink-0" /> Quien te regala puede comprar tus respuestas durante la temporada. Nunca sabrá tu nombre por la app.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
