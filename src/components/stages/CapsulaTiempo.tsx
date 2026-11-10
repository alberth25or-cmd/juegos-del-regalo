"use client";

import Link from "next/link";
import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { api } from "@/lib/cliente/api";

export interface DatosCapsula {
  abreDia: number;
  dia: number;
  abierta: boolean;
  mio: string | null;
  recibido: string | null;
  /** Alias de tu amigo secreto (a quien le escribes). */
  para: string | null;
}

const MAX = 400;

/**
 * Cápsula del tiempo: le dejas un mensaje a tu amigo secreto y lo lee el último día de la
 * temporada, junto con el intercambio. Hasta entonces lo puedes cambiar. Nadie más lo ve.
 * Sin `real` es vista de ejemplo (no guarda).
 */
export function CapsulaTiempo({ datos, real = false }: { datos: DatosCapsula; real?: boolean }) {
  const [texto, setTexto] = useState(datos.mio ?? "");
  const [guardado, setGuardado] = useState(datos.mio);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const faltan = Math.max(0, datos.abreDia - datos.dia);

  const guardar = async () => {
    setError("");
    if (!real) return setGuardado(texto.trim());
    setOcupado(true);
    const r = await api<{ mensaje: string }>("/api/casas", { body: { accion: "capsula", mensaje: texto } });
    setOcupado(false);
    if (r.ok) {
      setGuardado(r.mensaje);
      setTexto(r.mensaje);
    } else setError(r.error);
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <Link href="/" className="boton claro !min-h-11 self-start !px-4 !text-[0.95rem]">
        ← Volver a las casas
      </Link>

      <section className="clay relative overflow-hidden p-6 pt-9 sm:p-8 sm:pt-10" aria-labelledby="recibido-t">
        <span className="absolute inset-x-0 top-0 h-[14px] bg-[var(--oro)]" aria-hidden />
        <h1 id="recibido-t" className="f-titulo flex items-center gap-2 text-[1.8rem] font-semibold">
          💌 Cápsula del tiempo
        </h1>
        {datos.abierta ? (
          datos.recibido ? (
            <figure className="mt-4 rounded-[18px] bg-[#fff8e6] p-5 shadow-[0_0_0_2px_#f5d9a3]">
              <blockquote className="whitespace-pre-line text-[1.1rem] leading-relaxed">{datos.recibido}</blockquote>
              <figcaption className="mt-3 text-[0.88rem] font-bold text-[var(--tinta-suave)]">— Tu amigo secreto (hoy descubres quién es)</figcaption>
            </figure>
          ) : (
            <p className="mt-3 text-[var(--tinta-suave)]">Tu amigo secreto no te dejó mensaje esta vez. ¡Igual hoy se descubre quién es!</p>
          )
        ) : (
          <p className="mt-3 flex items-center gap-2 rounded-[14px] bg-[#f3eef7] px-4 py-3 font-bold text-[var(--tinta-suave)]">
            <PixelIcon name="lock" size={16} /> El mensaje que te dejaron se abre el día {datos.abreDia} {faltan > 0 ? `(faltan ${faltan} días)` : ""}, el día del intercambio.
          </p>
        )}
      </section>

      {datos.para ? (
        <section className="clay p-6" aria-labelledby="escribir-t">
          <h2 id="escribir-t" className="f-titulo text-[1.4rem] font-semibold">
            Tu mensaje para {datos.para}
          </h2>
          {datos.abierta ? (
            <p className="mt-2 whitespace-pre-line rounded-[14px] bg-white px-4 py-3 shadow-[0_0_0_2px_#eee6f3]">{guardado ?? "No le dejaste mensaje."}</p>
          ) : (
            <form
              className="mt-3"
              onSubmit={(ev) => {
                ev.preventDefault();
                if (texto.trim()) void guardar();
              }}
            >
              <label htmlFor="capsula" className="etiqueta">
                Lo leerá el día {datos.abreDia}. Hasta entonces lo puedes cambiar.
              </label>
              <textarea
                id="capsula"
                className="campo min-h-[140px] resize-y"
                maxLength={MAX}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Algo bonito, una broma interna, una pista final…"
              />
              <p className="ayuda mt-1 text-right">
                {texto.length}/{MAX}
              </p>
              {error && (
                <p className="error mt-1" role="alert">
                  {error}
                </p>
              )}
              {guardado && guardado === texto.trim() && !error && (
                <p className="mt-1 font-bold text-[var(--verde)]" role="status">
                  ✓ Guardado en la cápsula
                </p>
              )}
              <button type="submit" className="boton mt-3 w-full" disabled={ocupado || !texto.trim() || texto.trim() === guardado}>
                {ocupado ? "Guardando…" : guardado ? "Guardar cambios" : "Guardar en la cápsula"}
              </button>
            </form>
          )}
          <p className="mt-3 flex items-start gap-2 text-[0.82rem] text-[var(--tinta-suave)]">
            <PixelIcon name="lock" size={14} className="mt-0.5 shrink-0" /> Solo lo lee tu amigo secreto. Nada de teléfonos, correos ni enlaces.
          </p>
        </section>
      ) : (
        <p className="clay p-5 text-center text-[var(--tinta-suave)]">No entraste al sorteo, así que no tienes a quién escribirle.</p>
      )}
    </div>
  );
}
