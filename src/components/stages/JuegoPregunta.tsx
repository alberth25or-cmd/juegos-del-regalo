"use client";

import Link from "next/link";
import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { costoPasar, costoVencida, GANANCIAS, PASES_POR_CASA } from "@/features/scoring/economia";

interface Pregunta {
  texto: string;
}

const CASA = {
  3: { nombre: "Amor y relaciones", icono: "heart", color: "#6b3fa0", gana: GANANCIAS.amor },
  4: { nombre: "Picante", icono: "chili", color: "#c8102e", gana: GANANCIAS.picante },
} as const;

/**
 * Preguntas del día de Amor (respuesta corta) o Picante (sí o no).
 *  - Responder da monedas. Pasar cuesta monedas y gasta uno de tus pases de la casa.
 *  - Dejarla vencer cuenta como pase; sin pases, cuesta el doble (economia.ts).
 *  - Picante: la primera vez confirmas que eres mayor de edad, o eliges no jugar esa casa.
 * shortcut: vista de diseño con estado local; el Frente 4 lo conecta al servidor.
 */
export function JuegoPregunta({ casa, preguntas, pasesUsadosInicial, saldoInicial }: { casa: 3 | 4; preguntas: Pregunta[]; pasesUsadosInicial: number; saldoInicial: number }) {
  const c = CASA[casa];
  const [acepta, setAcepta] = useState<boolean | null>(casa === 3 ? true : null);
  const [i, setI] = useState(0);
  const [texto, setTexto] = useState("");
  const [pasesUsados, setPasesUsados] = useState(pasesUsadosInicial);
  const [saldo, setSaldo] = useState(saldoInicial);
  const [confirmarPaso, setConfirmarPaso] = useState(false);
  const [historial, setHistorial] = useState<string[]>([]);

  const pase = costoPasar(casa, pasesUsados);
  const vencida = costoVencida(casa, pasesUsados);
  const terminado = i >= preguntas.length;

  const siguiente = (nota: string, delta: number, gastaPase = false) => {
    setSaldo((s) => s + delta);
    if (gastaPase) setPasesUsados((p) => p + 1);
    setHistorial((h) => [...h, nota]);
    setTexto("");
    setConfirmarPaso(false);
    setI((n) => n + 1);
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <Link href="/diseno" className="boton claro !min-h-11 self-start !px-4 !text-[0.95rem]">
        ← Volver a las casas
      </Link>

      <section className="clay relative p-6 pt-9 sm:p-8 sm:pt-10">
        <span className="absolute inset-x-0 top-0 h-[14px] rounded-t-[24px]" style={{ background: c.color }} aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="pastilla" style={{ ["--pb" as string]: "#f3eef7", ["--pf" as string]: c.color }}>
            <PixelIcon name={c.icono} size={14} /> {c.nombre}
          </span>
          <span className="flex items-center gap-1.5 text-[0.9rem] font-extrabold" aria-live="polite">
            <PixelIcon name="coin" size={16} /> {saldo}
          </span>
        </div>

        {acepta === null && (
          <div className="mt-5">
            <h1 className="f-titulo text-[1.8rem] font-semibold leading-tight">Antes de entrar a Picante</h1>
            <ul className="mt-3 flex flex-col gap-2 text-[0.95rem]">
              <li>• Son preguntas de solo sí o no, para mayores de edad.</li>
              <li>• Quien te regala puede comprar tus respuestas durante la temporada, sin saber quién eres.</li>
              <li>• Puedes pasar, pero cuesta monedas y tienes {PASES_POR_CASA} pases en esta casa.</li>
            </ul>
            <div className="mt-5 grid gap-2.5">
              <button type="button" className="boton w-full" onClick={() => setAcepta(true)}>
                Soy mayor de edad y quiero jugar
              </button>
              <button type="button" className="boton claro w-full" onClick={() => setAcepta(false)}>
                No juego Picante
              </button>
            </div>
          </div>
        )}

        {acepta === false && (
          <div className="mt-5" role="status">
            <h1 className="f-titulo text-[1.6rem] font-semibold leading-tight">Listo, no juegas Picante</h1>
            <p className="mt-2 text-[var(--tinta-suave)]">No te llegan sus preguntas: ahí no ganas ni pierdes monedas. Quien te regala verá &quot;No juega Picante&quot; en tu ficha.</p>
          </div>
        )}

        {acepta && !terminado && (
          <>
            <p className="mt-5 text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-[var(--tinta-suave)]">
              Pregunta {i + 1} de {preguntas.length} de hoy · vence a las 23:59
            </p>
            <h1 className="f-titulo mt-1 text-[1.8rem] font-semibold leading-tight [text-wrap:balance]">{preguntas[i].texto}</h1>

            {casa === 3 ? (
              <form
                className="mt-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (texto.trim()) siguiente(`Respondiste: ${texto.trim()}`, c.gana);
                }}
              >
                <label htmlFor="resp" className="etiqueta">
                  Tu respuesta (corta)
                </label>
                <input id="resp" className="campo" maxLength={40} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej.: 3, nunca, en el colegio…" autoComplete="off" />
                <button type="submit" className="boton mt-3 w-full" disabled={!texto.trim()}>
                  Responder · +{c.gana} monedas
                </button>
              </form>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {(["Sí", "No"] as const).map((r) => (
                  <button key={r} type="button" className={`boton ${r === "Sí" ? "" : "verde"} !min-h-[64px] !text-[1.3rem]`} onClick={() => siguiente(`Respondiste: ${r}`, c.gana)}>
                    {r}
                  </button>
                ))}
                <p className="col-span-2 text-center text-[0.85rem] font-bold text-[var(--tinta-suave)]">Responder da +{c.gana} monedas</p>
              </div>
            )}

            <div className="mt-5 border-t-2 border-dashed border-[#e2dcea] pt-4">
              {!pase.permitido ? (
                <p className="rounded-[14px] bg-[#f1edf5] px-3 py-2.5 text-[0.9rem] font-bold text-[var(--tinta-suave)]">{pase.motivo} Ahora solo queda responder.</p>
              ) : confirmarPaso ? (
                <div className="rounded-[14px] bg-[#fff1d6] p-3" role="alertdialog" aria-label="Confirmar paso">
                  <p className="text-[0.9rem]">
                    Pierdes <b>{pase.monedas} monedas</b> (bajas de {saldo} a {saldo - pase.monedas}) y te quedan {pase.quedan} pases en esta casa.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="boton !min-h-11 flex-1 !text-[0.95rem]" onClick={() => siguiente("Pasaste", -pase.monedas, true)}>
                      Sí, pasar
                    </button>
                    <button type="button" className="boton claro !min-h-11 flex-1 !text-[0.95rem]" onClick={() => setConfirmarPaso(false)}>
                      Mejor respondo
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className="boton claro w-full" disabled={saldo < pase.monedas} onClick={() => setConfirmarPaso(true)}>
                  {saldo < pase.monedas ? `No te alcanza para pasar (${pase.monedas})` : `Pasar · −${pase.monedas} monedas · te quedan ${PASES_POR_CASA - pasesUsados} de ${PASES_POR_CASA}`}
                </button>
              )}
              <p className="mt-2 text-[0.8rem] text-[var(--tinta-suave)]">
                Si no respondes antes de las 23:59 pierdes {vencida.monedas} monedas{vencida.gastaPase ? " y un pase" : " (ya no te quedan pases: cuesta el doble)"}.
              </p>
            </div>
          </>
        )}

        {acepta && terminado && (
          <div className="mt-5" role="status">
            <h1 className="f-titulo text-[1.7rem] font-semibold leading-tight">¡Listo por hoy en {c.nombre}!</h1>
            <ul className="mt-3 flex flex-col gap-1.5 text-[0.95rem]">
              {historial.map((h, k) => (
                <li key={k}>• {h}</li>
              ))}
            </ul>
            <p className="mt-3 text-[var(--tinta-suave)]">Mañana a medianoche salen preguntas nuevas.</p>
          </div>
        )}

        {acepta && (
          <p className="mt-5 flex items-start gap-2 rounded-[14px] bg-[#f3eef7] px-3 py-2.5 text-[0.82rem] text-[var(--tinta-suave)]">
            <PixelIcon name="lock" size={14} className="mt-0.5 shrink-0" /> Quien te regala puede comprar tus respuestas durante la temporada. Nunca sabrá tu nombre por la app.
          </p>
        )}
      </section>
    </div>
  );
}
