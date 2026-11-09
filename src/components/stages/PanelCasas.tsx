"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { api } from "@/lib/cliente/api";

export interface EstadoOrganizador {
  empezado: boolean;
  empezadoEn: string | null;
  fichaDia: number | null;
  activos: number;
  conFicha: number;
}

/**
 * Panel real del organizador para el juego de las casas: "Empezar" (sorteo secreto + puerta
 * cerrada + casas abiertas) y el día en que se abre la ficha final. Nunca muestra el sorteo ni
 * respuestas. Aprobar jugadores y reiniciar PIN sigue en /admin.
 */
export function PanelCasas({ estado, dia }: { estado: EstadoOrganizador; dia: number }) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [fichaDia, setFichaDia] = useState(String(estado.fichaDia ?? ""));

  const accion = async (body: Record<string, unknown>, ok: string) => {
    setOcupado(true);
    setError("");
    setMsg("");
    const r = await api("/api/admin", { body });
    setOcupado(false);
    setConfirmar(false);
    if (!r.ok) return setError(r.error);
    setMsg(ok);
    router.refresh();
  };

  return (
    <section className="clay mx-auto max-w-2xl p-6" aria-labelledby="casas-t">
      <h2 id="casas-t" className="f-titulo text-[1.6rem] font-semibold">
        Juego de las casas
      </h2>
      <p className="ayuda mt-1">Juegas como un agente más. Este panel nunca muestra el sorteo, ni quién es quién, ni respuestas.</p>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-[14px] bg-[#f3eef7] px-3 py-3">
          <dt className="text-[0.8rem] font-extrabold text-[var(--tinta-suave)]">Jugadores aprobados</dt>
          <dd className="f-titulo text-[1.8rem] font-semibold">{estado.activos}</dd>
        </div>
        <div className="rounded-[14px] bg-[#f3eef7] px-3 py-3">
          <dt className="text-[0.8rem] font-extrabold text-[var(--tinta-suave)]">Con ficha (entran al sorteo)</dt>
          <dd className="f-titulo text-[1.8rem] font-semibold">{estado.conFicha}</dd>
        </div>
      </dl>

      {!estado.empezado ? (
        <div className="mt-5 border-t-2 border-dashed border-[#e2dcea] pt-5">
          {!confirmar ? (
            <button type="button" className="boton w-full !text-[1.2rem]" disabled={estado.conFicha < 2 || ocupado} onClick={() => setConfirmar(true)}>
              {estado.conFicha < 2 ? "Faltan fichas para empezar (mínimo 2)" : "Empezar el juego"}
            </button>
          ) : (
            <div className="rounded-[18px] bg-[#fff1d6] p-4" role="alertdialog" aria-labelledby="emp-t">
              <p id="emp-t" className="text-[0.95rem]">
                Se hace el <b>sorteo</b> entre los {estado.conFicha} con ficha, se <b>cierra la puerta</b> (nadie más entra) y se <b>abren todas las casas</b>. Si la temporada aún no empezaba, empieza hoy. No se puede deshacer.
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" className="boton flex-1" disabled={ocupado} onClick={() => accion({ accion: "empezarCasas" }, "¡Listo! Sorteo hecho y casas abiertas.")}>
                  {ocupado ? "Empezando…" : "Sí, empezar"}
                </button>
                <button type="button" className="boton claro flex-1" onClick={() => setConfirmar(false)}>
                  Todavía no
                </button>
              </div>
            </div>
          )}
          <p className="ayuda mt-2">Quien no tenga su ficha al empezar puede jugar las casas, pero queda fuera del amigo secreto.</p>
        </div>
      ) : (
        <form
          className="mt-5 border-t-2 border-dashed border-[#e2dcea] pt-5"
          onSubmit={(ev) => {
            ev.preventDefault();
            void accion({ accion: "diaFicha", dia: Number(fichaDia) }, "Día de la ficha actualizado.");
          }}
        >
          <p className="flex items-center gap-2 font-bold text-[var(--verde)]">
            <PixelIcon name="check" size={18} /> El juego empezó · hoy es el día {dia}
          </p>
          <label htmlFor="ficha-dia" className="etiqueta mt-4">
            Día en que se abre la ficha final (para todos)
          </label>
          <div className="flex gap-2">
            <input id="ficha-dia" type="number" inputMode="numeric" min={dia + 1} className="campo" value={fichaDia} onChange={(e) => setFichaDia(e.target.value)} />
            <button type="submit" className="boton !px-5" disabled={ocupado}>
              Guardar
            </button>
          </div>
          <p className="ayuda mt-1">Ese día cada uno ve &quot;lo más picante&quot; de su amigo secreto.</p>
        </form>
      )}

      {msg && (
        <p className="mt-3 font-bold text-[var(--verde)]" role="status">
          {msg}
        </p>
      )}
      {error && (
        <p className="error mt-3" role="alert">
          {error}
        </p>
      )}

      <Link href="/admin" className="boton claro mt-5 w-full">
        Aprobar jugadores y reiniciar PIN
      </Link>
    </section>
  );
}
