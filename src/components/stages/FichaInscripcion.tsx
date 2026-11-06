"use client";

import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";

const DATOS = [
  { id: "genero", label: "Género", opciones: ["Hombre", "Mujer", "Prefiero no decir"] },
  { id: "lentes", label: "¿Usas lentes?", opciones: ["Sí", "No"] },
  { id: "estatura", label: "Estatura", opciones: ["Alto", "Medio", "Bajo"] },
  { id: "cabello", label: "Cabello", opciones: ["Corto", "Largo", "Sin cabello"] },
] as const;

type Errores = Record<string, string>;

/**
 * Ficha de inscripción: el pase al árbol. Diseño con validación en el navegador;
 * shortcut: no guarda nada, el Frente 2 la conecta a /api y valida en el servidor.
 */
export function FichaInscripcion({ alias, presupuesto }: { alias: string; presupuesto: number }) {
  const [regalos, setRegalos] = useState(["", "", "", ""]);
  const [datos, setDatos] = useState<Record<string, string>>({});
  const [rasgo, setRasgo] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [lista, setLista] = useState(false);

  const validar = (): Errores => {
    const e: Errores = {};
    regalos.slice(0, 3).forEach((r, i) => {
      if (r.trim().length < 3) e[`regalo${i}`] = "Escribe una opción (mínimo 3 letras).";
    });
    for (const d of DATOS) if (!datos[d.id]) e[d.id] = "Elige una opción.";
    return e;
  };
  const faltan = Object.keys(validar()).length;

  if (lista)
    return (
      <div className="px-panel mx-auto max-w-md p-6 text-center" style={{ ["--bc" as string]: "var(--ok)" }} role="status">
        <PixelIcon name="check" size={48} className="mx-auto" />
        <h2 className="mt-3 font-pixel text-xl">¡Ficha completa!</h2>
        <p className="mt-2 text-[var(--texto-suave)]">Tu cabeza ya cuelga en el árbol. Espera el &quot;Empezar&quot; del organizador.</p>
      </div>
    );

  return (
    <form
      noValidate
      className="mx-auto flex max-w-xl flex-col gap-6"
      onSubmit={(ev) => {
        ev.preventDefault();
        const e = validar();
        setErrores(e);
        if (Object.keys(e).length === 0) setLista(true);
        else document.getElementById(Object.keys(e)[0])?.focus();
      }}
    >
      <header>
        <p className="font-pixel text-[0.85rem] text-[var(--texto-suave)]">FICHA DE {alias.toUpperCase()}</p>
        <h1 className="mt-1 font-pixel text-[1.6rem] leading-tight">Tu pase al árbol</h1>
        <p className="mt-2 text-[var(--texto-suave)]">
          Lo que escribas aquí <b className="text-[var(--cream)]">solo lo verá quien te regale</b>, al final de la temporada.
        </p>
      </header>

      <fieldset className="px-panel p-4">
        <legend className="sr-only">Opciones de regalo</legend>
        <p className="font-pixel text-[1.05rem]">1 · Opciones de regalo</p>
        <p className="px-hint mt-1">3 obligatorias y 1 opcional. Presupuesto de la sala: <b className="text-[var(--gold)]">S/{presupuesto}</b>.</p>
        <div className="mt-3 flex flex-col gap-3">
          {regalos.map((r, i) => {
            const id = `regalo${i}`;
            return (
              <div key={id}>
                <label htmlFor={id} className="px-label !text-[0.85rem]">
                  Opción {i + 1} {i === 3 && <span className="text-[var(--texto-tenue)]">(opcional)</span>}
                </label>
                <input
                  id={id}
                  className="px-input"
                  value={r}
                  maxLength={60}
                  placeholder={["Ej.: Taza térmica", "Ej.: Libro de cocina peruana", "Ej.: Audífonos", "Ej.: Chocolates"][i]}
                  aria-invalid={!!errores[id]}
                  aria-describedby={errores[id] ? `${id}-err` : undefined}
                  onChange={(e) => setRegalos(regalos.map((v, k) => (k === i ? e.target.value : v)))}
                  onBlur={() => errores[id] && setErrores({ ...errores, [id]: validar()[id] ?? "" })}
                />
                {errores[id] && <p id={`${id}-err`} className="mt-1 text-[0.85rem] text-[var(--yo)]">{errores[id]}</p>}
              </div>
            );
          })}
        </div>
      </fieldset>

      <section className="px-panel p-4" aria-labelledby="datos-t">
        <p id="datos-t" className="font-pixel text-[1.05rem]">2 · Así te reconocerán</p>
        <p className="px-hint mt-1">Datos breves para que te describan sin decir tu nombre.</p>
        <div className="mt-3 flex flex-col gap-4">
          {DATOS.map((d) => (
            <fieldset key={d.id} aria-describedby={errores[d.id] ? `${d.id}-err` : undefined}>
              <legend className="px-label !text-[0.85rem]">{d.label}</legend>
              <div className="flex flex-wrap">
                {d.opciones.map((o, k) => (
                  <label key={o} className="px-seg">
                    <input
                      type="radio"
                      name={d.id}
                      id={k === 0 ? d.id : undefined}
                      value={o}
                      checked={datos[d.id] === o}
                      onChange={() => {
                        setDatos({ ...datos, [d.id]: o });
                        if (errores[d.id]) setErrores({ ...errores, [d.id]: "" });
                      }}
                    />
                    {o}
                  </label>
                ))}
              </div>
              {errores[d.id] && <p id={`${d.id}-err`} className="mt-1 text-[0.85rem] text-[var(--yo)]">{errores[d.id]}</p>}
            </fieldset>
          ))}
          <div>
            <label htmlFor="rasgo" className="px-label !text-[0.85rem]">
              Un rasgo que te delate <span className="text-[var(--texto-tenue)]">(opcional)</span>
            </label>
            <input id="rasgo" className="px-input" value={rasgo} maxLength={60} placeholder="Ej.: siempre llego con café" onChange={(e) => setRasgo(e.target.value)} aria-describedby="rasgo-h" />
            <p id="rasgo-h" className="px-hint">{rasgo.length}/60</p>
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 bg-[var(--noche)]/95 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3">
        <p className="mb-1 text-center text-[0.85rem] text-[var(--texto-suave)]" aria-live="polite">
          {faltan === 0 ? "Todo listo." : `Te ${faltan === 1 ? "falta 1 cosa" : `faltan ${faltan} cosas`}.`}
        </p>
        <button type="submit" className="px-btn w-full !text-[1.1rem]" style={{ ["--bg" as string]: "var(--cta)", color: "var(--cream)" }}>
          Entrar al árbol
        </button>
      </div>
    </form>
  );
}
