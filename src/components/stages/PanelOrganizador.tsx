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
      <section className="px-panel p-5" aria-labelledby="conf-t">
        <h2 id="conf-t" className="font-pixel text-[1.15rem]">Configuración de la sala</h2>
        <p className="px-hint mt-1">Solo tú (el creador) ves esto. Juegas como un agente más.</p>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <Campo id="cap" label="Capacidad máxima" hint="Hasta 40">
            <input id="cap" type="number" inputMode="numeric" min={4} max={40} className="px-input" value={capacidad} onChange={(e) => setCapacidad(Math.min(40, Math.max(4, +e.target.value || 4)))} />
          </Campo>
          <Campo id="int" label="Días entre stages" hint="Desde el Empezar">
            <input id="int" type="number" inputMode="numeric" min={1} max={10} className="px-input" value={intervalo} onChange={(e) => setIntervalo(Math.min(10, Math.max(1, +e.target.value || 1)))} />
          </Campo>
          <Campo id="ini" label="Fecha de Empezar">
            <input id="ini" type="date" className="px-input" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </Campo>
          <Campo id="pre" label="Presupuesto (S/)">
            <input id="pre" type="number" inputMode="numeric" min={10} className="px-input" value={presupuesto} onChange={(e) => setPresupuesto(+e.target.value)} />
          </Campo>
          <div className="col-span-2">
            <Campo id="pre-f" label="Premio final (solo texto)" hint="La app no maneja dinero.">
              <input id="pre-f" className="px-input" maxLength={80} value={premio} onChange={(e) => setPremio(e.target.value)} />
            </Campo>
          </div>
        </div>

        <h3 className="mt-5 font-pixel text-[0.95rem]">Calendario</h3>
        <ol className="mt-2 grid grid-cols-3 gap-1.5 text-[0.85rem] sm:grid-cols-6">
          {fechas.map((f, i) => (
            <li key={f.n} className="bg-[var(--noche)] px-2 py-1.5 text-center">
              <span className="block font-pixel text-[var(--gold)]">{i < 5 ? `S${i + 1}` : "Ficha"}</span>
              {f.f}
            </li>
          ))}
        </ol>
        {pasaIntercambio && (
          <p className="mt-2 flex items-center gap-1.5 text-[0.85rem] text-[var(--yo)]" role="alert">
            <PixelIcon name="bang" size={10} /> La ficha final cae después del intercambio (24 dic). Acorta el intervalo.
          </p>
        )}

        <div className="mt-5 border-t-[3px] border-[var(--linea)] pt-4">
          {!confirmar ? (
            <button type="button" className="px-btn w-full !text-[1.1rem]" style={{ ["--bg" as string]: "var(--cta)", color: "var(--cream)" }} onClick={() => setConfirmar(true)}>
              Empezar la temporada
            </button>
          ) : (
            <div className="px-panel p-3" style={{ ["--bc" as string]: "var(--gold)", ["--bg" as string]: "var(--noche)" }} role="alertdialog" aria-labelledby="conf-emp">
              <p id="conf-emp" className="text-[0.95rem]">
                Se hará el <b>sorteo</b> y se <b>cerrará la puerta</b>: nadie más podrá entrar. No se puede deshacer.
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" className="px-btn flex-1" style={{ ["--bg" as string]: "var(--noche-3)", color: "var(--cream)" }} onClick={() => setConfirmar(false)} autoFocus>
                  Todavía no
                </button>
                <button type="button" className="px-btn flex-1" style={{ ["--bg" as string]: "var(--cta)", color: "var(--cream)" }} disabled title="Vista de diseño: no hace el sorteo">
                  Sí, empezar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="px-panel p-5" aria-label="Agentes">
        <div role="tablist" aria-label="Vista de agentes" className="flex gap-1">
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
              className="min-h-11 flex-1 px-2 font-pixel text-[0.85rem]"
              style={pestana === id ? { background: "var(--gold)", color: "var(--ink)" } : { background: "var(--noche)", color: "var(--texto-suave)" }}
            >
              {txt}
            </button>
          ))}
        </div>

        {pestana === "avance" ? (
          <div role="tabpanel" id="pan-avance" aria-labelledby="tab-avance" className="mt-3">
            <p className="text-[0.9rem] text-[var(--texto-suave)]">
              <b className="text-[var(--cream)]">{agentes.length}/{capacidad}</b> agentes en el árbol · fichas completas: {agentes.length}
            </p>
            <ul className="no-scrollbar mt-2 max-h-[340px] overflow-y-auto text-[0.9rem]">
              {[...agentes].sort((a, b) => a.alias.localeCompare(b.alias)).map((a) => (
                <li key={a.alias} className="flex items-center justify-between border-b border-[var(--linea)] py-2">
                  <span>{a.alias}</span>
                  <span className="text-[var(--texto-tenue)]">{NOMBRES[a.stage - 1]}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div role="tabpanel" id="pan-claves" aria-labelledby="tab-claves" className="mt-3">
            <p className="text-[0.9rem] text-[var(--texto-suave)]">Reinicia la contraseña de quien la olvidó. Aquí no se ve su alias ni su avance.</p>
            <ul className="no-scrollbar mt-2 max-h-[340px] overflow-y-auto text-[0.9rem]">
              {usuarios.map((u) => (
                <li key={u} className="flex items-center justify-between gap-2 border-b border-[var(--linea)] py-1.5">
                  <span>@{u}</span>
                  <button type="button" className="min-h-11 px-3 font-pixel text-[0.8rem] text-[var(--gold)] underline-offset-4 hover:underline" disabled title="Vista de diseño">
                    Reiniciar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-4 flex gap-2 bg-[var(--noche)] p-3 text-[0.82rem] text-[var(--texto-suave)]">
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
      <label htmlFor={id} className="px-label !text-[0.85rem]">{label}</label>
      {children}
      {hint && <p className="px-hint">{hint}</p>}
    </div>
  );
}
