"use client";

import Link from "next/link";
import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";

const PREGUNTA = {
  dia: 7,
  texto: "¿Qué es lo primero que se acaba en una fiesta navideña?",
  opciones: ["El panetón", "El chocolate caliente", "La paciencia", "El hielo"],
  // shortcut: votos inventados para la vista de diseño; el Frente 4 los calcula en el servidor al cierre.
  votos: [7, 4, 6, 2],
};
const COLORES = ["#c8102e", "#1f7a4d", "#d99a1c", "#2c4aa8"];
const LETRAS = ["A", "B", "C", "D"];

/** La manada: elige lo que crees que eligió la mayoría. Si coincides, +10 monedas. */
export function JuegoManada() {
  const [elegida, setElegida] = useState<number | null>(null);
  const [enviada, setEnviada] = useState(false);
  const total = PREGUNTA.votos.reduce((a, b) => a + b, 0);
  const mayoria = PREGUNTA.votos.indexOf(Math.max(...PREGUNTA.votos));
  const acerto = elegida === mayoria;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <Link href="/diseno" className="boton claro !min-h-11 self-start !px-4 !text-[0.95rem]">
        ← Volver a las casas
      </Link>

      <section className="clay relative p-6 pt-9 sm:p-8 sm:pt-10">
        <span className="absolute inset-x-0 top-0 h-[14px] rounded-t-[24px] bg-[var(--rojo-boton)]" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="pastilla" style={{ ["--pb" as string]: "#ffe3e6", ["--pf" as string]: "var(--rojo-boton)" }}>
            La manada · Pregunta del día {PREGUNTA.dia}
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap text-[0.85rem] font-bold text-[var(--tinta-suave)]">
            <PixelIcon name="clock" size={15} /> Cierra 23:59
          </span>
        </div>

        <h1 className="f-titulo mt-5 text-[1.9rem] font-semibold leading-tight [text-wrap:balance]">{PREGUNTA.texto}</h1>
        <p className="mt-2 text-[var(--tinta-suave)]">No digas lo que tú piensas: adivina lo que eligió <b className="text-[var(--tinta)]">la mayoría</b>. Si coincides, ganas 10 monedas.</p>

        {!enviada ? (
          <>
            <div className="mt-5 grid gap-3" role="radiogroup" aria-label="Opciones">
              {PREGUNTA.opciones.map((o, i) => {
                const activa = elegida === i;
                return (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={activa}
                    onClick={() => setElegida(i)}
                    className="flex min-h-[60px] items-center gap-3 rounded-[18px] bg-white px-4 text-left text-[1.08rem] font-extrabold transition-[transform,box-shadow] duration-150 active:translate-y-1"
                    style={{ boxShadow: activa ? `0 0 0 3px ${COLORES[i]}, 0 5px 0 ${COLORES[i]}` : "0 0 0 2px #e2dcea, 0 5px 0 #e2dcea" }}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white" style={{ background: COLORES[i] }}>
                      {LETRAS[i]}
                    </span>
                    {o}
                    {activa && <PixelIcon name="check" size={20} className="ml-auto" />}
                  </button>
                );
              })}
            </div>
            <button type="button" className="boton mt-6 w-full !text-[1.2rem]" disabled={elegida === null} onClick={() => setEnviada(true)}>
              {elegida === null ? "Elige una opción" : "Enviar mi respuesta"}
            </button>
          </>
        ) : (
          <div className="mt-5" aria-live="polite">
            <div className={`flex items-center gap-3 rounded-[18px] px-4 py-3 ${acerto ? "bg-[#e8f6ee]" : "bg-[#fff1d6]"}`}>
              <span className="flotar">
                <PixelIcon name={acerto ? "star" : "sparkle"} size={34} />
              </span>
              <div>
                <p className="f-titulo text-[1.35rem] font-semibold">{acerto ? "¡Piensas como la manada! +10 monedas" : "Esta vez la manada pensó distinto"}</p>
                <p className="text-[0.9rem] text-[var(--tinta-suave)]">Elegiste &quot;{PREGUNTA.opciones[elegida!]}&quot;.</p>
              </div>
            </div>

            <p className="mt-5 text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-[var(--tinta-suave)]">Así votó el grupo · vista previa</p>
            <ul className="mt-2 grid gap-2.5">
              {PREGUNTA.opciones.map((o, i) => {
                const pct = Math.round((PREGUNTA.votos[i] / total) * 100);
                return (
                  <li key={o}>
                    <div className="mb-1 flex justify-between text-[0.95rem] font-bold">
                      <span>
                        {o} {i === mayoria && <span className="pastilla ml-1 !py-0 !text-[0.72rem]">Mayoría</span>}
                      </span>
                      <span className="tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-[#f1edf5]">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORES[i] }} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-[0.85rem] text-[var(--tinta-suave)]">En el juego real el resultado se revela a las 23:59, cuando todos ya respondieron.</p>
            <button type="button" className="boton claro mt-5 w-full" onClick={() => { setEnviada(false); setElegida(null); }}>
              Probar otra vez
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
