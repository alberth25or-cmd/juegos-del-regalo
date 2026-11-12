"use client";

import Link from "next/link";
import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { api } from "@/lib/cliente/api";
import { textoPresupuesto } from "./textosSala";

const DATOS = [
  { id: "genero", label: "Género", opciones: ["Hombre", "Mujer", "Prefiero no decir"] },
  { id: "lentes", label: "¿Usas lentes?", opciones: ["Sí", "No"] },
  { id: "estatura", label: "Estatura", opciones: ["Alto", "Medio", "Bajo"] },
  { id: "cabello", label: "Cabello", opciones: ["Corto", "Largo", "Sin cabello"] },
] as const;

type Errores = Record<string, string>;

/**
 * Ficha de inscripción: el pase al árbol. Valida en el navegador y, con `real`, la guarda en el
 * servidor (que vuelve a validar). Sin `real` es la vista de ejemplo y no guarda nada.
 */
export function FichaInscripcion({ alias, presupuesto, real }: { alias: string; presupuesto: number | null; real?: { inicial: { regalos: string[]; datos: Record<string, string> } | null } }) {
  const ini = real?.inicial;
  const [regalos, setRegalos] = useState(() => [0, 1, 2, 3].map((i) => ini?.regalos[i] ?? ""));
  const [datos, setDatos] = useState<Record<string, string>>(() => {
    const { rasgo: _r, ...resto } = ini?.datos ?? {};
    void _r;
    return resto;
  });
  const [rasgo, setRasgo] = useState(ini?.datos.rasgo ?? "");
  const [errores, setErrores] = useState<Errores>({});
  const [lista, setLista] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");

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
      <div className="clay mx-auto max-w-md p-7 text-center" role="status">
        <span className="flotar mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e8f6ee]">
          <PixelIcon name="check" size={44} />
        </span>
        <h2 className="f-titulo mt-4 text-[1.8rem] font-semibold">¡Ficha completa!</h2>
        <p className="mt-2 text-[var(--tinta-suave)]">Tu cabeza ya cuelga en el árbol. Ahora toca esperar el &quot;Empezar&quot; del organizador.</p>
        <Link href={real ? "/" : "/diseno/arbol"} className="boton verde mt-5 w-full">
          Ver el árbol
        </Link>
      </div>
    );

  return (
    <form
      noValidate
      className="mx-auto flex max-w-xl flex-col gap-6"
      onSubmit={async (ev) => {
        ev.preventDefault();
        const e = validar();
        setErrores(e);
        if (Object.keys(e).length > 0) return document.getElementById(Object.keys(e)[0])?.focus();
        if (!real) return setLista(true);
        setEnviando(true);
        setErrorServidor("");
        const r = await api("/api/casas", { body: { accion: "ficha", regalos: regalos.map((x) => x.trim()).filter(Boolean), datos: { ...datos, rasgo: rasgo.trim() } } });
        setEnviando(false);
        if (r.ok) setLista(true);
        else setErrorServidor(r.error);
      }}
    >
      <header className="text-center">
        <p className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-[var(--oro)]">Ficha de {alias}</p>
        <h1 className="f-titulo mt-1 text-[2.2rem] font-semibold leading-tight">Tu pase al árbol</h1>
        <p className="mx-auto mt-2 max-w-[44ch] text-[var(--hielo)]">
          Lo que escribas aquí <b className="text-white">solo lo verá quien te regale</b>. Tus opciones de regalo las ve desde el sorteo, para que le dé tiempo de comprar.
        </p>
      </header>

      <fieldset className="clay p-5">
        <legend className="sr-only">Opciones de regalo</legend>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#ffe3e6]"><PixelIcon name="chest" size={26} /></span>
          <div>
            <p className="f-titulo text-[1.3rem] font-semibold leading-tight">¿Qué te gustaría recibir?</p>
            <p className="ayuda">3 opciones obligatorias y 1 opcional. Presupuesto: <b className="text-[var(--rojo-boton)]">{textoPresupuesto(presupuesto)}</b></p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {regalos.map((r, i) => {
            const id = `regalo${i}`;
            return (
              <div key={id}>
                <label htmlFor={id} className="etiqueta">
                  Opción {i + 1} {i === 3 && <span className="font-semibold text-[var(--tinta-suave)]">(opcional)</span>}
                </label>
                <input
                  id={id}
                  className="campo"
                  value={r}
                  maxLength={60}
                  placeholder={["Ej.: Taza térmica", "Ej.: Libro de cocina", "Ej.: Audífonos", "Ej.: Chocolates"][i]}
                  aria-invalid={!!errores[id]}
                  aria-describedby={errores[id] ? `${id}-err` : undefined}
                  onChange={(e) => setRegalos(regalos.map((v, k) => (k === i ? e.target.value : v)))}
                  onBlur={() => errores[id] && setErrores({ ...errores, [id]: validar()[id] ?? "" })}
                />
                {errores[id] && <p id={`${id}-err`} className="error mt-1">{errores[id]}</p>}
              </div>
            );
          })}
        </div>
      </fieldset>

      <section className="clay p-5" aria-labelledby="datos-t">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#e8f6ee]"><PixelIcon name="friend" size={26} /></span>
          <div>
            <p id="datos-t" className="f-titulo text-[1.3rem] font-semibold leading-tight">Así te reconocerán</p>
            <p className="ayuda">Pistas para que te describan sin decir tu nombre.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {DATOS.map((d) => (
            <fieldset key={d.id} aria-describedby={errores[d.id] ? `${d.id}-err` : undefined}>
              <legend className="etiqueta">{d.label}</legend>
              <div className="flex flex-wrap gap-2">
                {d.opciones.map((o, k) => (
                  <label key={o} className="opcion">
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
              {errores[d.id] && <p id={`${d.id}-err`} className="error mt-1.5">{errores[d.id]}</p>}
            </fieldset>
          ))}
          <div>
            <label htmlFor="rasgo" className="etiqueta">
              Un rasgo que te delate <span className="font-semibold text-[var(--tinta-suave)]">(opcional)</span>
            </label>
            <input id="rasgo" className="campo" value={rasgo} maxLength={60} placeholder="Ej.: siempre llego con café" onChange={(e) => setRasgo(e.target.value)} aria-describedby="rasgo-h" />
            <p id="rasgo-h" className="ayuda mt-1 text-right">{rasgo.length}/60</p>
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 bg-gradient-to-t from-[var(--cielo-1)] via-[rgb(11_22_64/0.9)] to-transparent px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-6">
        <p className="mb-2 text-center text-[0.9rem] font-bold text-[var(--hielo)]" aria-live="polite">
          {faltan === 0 ? "¡Todo listo!" : `Te ${faltan === 1 ? "falta 1 cosa" : `faltan ${faltan} cosas`}`}
        </p>
        {errorServidor && (
          <p className="error mb-2 text-center" role="alert">
            {errorServidor}
          </p>
        )}
        <button type="submit" className="boton w-full !text-[1.25rem]" disabled={enviando}>
          {enviando ? "Guardando…" : ini ? "Guardar cambios" : "Colgarme en el árbol"}
        </button>
      </div>
    </form>
  );
}
