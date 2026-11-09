"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Avatar } from "@/components/rpg/PixelSprite";
import { Aviso } from "@/components/ui/Pantalla";
import { api } from "@/lib/cliente/api";

interface Jug {
  id: string;
  username: string;
  displayName: string;
  avatar: unknown;
  role: string;
  status: string;
  teamId: string | null;
  monedas: number;
}
interface Eq {
  id: string;
  name: string;
  color: string;
  emblem: string;
}

const ESTADO: Record<string, { t: string; c: string }> = {
  pending: { t: "Pendiente", c: "var(--gold)" },
  active: { t: "Activo", c: "var(--mint)" },
  inactive: { t: "Pausado", c: "#d9d2c4" },
  rejected: { t: "Rechazado", c: "#f3c9d1" },
};

/** Panel del organizador. Cada botón llama al servidor, que vuelve a comprobar el rol. */
export function PanelAdmin({ yoId, jugadores, equipos, desde, hasta, prueba }: { yoId: string; jugadores: Jug[]; equipos: Eq[]; desde: string; hasta: string; prueba?: { dia: number; total: number } | null }) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; t: string } | null>(null);

  const accion = async (clave: string, body: Record<string, unknown>, exito?: string) => {
    setOcupado(clave);
    setMsg(null);
    const r = await api("/api/admin", { body });
    setOcupado(null);
    if (!r.ok) return setMsg({ tipo: "error", t: r.error });
    if (exito) setMsg({ tipo: "ok", t: exito });
    startTransition(() => router.refresh());
  };

  const pendientes = jugadores.filter((j) => j.status === "pending");
  const activos = jugadores.filter((j) => j.status === "active");
  const otros = jugadores.filter((j) => j.status !== "pending" && j.status !== "active");
  const sinEquipo = activos.filter((j) => !j.teamId).length;
  const deshabilitado = !!ocupado || pendiente;

  return (
    <div className="flex flex-col gap-6">
      {msg && <Aviso tono={msg.tipo}>{msg.t}</Aviso>}

      {prueba && <SimularDia dia={prueba.dia} total={prueba.total} disabled={deshabilitado} onCambiar={(d) => accion("simular", { accion: "simularDia", dia: d }, `Ahora todos ven el día ${d}.`)} />}

      {/* Solicitudes */}
      <section>
        <h2 className="font-pixel text-xl">Solicitudes ({pendientes.length})</h2>
        {pendientes.length === 0 ? (
          <p className="px-hint mt-1">No hay nadie esperando. Comparte el enlace de invitación.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {pendientes.map((j) => (
              <li key={j.id} className="px-box flex flex-wrap items-center gap-2 px-3 py-2" style={{ ["--bg" as string]: "#fff", margin: "2px 0" }}>
                <Avatar config={j.avatar} size={30} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block font-pixel">{j.displayName}</span>
                  <span className="block text-[0.75rem] text-[var(--ink-soft)]">@{j.username}</span>
                </span>
                <span className="flex w-full gap-2">
                  <button type="button" disabled={deshabilitado} className="px-btn flex-1 !min-h-[40px] !text-[0.9rem]" style={{ ["--bg" as string]: "var(--mint)" }} onClick={() => accion(`a${j.id}`, { accion: "aprobar", playerId: j.id }, `${j.displayName} ya puede jugar.`)}>
                    {ocupado === `a${j.id}` ? "…" : "✓ Aprobar"}
                  </button>
                  <button
                    type="button"
                    disabled={deshabilitado}
                    className="px-btn !min-h-[40px] !text-[0.9rem]"
                    style={{ ["--bg" as string]: "#f3c9d1" }}
                    onClick={() => window.confirm(`¿Rechazar a ${j.displayName}?`) && accion(`r${j.id}`, { accion: "rechazar", playerId: j.id })}
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Equipos */}
      <section>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-pixel text-xl">Equipos</h2>
          <button
            type="button"
            disabled={deshabilitado || activos.length === 0}
            className="px-chip"
            style={{ ["--chip" as string]: "var(--gold)" }}
            onClick={() => window.confirm("Se reparten TODOS los jugadores activos al azar en equipos equilibrados. ¿Seguir?") && accion("repartir", { accion: "repartir" }, "Equipos sorteados.")}
          >
            🎲 Repartir al azar
          </button>
        </div>
        <p className="px-hint mt-1">{sinEquipo > 0 ? `${sinEquipo} jugador(es) activos sin equipo.` : "Todos los activos tienen equipo."} Puedes renombrar equipos tocando su nombre.</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {equipos.map((e) => (
            <button
              key={e.id}
              type="button"
              disabled={deshabilitado}
              className="px-box px-2 py-2 text-left"
              style={{ ["--bg" as string]: "#fff", margin: 2 }}
              onClick={() => {
                const nombre = window.prompt("Nuevo nombre del equipo", e.name);
                if (nombre && nombre.trim() && nombre !== e.name) void accion(`n${e.id}`, { accion: "renombrarEquipo", teamId: e.id, nombre }, "Equipo renombrado.");
              }}
            >
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center" style={{ background: e.color, boxShadow: "0 0 0 2px var(--ink)" }}>
                  {e.emblem}
                </span>
                <span className="min-w-0 flex-1 truncate font-pixel text-[0.85rem]">{e.name}</span>
              </span>
              <span className="mt-1 block text-[0.72rem] text-[var(--ink-soft)]">{activos.filter((j) => j.teamId === e.id).length} integrante(s)</span>
            </button>
          ))}
        </div>
      </section>

      {/* Jugadores */}
      <section>
        <h2 className="font-pixel text-xl">Jugadores ({activos.length})</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {[...activos, ...otros].map((j) => (
            <li key={j.id} className="px-box flex flex-col gap-2 px-3 py-2" style={{ ["--bg" as string]: "#fff", margin: "2px 0" }}>
              <span className="flex items-center gap-2">
                <Avatar config={j.avatar} size={28} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate font-pixel">
                    {j.displayName}
                    {j.role === "admin" ? " · organizador" : ""}
                  </span>
                  <span className="block text-[0.72rem] text-[var(--ink-soft)]">
                    @{j.username} · 🪙 {j.monedas}
                  </span>
                </span>
                <span className="px-chip !text-[0.7rem]" style={{ ["--chip" as string]: ESTADO[j.status]?.c }}>
                  {ESTADO[j.status]?.t ?? j.status}
                </span>
              </span>
              {j.status === "active" && (
                <span className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`eq-${j.id}`}>
                    Equipo de {j.displayName}
                  </label>
                  <select
                    id={`eq-${j.id}`}
                    className="px-input !min-h-[38px] !w-auto flex-1 !py-1 text-[0.85rem]"
                    value={j.teamId ?? ""}
                    disabled={deshabilitado}
                    onChange={(e) => accion(`e${j.id}`, { accion: "asignarEquipo", playerId: j.id, teamId: e.target.value })}
                  >
                    <option value="">Sin equipo</option>
                    {equipos.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.emblem} {e.name}
                      </option>
                    ))}
                  </select>
                  {j.id !== yoId && (
                    <>
                      <button
                        type="button"
                        className="px-chip !text-[0.72rem]"
                        disabled={deshabilitado}
                        onClick={() => {
                          const pin = window.prompt(`PIN nuevo de 4 números para ${j.displayName} (mándaselo por privado):`);
                          if (pin) void accion(`p${j.id}`, { accion: "reiniciarPin", playerId: j.id, pin }, `PIN de ${j.displayName} reiniciado. Su sesión en otros celulares se cerró.`);
                        }}
                      >
                        🔑 PIN
                      </button>
                      <button
                        type="button"
                        className="px-chip !text-[0.72rem]"
                        disabled={deshabilitado}
                        onClick={() => {
                          const n = window.prompt(`Ajuste de monedas para ${j.displayName} (ej. 20 o -15):`);
                          if (!n) return;
                          const motivo = window.prompt("Motivo (queda registrado):");
                          if (motivo) void accion(`j${j.id}`, { accion: "ajustar", playerId: j.id, puntos: Number(n), motivo }, "Ajuste registrado.");
                        }}
                      >
                        ± 🪙
                      </button>
                      <button
                        type="button"
                        className="px-chip !text-[0.72rem]"
                        disabled={deshabilitado}
                        onClick={() => window.confirm(`¿Pausar a ${j.displayName}? No podrá jugar hasta que lo reactives.`) && accion(`d${j.id}`, { accion: "desactivar", playerId: j.id })}
                      >
                        ⏸
                      </button>
                    </>
                  )}
                </span>
              )}
              {(j.status === "inactive" || j.status === "rejected") && (
                <button type="button" className="px-chip self-start !text-[0.72rem]" disabled={deshabilitado} onClick={() => accion(`a${j.id}`, { accion: "aprobar", playerId: j.id }, `${j.displayName} reactivado.`)}>
                  ↺ Reactivar
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Temporada */}
      <FechasForm desde={desde} hasta={hasta} disabled={deshabilitado} onGuardar={(d, h) => accion("fechas", { accion: "fechas", desde: d, hasta: h }, "Fechas actualizadas.")} />
    </div>
  );
}

function SimularDia({ dia, total, disabled, onCambiar }: { dia: number; total: number; disabled: boolean; onCambiar: (d: number) => void }) {
  return (
    <section className="px-box p-3" style={{ ["--bg" as string]: "var(--lavender)" }}>
      <h2 className="font-pixel text-xl">🧪 Temporada de prueba</h2>
      <p className="mt-1 text-[0.85rem]">Simula cualquier día para probar el calendario con tus amigos: cambian las frases de los NPCs, el arco de la historia y los eventos. No hay topes diarios de monedas.</p>
      <div className="mt-3 flex items-center gap-2">
        <button type="button" className="px-btn !min-h-[44px] !px-3" disabled={disabled || dia <= 1} onClick={() => onCambiar(dia - 1)} aria-label="Día anterior">
          ◀
        </button>
        <span className="flex-1 text-center font-pixel text-2xl">
          Día {dia} <span className="text-[0.9rem]">de {total}</span>
        </span>
        <button type="button" className="px-btn !min-h-[44px] !px-3" style={{ ["--bg" as string]: "var(--gold)" }} disabled={disabled || dia >= total} onClick={() => onCambiar(dia + 1)} aria-label="Día siguiente">
          ▶
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {[1, 5, 10, 15, 20, 25, 30]
          .filter((d) => d <= total)
          .map((d) => (
            <button key={d} type="button" className="px-chip !text-[0.75rem]" style={{ ["--chip" as string]: d === dia ? "var(--gold)" : "#fff" }} disabled={disabled} onClick={() => onCambiar(d)}>
              Día {d}
            </button>
          ))}
      </div>
    </section>
  );
}

function FechasForm({ desde, hasta, disabled, onGuardar }: { desde: string; hasta: string; disabled: boolean; onGuardar: (d: string, h: string) => void }) {
  const [d, setD] = useState(desde);
  const [h, setH] = useState(hasta);
  return (
    <section>
      <h2 className="font-pixel text-xl">Fechas de la temporada</h2>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div>
          <label className="px-label" htmlFor="desde">
            Primer día
          </label>
          <input id="desde" type="date" className="px-input" value={d} onChange={(e) => setD(e.target.value)} disabled={disabled} />
        </div>
        <div>
          <label className="px-label" htmlFor="hasta">
            Último día
          </label>
          <input id="hasta" type="date" className="px-input" value={h} onChange={(e) => setH(e.target.value)} disabled={disabled} />
        </div>
      </div>
      <p className="px-hint mt-1">Hora de Lima. Las monedas del ranking solo cuentan entre estas fechas.</p>
      <button type="button" className="px-btn mt-2 w-full !min-h-[44px]" style={{ ["--bg" as string]: "var(--lavender)" }} disabled={disabled || (d === desde && h === hasta)} onClick={() => onGuardar(d, h)}>
        Guardar fechas
      </button>
    </section>
  );
}
