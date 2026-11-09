"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OBJETO_SPRITES } from "@/components/games/giftSprites";
import { Dato, ResultadoJuego, type ResultadoServidor } from "@/components/games/ResultadoJuego";
import { NpcSprite, PixelSprite } from "@/components/rpg/PixelSprite";
import type { NpcId } from "@/features/contenido/npcs";
import { CARTAS, mazo, PARES, puntuarMemory, type Cara } from "@/features/games/memory";
import { api } from "@/lib/cliente/api";

type Fase = "inicio" | "preparando" | "jugando" | "enviando" | "resultado";
const NPCS: readonly string[] = ["santa", "rudolf", "duende", "muneco", "auditor"];

function CaraCarta({ cara }: { cara: Cara }) {
  if (NPCS.includes(cara)) return <NpcSprite id={cara as NpcId} size={46} />;
  return <PixelSprite sprite={OBJETO_SPRITES[cara as keyof typeof OBJETO_SPRITES]} size={40} />;
}

/**
 * Memory Gifts: 16 cartas, 8 pares. El mazo sale de la semilla del servidor; al terminar
 * se mandan los volteos y el servidor recalcula movimientos, tiempo y puntaje.
 */
export function Memory({ modo, stats, aviso }: { modo: "real" | "practica"; stats: { record: number; mejorHoy: number; monedasHoy: number } | null; aviso?: string }) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [cartas, setCartas] = useState<Cara[]>([]);
  const [abiertas, setAbiertas] = useState<number[]>([]);
  const [resueltas, setResueltas] = useState<Set<number>>(new Set());
  const [movimientos, setMovimientos] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [resultado, setResultado] = useState<ResultadoServidor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mis, setMis] = useState(stats);
  const partida = useRef<{ id: string | null; volteos: number[]; inicio: number; bloqueado: boolean }>({ id: null, volteos: [], inicio: 0, bloqueado: false });

  const empezar = useCallback(async () => {
    setError(null);
    setResultado(null);
    setFase("preparando");
    let seed = Math.floor(Math.random() * 2 ** 31);
    let id: string | null = null;
    if (modo === "real") {
      const r = await api<{ attemptId: string; seed: number }>("/api/partidas", { body: { juego: "memory" } });
      if (!r.ok) {
        setError(r.error);
        setFase("inicio");
        return;
      }
      seed = r.seed;
      id = r.attemptId;
    }
    partida.current = { id, volteos: [], inicio: performance.now(), bloqueado: false };
    setCartas(mazo(seed));
    setAbiertas([]);
    setResueltas(new Set());
    setMovimientos(0);
    setSegundos(0);
    setFase("jugando");
  }, [modo]);

  // Reloj
  useEffect(() => {
    if (fase !== "jugando") return;
    const t = window.setInterval(() => setSegundos(Math.floor((performance.now() - partida.current.inicio) / 1000)), 250);
    return () => window.clearInterval(t);
  }, [fase]);

  const terminar = useCallback(async () => {
    const p = partida.current;
    if (!p.id) {
      setResultado(null);
      setFase("resultado");
      return;
    }
    setFase("enviando");
    const r = await api<{ resultado: ResultadoServidor }>(`/api/partidas/${p.id}`, { body: { volteos: p.volteos }, idempotente: true, tope: 12_000 });
    if (r.ok) {
      setResultado(r.resultado);
      if (r.resultado.valida) setMis({ record: r.resultado.record, mejorHoy: r.resultado.mejorDelDia, monedasHoy: r.resultado.monedasHoy });
    } else setError(r.error);
    setFase("resultado");
  }, []);

  const voltear = (i: number) => {
    const p = partida.current;
    if (fase !== "jugando" || p.bloqueado || resueltas.has(i) || abiertas.includes(i)) return;
    p.volteos.push(i);
    if (abiertas.length === 0) {
      setAbiertas([i]);
      return;
    }
    const a = abiertas[0];
    setAbiertas([a, i]);
    setMovimientos((m) => m + 1);
    if (cartas[a] === cartas[i]) {
      const nuevas = new Set(resueltas);
      nuevas.add(a);
      nuevas.add(i);
      window.setTimeout(() => {
        setResueltas(nuevas);
        setAbiertas([]);
        if (nuevas.size === CARTAS) void terminar();
      }, 280);
    } else {
      p.bloqueado = true;
      window.setTimeout(() => {
        setAbiertas([]);
        p.bloqueado = false;
      }, 750);
    }
  };

  const puntajeLocal = puntuarMemory(movimientos, segundos * 1000);

  return (
    <div className="flex flex-col gap-3">
      <div className="px-box flex items-center justify-around px-2 py-2 text-center" style={{ ["--bg" as string]: "#fff" }}>
        <Dato t="Pares" v={`${resueltas.size / 2}/${PARES}`} />
        <Dato t="Movimientos" v={movimientos} />
        <Dato t="Tiempo" v={`${segundos}s`} />
        {mis && <Dato t="Récord" v={mis.record} />}
      </div>

      {aviso && <p className="px-hint text-center">{aviso}</p>}
      {error && (
        <p className="px-box px-3 py-2 text-[0.85rem]" role="alert" style={{ ["--bg" as string]: "#f3c9d1" }}>
          {error}
        </p>
      )}

      {(fase === "inicio" || fase === "preparando") && (
        <div className="flex flex-col gap-3">
          <div className="px-box p-4 text-[0.92rem]" style={{ ["--bg" as string]: "var(--cream-2)" }}>
            <p className="font-pixel text-lg">Memoria del desastre</p>
            <p className="mt-1">El Auditor desordenó el inventario. Voltea dos cartas por turno y encuentra los 8 pares.</p>
            <p className="mt-1 px-hint">Menos movimientos y menos tiempo = más puntaje (máx. 1000). Tu mejor partida del día suma al ranking.</p>
          </div>
          <button type="button" onClick={empezar} disabled={fase === "preparando"} className="px-btn shine" style={{ ["--bg" as string]: "var(--cherry)", color: "var(--cream)" }}>
            {fase === "preparando" ? "Barajando…" : "▶ Jugar"}
          </button>
        </div>
      )}

      {(fase === "jugando" || fase === "enviando") && (
        <div className="grid grid-cols-4 gap-2" aria-label="Tablero de memoria">
          {cartas.map((c, i) => {
            const visible = abiertas.includes(i) || resueltas.has(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => voltear(i)}
                aria-label={visible ? c : "Carta boca abajo"}
                className="flex aspect-square items-center justify-center transition-transform duration-150 active:scale-95"
                style={{
                  background: resueltas.has(i) ? "var(--mint)" : visible ? "#fff" : "repeating-linear-gradient(45deg, var(--cherry) 0 8px, #a32c3a 8px 16px)",
                  boxShadow: "0 0 0 2px var(--ink), 0 4px 0 var(--ink)",
                  transform: visible ? "rotateY(0deg)" : undefined,
                }}
              >
                {visible ? (
                  <span className="anim-pop">
                    <CaraCarta cara={c} />
                  </span>
                ) : (
                  <span className="font-pixel text-2xl text-[var(--gold)]" style={{ textShadow: "0 2px 0 var(--ink)" }}>
                    ?
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {fase === "enviando" && <p className="font-pixel text-center">El Auditor está revisando tu partida…</p>}

      {fase === "resultado" && (
        <ResultadoJuego
          r={resultado ?? (modo === "practica" ? { valida: true, puntaje: puntajeLocal, mejorDelDia: 0, record: 0, monedas: 0, monedasHoy: 0, topeHoy: 0, pretemporada: true } : null)}
          resumen={
            <span>
              {movimientos} movimientos · {segundos} s{movimientos === PARES ? " · ¡perfecto!" : ""}
            </span>
          }
          comentario={movimientos <= PARES + 3 ? "Memoria de elefante. O de auditor, que es peor." : movimientos <= PARES + 10 ? "Aceptable. Los duendes tardan más en encontrar sus calcetines." : "Volteaste más cartas que formularios tengo yo. Y tengo muchos."}
          onOtraVez={empezar}
          extra={modo === "practica" ? <p className="px-hint text-center">Partida de práctica: no se guarda.</p> : undefined}
        />
      )}
    </div>
  );
}
