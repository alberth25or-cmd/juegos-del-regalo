"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ResultadoJuego, type ResultadoServidor } from "@/components/games/ResultadoJuego";
import { Retrato } from "@/components/rpg/Retrato";
import { api } from "@/lib/cliente/api";

interface Pregunta {
  id: string;
  texto: string;
  opciones: string[];
}
export interface EquipoTrivia {
  id: string;
  nombre: string;
  color: string;
  emblema: string;
  integrantes: number;
  jugaron: number;
  promedio: number;
}

type Fase = "inicio" | "preparando" | "jugando" | "enviando" | "resultado";
const LETRAS = ["A", "B", "C", "D"];

/** Comentario del Auditor según aciertos (copia corta del catálogo: el navegador no importa el catálogo con respuestas). */
function veredicto(aciertos: number, total: number) {
  const r = total ? aciertos / total : 0;
  if (r === 1) return "Perfecto. Sospechosamente perfecto. Abriré una investigación por excelencia.";
  if (r >= 0.75) return "Aprobado con honores. Santa podría ascenderte… si tuviera presupuesto.";
  if (r >= 0.5) return "Aprobado. Raspando, como la contabilidad de la fábrica.";
  if (r >= 0.25) return "El tribunal te declara culpable de no saber. Puedes apelar en la próxima ronda.";
  return "Te salvó que nadie revisa estos formularios. Excepto yo.";
}

/**
 * Juicio del Polo Norte: 8 preguntas, 15 s cada una. El servidor manda las preguntas SIN
 * la respuesta correcta y corrige al final. Cuenta para tu equipo (promedio de integrantes).
 */
