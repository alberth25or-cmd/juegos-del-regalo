"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { PASES_POR_CASA } from "@/features/scoring/economia";
import { api } from "@/lib/cliente/api";

/**
 * Pantalla de inicio (decisión de Luis, 2026-11-12): se confirma UNA vez, antes de jugar, que se
 * es mayor de edad y que se aceptan las reglas. Después, todos juegan todas las casas: no hay
 * opción de no participar en ninguna (sí existe "Paso", que cuesta monedas).
 */
export function PantallaInicio({ alias }: { alias: string }) {
  const router = useRouter();
  const [mayor, setMayor] = useState(false);
  const [reglas, setReglas] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  const entrar = async () => {
    setOcupado(true);
    setError("");
    const r = await api("/api/casas", { body: { accion: "aceptar", mayorDeEdad: mayor } });
    setOcupado(false);
    if (!r.ok) return setError(r.error);
    router.refresh();
  };

  return (
    <main className="px-4 pb-56 pt-8">
      <section className="clay mx-auto max-w-md p-7">
        <p className="text-center text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-[var(--verde)]">Bienvenido, {alias || "agente"}</p>
        <h1 className="f-titulo mt-1 text-center text-[2rem] font-semibold leading-tight">Antes de empezar</h1>
        <ul className="mt-4 flex flex-col gap-2.5 text-[0.95rem]">
          <li className="flex gap-2">
            <PixelIcon name="heart" size={18} className="mt-0.5 shrink-0" /> Es un juego para adultos: hay preguntas de amor, picantes y de contenido sexual (de sí o no).
          </li>
          <li className="flex gap-2">
            <PixelIcon name="star" size={18} className="mt-0.5 shrink-0" /> <span>Todos juegan <b>todas las casas</b>. Puedes pasar preguntas, pero cuesta monedas y tienes {PASES_POR_CASA} pases por casa.</span>
          </li>
          <li className="flex gap-2">
            <PixelIcon name="lock" size={18} className="mt-0.5 shrink-0" /> Quien te regala puede leer (o comprar) tus respuestas. Nadie sabe tu nombre real por la app.
          </li>
        </ul>

        <div className="mt-5 flex flex-col gap-2">
          <label className="flex min-h-11 items-start gap-3 rounded-[14px] bg-[#f3eef7] px-3 py-2.5 font-semibold">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--verde)]" checked={mayor} onChange={(e) => setMayor(e.target.checked)} />
            Confirmo que soy mayor de edad (18 años o más).
          </label>
          <label className="flex min-h-11 items-start gap-3 rounded-[14px] bg-[#f3eef7] px-3 py-2.5 font-semibold">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--verde)]" checked={reglas} onChange={(e) => setReglas(e.target.checked)} />
            Acepto las reglas del juego.
          </label>
        </div>

        {error && (
          <p className="error mt-3" role="alert">
            {error}
          </p>
        )}
        <button type="button" className="boton mt-5 w-full !text-[1.2rem]" disabled={!mayor || !reglas || ocupado} onClick={entrar}>
          {ocupado ? "Entrando…" : "Entrar al juego"}
        </button>
      </section>
    </main>
  );
}
