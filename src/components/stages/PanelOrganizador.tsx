"use client";

import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import type { Agente } from "./datosEjemplo";

const NOMBRES = ["Calentamiento", "La manada", "Amor", "Picante", "Juicio final", "Ficha"];
const fmt = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", timeZone: "America/Lima" });

/**
 * Panel del organizador. Nunca muestra el sorteo ni respuestas, y nunca junta usuario con alias:
 * el avance va por alias y las contraseñas por usuario, en pestañas distintas.
 * shortcut: diseño sin conexión; el Frente 5 lo conecta a /api/admin.
 */
export function PanelOrganizador({ agentes, usuarios, capacidadInicial }: { agentes: Agente[]; usuarios: string[]; capacidadInicial: number }) {
  const [capacidad, setCapacidad] = useState(capacidadInicial);
  const [intervalo, setIntervalo] = useState(5);
  const [inicio, setInicio] = useState("2026-11-25");
  const [presupuesto, setPresupuesto] = useState(40);
  const [premio, setPremio] = useState("Canasta navideña para el primer lugar");
  const [pestana, setPestana] = useState<"avance" | "claves">("avance");
  const [confirmar, setConfirmar] = useState(false);

  const fechas = NOMBRES.map((n, i) => {
    const d = new Date(`${inicio}T12:00:00-05:00`);
    d.setDate(d.getDate() + i * intervalo);
    return { n, t: d.getTime(), f: Number.isNaN(d.getTime()) ? "—" : fmt.format(d) };
  });
  const pasaIntercambio = fechas.at(-1)!.t >= Date.parse(`${inicio.slice(0, 4)}-12-24T00:00:00-05:00`);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_1.1fr]">
      <section className="clay p-6" aria-labelledby="conf-t">
        <h2 id="conf-t" className="f-titulo text-[1.5rem] font-semibold">Configuración de la sala</h2>
        <p className="ayuda mt-1">Solo tú (el creador) ves esto. Juegas como un agente más.</p>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <Campo id="cap" label="Capacidad máxima" hint="Hasta 40">
            <input id="cap" type="number" inputMode="numeric" min={4} max={40} className="campo" value={capacidad} onChange={(e) => setCapacidad(Math.min(40, Math.max(4, +e.target.value || 4)))} />
          </Campo>
          <Campo id="int" label="Días entre stages" hint="Desde el Empezar">
            <input id="int" type="number" inputMode="numeric" min={1} max={10} className="campo" value={intervalo} onChange={(e) => setIntervalo(Math.min(10, Math.max(1, +e.target.value || 1)))} />
          </Campo>
          <Campo id="ini" label="Fecha de Empezar">
            <input id="ini" type="date" className="campo" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </Campo>
          <Campo id="pre" label="Presupuesto (S/)">
            <input id="pre" type="number" inputMode="numeric" min={10} className="campo" value={presupuesto} onChange={(e) => setPresupuesto(+e.target.value)} />
          </Campo>
          <div className="col-span-2">
            <Campo id="pre-f" label="Premio final (solo texto)" hint="La app no maneja dinero.">
              <input id="pre-f" className="campo" maxLength={80} value={premio} onChange={(e) => setPremio(e.target.value)} />
            </Campo>
          </div>
        </div>

        <h3 className="f-titulo mt-6 text-[1.15rem] font-semibold">Calendario</h3>
        <ol className="mt-2 grid grid-cols-3 gap-1.5 text-[0.85rem] sm:grid-cols-6">
          {fechas.map((f, i) => (
            <li key={f.n} className="rounded-[12px] bg-[#f3eef7] px-2 py-2 text-center text-[0.85rem] font-bold">
              <span className="block font-extrabold text-[var(--verde)]">{i < 5 ? `S${i + 1}` : "Ficha"}</span>
              {f.f}
            </li>
          ))}
        </ol>
        {pasaIntercambio && (
          <p className="mt-2 flex items-center gap-1.5 text-[0.85rem] font-bold text-[var(--rojo-boton)]" role="alert">
            <PixelIcon name="bang" size={10} /> La ficha final cae después del intercambio (24 dic). Acorta el intervalo.
          </p>
        )}

        <div className="mt-6 border-t-2 border-dashed border-[#e2dcea] pt-5">
          {!confirmar ? (
            <button type="button" className="boton w-full !text-[1.2rem]" onClick={() => setConfirmar(true)}>
              Empezar la temporada
            </button>
          ) : (
            <div className="rounded-[18px] bg-[#fff1d6] p-4" role="alertdialog" aria-labelledby="conf-emp">
              <p id="conf-emp" className="text-[0.95rem]">
                Se hará el <b>sorteo</b> y se <b>cerrará la puerta</b>: nadie más podrá entrar. No se puede deshacer.
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" className="boton claro flex-1" onClick={() => setConfirmar(false)} autoFocus>
                  Todavía no
                </button>
                <button type="button" className="boton flex-1" disabled title="Vista de diseño: no hace el sorteo">
                  Sí, empezar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="clay p-6" aria-label="Agentes">
        <div role="tablist" aria-label="Vista de agentes" className="flex gap-1 rounded-[16px] bg-[#f3eef7] p-1">
          {(
            [
              ["avance", "Avance · por alias"],
              ["claves", "Contraseñas · por usuario"],
            ] as const
          ).map(([id, txt]) => (
            <button
              key={id}
              role="tab"
              type="button"
              id={`tab-${id}`}
              aria-selected={pestana === id}
              aria-controls={`pan-${id}`}
              onClick={() => setPestana(id)}
              className="min-h-11 flex-1 rounded-[12px] px-2 text-[0.88rem] font-extrabold transition-colors"
              style={pestana === id ? { background: "var(--verde)", color: "#fff" } : { color: "var(--tinta-suave)" }}
            >
              {txt}
            </button>
          ))}
        </div>

        {pestana === "avance" ? (
          <div role="tabpanel" id="pan-avance" aria-labelledby="tab-avance" className="mt-3">
            <p className="text-[0.92rem] text-[var(--tinta-suave)]">
              <b className="text-[var(--tinta)]">{agentes.length}/{capacidad}</b> agentes en el árbol · fichas completas: {agentes.length}
            </p>
            <ul className="no-scrollbar mt-2 max-h-[340px] overflow-y-auto text-[0.9rem]">
              {[...agentes].sort((a, b) => a.alias.localeCompare(b.alias)).map((a) => (
                <li key={a.alias} className="flex items-center justify-between border-b border-[#eee6f3] py-2 font-semibold">
                  <span>{a.alias}</span>
                  <span className="pastilla !text-[0.78rem]" style={{ ["--pb" as string]: "#e8f6ee", ["--pf" as string]: "var(--verde)" }}>{NOMBRES[a.stage - 1]}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div role="tabpanel" id="pan-claves" aria-labelledby="tab-claves" className="mt-3">
            <p className="text-[0.92rem] text-[var(--tinta-suave)]">Reinicia la contraseña de quien la olvidó. Aquí no se ve su alias ni su avance.</p>
            <ul className="no-scrollbar mt-2 max-h-[340px] overflow-y-auto text-[0.9rem]">
              {usuarios.map((u) => (
                <li key={u} className="flex items-center justify-between gap-2 border-b border-[#eee6f3] py-1.5 font-semibold">
                  <span>@{u}</span>
                  <button type="button" className="min-h-11 rounded-full px-3 text-[0.85rem] font-extrabold text-[var(--rojo-boton)] disabled:opacity-70" disabled title="Vista de diseño">
                    Reiniciar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-4 flex gap-2.5 rounded-[14px] bg-[#f3eef7] p-3 text-[0.85rem] text-[var(--tinta-suave)]">
          <PixelIcon name="lock" size={16} />
          <span>El panel nunca muestra el sorteo ni las respuestas. Aviso honesto: quien tenga acceso directo a la base de datos podría verlos.</span>
        </p>
      </section>
    </div>
  );
}

function Campo({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="etiqueta">{label}</label>
      {children}
      {hint && <p className="ayuda mt-1">{hint}</p>}
    </div>
  );
}