export function Trivia({ equiposIniciales, miEquipo, aviso, activo }: { equiposIniciales: EquipoTrivia[]; miEquipo: string | null; aviso?: string; activo: boolean }) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [segPorPregunta, setSegPorPregunta] = useState(15);
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [resta, setResta] = useState(15);
  const [resultado, setResultado] = useState<ResultadoServidor | null>(null);
  const [equipos, setEquipos] = useState(equiposIniciales);
  const [error, setError] = useState<string | null>(null);
  const [misRespuestas, setMisRespuestas] = useState<number[]>([]);
  const p = useRef<{ id: string; respuestas: number[]; inicioPregunta: number }>({ id: "", respuestas: [], inicioPregunta: 0 });

  const empezar = useCallback(async () => {
    setError(null);
    setResultado(null);
    setFase("preparando");
    const r = await api<{ attemptId: string; preguntas: Pregunta[]; segundosPorPregunta: number }>("/api/partidas", { body: { juego: "trivia" } });
    if (!r.ok) {
      setError(r.error);
      setFase("inicio");
      return;
    }
    p.current = { id: r.attemptId, respuestas: [], inicioPregunta: performance.now() };
    setPreguntas(r.preguntas);
    setSegPorPregunta(r.segundosPorPregunta);
    setI(0);
    setElegida(null);
    setResta(r.segundosPorPregunta);
    setFase("jugando");
  }, []);

  const enviar = useCallback(async () => {
    setFase("enviando");
    setMisRespuestas([...p.current.respuestas]);
    const r = await api<{ resultado: ResultadoServidor }>(`/api/partidas/${p.current.id}`, { body: { respuestas: p.current.respuestas }, idempotente: true, tope: 12_000 });
    if (r.ok) setResultado(r.resultado);
    else setError(r.error);
    setFase("resultado");
    const e = await api<{ equipos: EquipoTrivia[] }>("/api/trivia/equipos", { intentos: 1, tope: 8000 });
    if (e.ok) setEquipos(e.equipos);
  }, []);

  const responder = useCallback(
    (op: number) => {
      if (fase !== "jugando" || elegida !== null) return;
      setElegida(op);
      p.current.respuestas.push(op);
      window.setTimeout(() => {
        if (p.current.respuestas.length >= preguntas.length) void enviar();
        else {
          setI((x) => x + 1);
          setElegida(null);
          setResta(segPorPregunta);
          p.current.inicioPregunta = performance.now();
        }
      }, 450);
    },
    [fase, elegida, preguntas.length, enviar, segPorPregunta],
  );

  // Cuenta regresiva por pregunta: si se acaba, cuenta como sin respuesta (-1).
  useEffect(() => {
    if (fase !== "jugando" || elegida !== null) return;
    const t = window.setInterval(() => {
      const quedan = segPorPregunta - (performance.now() - p.current.inicioPregunta) / 1000;
      setResta(Math.max(0, Math.ceil(quedan)));
      if (quedan <= 0) {
        window.clearInterval(t);
        responder(-1);
      }
    }, 200);
    return () => window.clearInterval(t);
  }, [fase, elegida, segPorPregunta, responder, i]);

  const actual = preguntas[i];
  const correctas = (resultado?.detalle?.correctas as number[] | undefined) ?? null;
  const aciertos = (resultado?.detalle?.aciertos as number | undefined) ?? 0;

  return (
    <div className="flex flex-col gap-3">
      {aviso && <p className="px-hint text-center">{aviso}</p>}
      {error && (
        <p className="px-box px-3 py-2 text-[0.85rem]" role="alert" style={{ ["--bg" as string]: "#f3c9d1" }}>
          {error}
        </p>
      )}

      {(fase === "inicio" || fase === "preparando") && (
        <div className="flex flex-col gap-3">
          <div className="px-box flex items-center gap-3 p-3" style={{ ["--bg" as string]: "var(--cream-2)" }}>
            <Retrato npc="auditor" size={64} className="shrink-0" />
            <div className="text-[0.92rem]">
              <p className="font-pixel text-lg">El tribunal está en sesión</p>
              <p>8 preguntas, 15 segundos cada una. Acertar rápido da más puntaje.</p>
              <p className="px-hint mt-1">Tu mejor partida del día cuenta para el promedio de tu equipo.</p>
            </div>
          </div>
          {activo && (
            <button type="button" onClick={empezar} disabled={fase === "preparando"} className="px-btn shine" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
              {fase === "preparando" ? "Preparando el juicio…" : "▶ Empezar el juicio"}
            </button>
          )}
        </div>
      )}

      {fase === "jugando" && actual && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[0.85rem]">
            <span className="font-pixel">
              Pregunta {i + 1} de {preguntas.length}
            </span>
            <span className="px-chip" style={{ ["--chip" as string]: resta <= 5 ? "#f3c9d1" : "var(--mint)" }}>
              ⏱ {resta}s
            </span>
          </div>
          <div className="h-2.5 w-full bg-white" style={{ boxShadow: "0 0 0 2px var(--ink)" }} aria-hidden>
            <div className="h-full transition-[width] duration-200 ease-linear" style={{ width: `${(resta / segPorPregunta) * 100}%`, background: resta <= 5 ? "var(--cherry)" : "var(--gold)" }} />
          </div>
          <p key={actual.id} className="px-box anim-pop p-4 font-pixel text-[1.15rem] leading-snug" style={{ ["--bg" as string]: "#fff" }}>
            {actual.texto}
          </p>
          <div className="grid gap-2">
            {actual.opciones.map((o, k) => (
              <button
                key={k}
                type="button"
                onClick={() => responder(k)}
                disabled={elegida !== null}
                className="flex min-h-[52px] items-center gap-3 px-3 py-2 text-left transition-transform active:translate-y-0.5"
                style={{ background: elegida === k ? "var(--gold)" : "#fff", boxShadow: "0 0 0 2px var(--ink), 0 4px 0 var(--ink)" }}
              >
                <span className="font-pixel text-lg">{LETRAS[k]}</span>
                <span className="text-[0.95rem]">{o}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {fase === "enviando" && <p className="font-pixel text-center">El tribunal delibera…</p>}

      {fase === "resultado" && (
        <ResultadoJuego
          r={resultado}
          resumen={resultado?.valida ? <span>{aciertos} de {preguntas.length} correctas</span> : undefined}
          comentario={veredicto(aciertos, preguntas.length || 8)}
          onOtraVez={empezar}
          extra={
            correctas && (
              <details className="px-box p-3" style={{ ["--bg" as string]: "#fff" }}>
                <summary className="cursor-pointer font-pixel">Ver respuestas</summary>
                <ol className="mt-2 flex flex-col gap-2 text-[0.85rem]">
                  {preguntas.map((q, k) => {
                    const mia = misRespuestas[k];
                    const bien = mia === correctas[k];
                    return (
                      <li key={q.id}>
                        <p className="font-semibold">
                          {bien ? "✅" : "❌"} {q.texto}
                        </p>
                        <p className="text-[var(--ink-soft)]">
                          Correcta: {q.opciones[correctas[k]]}
                          {!bien && (mia >= 0 ? ` · tú: ${q.opciones[mia]}` : " · sin responder")}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </details>
            )
          }
        />
      )}

      <EquiposHoy equipos={equipos} miEquipo={miEquipo} />
    </div>
  );
}

function EquiposHoy({ equipos: todos, miEquipo }: { equipos: EquipoTrivia[]; miEquipo: string | null }) {
  const equipos = todos.filter((e) => e.integrantes > 0);
  if (equipos.length === 0) return <p className="px-hint">Cuando el organizador arme los equipos, aquí verás quién va ganando la trivia de hoy.</p>;
  return (
    <div className="flex flex-col gap-2">
      <p className="font-pixel">Equipos hoy (promedio por integrante)</p>
      <ol className="flex flex-col gap-1.5">
        {equipos.map((e, k) => (
          <li key={e.id} className="px-box flex items-center gap-2 px-2 py-1.5" style={{ ["--bg" as string]: e.id === miEquipo ? "var(--cream-2)" : "#fff", margin: "2px 0" }}>
            <span className="w-6 text-center font-pixel">{["🥇", "🥈", "🥉"][k] ?? k + 1}</span>
            <span className="flex h-8 w-8 items-center justify-center text-lg" style={{ background: e.color, boxShadow: "0 0 0 2px var(--ink)" }}>
              {e.emblema}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate font-pixel">
                {e.nombre}
                {e.id === miEquipo ? " (tu equipo)" : ""}
              </span>
              <span className="text-[0.75rem] text-[var(--ink-soft)]">
                jugaron {e.jugaron} de {e.integrantes}
              </span>
            </span>
            <span className="font-pixel text-lg tabular-nums">{e.promedio}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
