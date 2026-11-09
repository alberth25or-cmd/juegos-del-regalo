"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar } from "@/components/rpg/PixelSprite";
import { Retrato } from "@/components/rpg/Retrato";
import { Aviso } from "@/components/ui/Pantalla";
import { api } from "@/lib/cliente/api";
import type { EstadoVotacion, ResultadoRonda, Votante } from "@/lib/server/votacion";

const SONDEO_MS = 5000;

function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s >= 3600) {
    const h = Math.floor(s / 3600);
    return `${h} h ${Math.floor((s % 3600) / 60)} min`;
  }
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** «¿Quién es más probable…?»: votar, ver quién falta y revelar con comentario del Auditor. */
export function Votacion({ inicial, yo }: { inicial: EstadoVotacion; yo: string }) {
  const [e, setE] = useState(inicial);
  const [desfase, setDesfase] = useState(() => inicial.ronda.ahora - Date.now());
  const [ahora, setAhora] = useState(() => Date.now());
  const [elegido, setElegido] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const r = await api<{ estado: EstadoVotacion }>("/api/votacion", { intentos: 1, tope: 8000 });
    if (r.ok) {
      setE((prev) => {
        if (prev.ronda.clave !== r.estado.ronda.clave) setElegido(null);
        return r.estado;
      });
      setDesfase(r.estado.ronda.ahora - Date.now());
    }
  }, []);

  // Sondeo corto mientras la pantalla está visible + reloj local para la cuenta regresiva.
  useEffect(() => {
    const t = window.setInterval(() => document.visibilityState === "visible" && void cargar(), SONDEO_MS);
    const reloj = window.setInterval(() => setAhora(Date.now()), 1000);
    const vis = () => document.visibilityState === "visible" && void cargar();
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.clearInterval(t);
      window.clearInterval(reloj);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [cargar]);

  const resta = e.ronda.cierra - (ahora + desfase);
  useEffect(() => {
    if (resta <= 0) {
      const t = window.setTimeout(() => void cargar(), 800);
      return () => window.clearTimeout(t);
    }
  }, [resta <= 0, cargar]); // eslint-disable-line react-hooks/exhaustive-deps

  const votar = async () => {
    if (!elegido || enviando) return;
    setEnviando(true);
    setError(null);
    const r = await api<{ estado: EstadoVotacion }>("/api/votacion", { method: "POST", body: { clave: e.ronda.clave, objetivo: elegido }, tope: 12_000 });
    setEnviando(false);
    if (r.ok) {
      setE(r.estado);
      setDesfase(r.estado.ronda.ahora - Date.now());
    } else {
      setError(r.error);
      void cargar();
    }
  };

  const nombre = (id: string) => e.jugadores.find((j) => j.id === id)?.nombre ?? "Alguien";
  const opciones = e.jugadores.filter((j) => j.id !== yo);
  const pct = e.total ? Math.round((e.votaron / e.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Pregunta */}
      <div className="px-box flex items-center gap-3 p-3" style={{ ["--bg" as string]: "var(--cream-2)" }}>
        <Retrato npc="auditor" size={64} className="shrink-0" />
        <div className="min-w-0">
          <p className="px-hint">El Auditor pregunta:</p>
          <p className="font-pixel text-[1.25rem] leading-snug">{e.ronda.pregunta}</p>
        </div>
      </div>

      {/* Progreso */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 text-[0.85rem]">
          <span>
            🗳️ <b>{e.votaron}</b> de {e.total} ya votaron
          </span>
          <span className="px-chip !text-[0.75rem]" style={{ ["--chip" as string]: "var(--mint)" }}>
            {e.prueba ? `⏱ nueva pregunta en ${mmss(resta)}` : `Cierra en ${mmss(resta)}`}
          </span>
        </div>
        <div className="h-3 w-full bg-white" style={{ boxShadow: "0 0 0 2px var(--ink)" }} aria-hidden>
          <div className="h-full transition-[width] duration-500" style={{ width: `${pct}%`, background: "var(--gold)" }} />
        </div>
      </div>

      {error && <Aviso tono="error">{error}</Aviso>}
      {e.motivo && <Aviso>{e.motivo}</Aviso>}

      {/* Votar */}
      {e.puedeVotar && (
        <div className="flex flex-col gap-3">
          <p className="font-pixel">Toca a quien elijas (tu voto es secreto):</p>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {opciones.map((j) => (
              <li key={j.id}>
                <Tarjeta j={j} activo={elegido === j.id} onClick={() => setElegido(j.id)} />
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="px-btn shine sticky bottom-3"
            disabled={!elegido || enviando}
            onClick={votar}
            style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}
          >
            {enviando ? "Enviando…" : elegido ? `Votar por ${nombre(elegido)}` : "Elige a alguien"}
          </button>
        </div>
      )}

      {/* Ya votó, esperando */}
      {e.miVoto && !e.resultado && (
        <div className="px-box anim-pop flex flex-col items-center gap-2 p-4 text-center">
          <p className="font-pixel text-lg">Votaste por {nombre(e.miVoto)} 🤫</p>
          <p className="px-hint">Los resultados se revelan cuando voten todos o cuando cierre la pregunta. Ganaste +10 monedas.</p>
        </div>
      )}

      {e.resultado && <Resultado r={e.resultado} nombre={nombre} jugadores={e.jugadores} titulo="Resultados" miVoto={e.miVoto} />}

      {e.anterior && (
        <details className="px-box p-3" style={{ ["--bg" as string]: "#fff" }}>
          <summary className="cursor-pointer font-pixel">Pregunta anterior</summary>
          <div className="mt-3">
            <Resultado r={e.anterior} nombre={nombre} jugadores={e.jugadores} titulo={e.anterior.pregunta} />
          </div>
        </details>
      )}
    </div>
  );
}

function Tarjeta({ j, activo, onClick }: { j: Votante; activo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className="flex w-full flex-col items-center gap-1 px-1 py-2 transition-transform active:translate-y-0.5"
      style={{ background: activo ? "var(--gold)" : "#fff", boxShadow: activo ? "0 0 0 3px var(--ink), 0 4px 0 var(--ink)" : "0 0 0 2px var(--ink)" }}
    >
      <span className="flex h-12 w-11 items-end justify-center bg-[var(--sky)]">
        <Avatar config={j.avatar} size={34} />
      </span>
      <span className="w-full truncate text-center font-pixel text-[0.8rem]">{j.nombre}</span>
    </button>
  );
}

function Resultado({ r, nombre, jugadores, titulo, miVoto }: { r: ResultadoRonda; nombre: (id: string) => string; jugadores: Votante[]; titulo: string; miVoto?: string | null }) {
  const max = r.conteo[0]?.votos ?? 1;
  return (
    <div className="flex flex-col gap-3">
      <p className="font-pixel text-lg">{titulo}</p>
      <ol className="flex flex-col gap-2">
        {r.conteo.slice(0, 6).map((c, i) => {
          const j = jugadores.find((x) => x.id === c.id);
          return (
            <li key={c.id} className="anim-pop flex items-center gap-2" style={{ animationDelay: `${i * 120}ms` }}>
              <span className="w-6 text-center font-pixel">{i === 0 ? "👑" : i + 1}</span>
              <span className="flex h-10 w-9 shrink-0 items-end justify-center bg-[var(--sky)]">{j && <Avatar config={j.avatar} size={28} />}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-pixel text-[0.9rem]">
                  {nombre(c.id)}
                  {miVoto === c.id ? " · tu voto" : ""}
                </span>
                <span className="mt-0.5 block h-2.5 bg-white" style={{ boxShadow: "0 0 0 2px var(--ink)" }}>
                  <span className="block h-full" style={{ width: `${(c.votos / max) * 100}%`, background: i === 0 ? "var(--cherry)" : "var(--lavender)" }} />
                </span>
              </span>
              <span className="w-8 text-right font-pixel">{c.votos}</span>
            </li>
          );
        })}
      </ol>
      <div className="flex items-start gap-2">
        <Retrato npc="auditor" size={44} className="shrink-0" />
        <p className="px-box px-3 py-2 text-[0.9rem]" style={{ ["--bg" as string]: "var(--cream-2)" }}>
          {r.comentario}
        </p>
      </div>
      <p className="px-hint">{r.votaron} voto(s) en total.</p>
    </div>
  );
}
