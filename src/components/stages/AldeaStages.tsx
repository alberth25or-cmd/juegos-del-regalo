"use client";

import { useEffect, useRef, useState } from "react";
import { Cabeza } from "./Cabeza";
import { CasaStage } from "./CasaStage";
import { DetalleStage } from "./DetalleStage";
import { cuantas, faltanHoy, textoCerrada, type Agente, type Stage } from "./datosEjemplo";

/*
 * Geometría en "unidades de casa": una casa mide 100 × 110, cada columna 115 de ancho y las
 * columnas impares bajan 20. Todo se multiplica por --c (CSS), así que camino, casas y suelo
 * escalan juntos y la escena no se desarma al alejar o acercar la página.
 */
const PASO = 115;
const OLA = 20;
const BASE = 106;

/** Sendero que pasa por la puerta de cada casa; `hasta` corta el tramo en esa casa. */
function camino(n: number, hasta = n) {
  const pts: [number, number][] = [[0, BASE + OLA / 2]];
  for (let i = 0; i < n; i++) pts.push([PASO / 2 + PASO * i, BASE + (i % 2 ? OLA : 0)]);
  pts.push([PASO * n, BASE + OLA / 2]);
  const fin = Math.min(pts.length - 1, hasta + 1);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i <= fin; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    const k = (b[0] - a[0]) * 0.5;
    d += ` C${a[0] + k} ${a[1]} ${b[0] - k} ${b[1]} ${b[0]} ${b[1]}`;
  }
  return d;
}

/**
 * Aldea de stages: cada stage es una casa de Snowville unida por un sendero en la nieve.
 * Todas las casas están abiertas desde el "Empezar" y cada día traen preguntas nuevas;
 * solo la ficha del amigo secreto espera su fecha. Tocar una casa abre su letrero abajo. En celular la aldea se desliza; en pantallas anchas
 * cabe completa y el suelo nevado llena todo el ancho (sin bordes cortados).
 */
export function AldeaStages({ stages, titulo, subtitulo, yo }: { stages: Stage[]; titulo: string; subtitulo: string; yo: Agente }) {
  // Empieza en la primera casa con preguntas pendientes hoy (o en la primera, si estás al día).
  const iActual = Math.max(
    0,
    stages.findIndex((s) => s.estado === "nuevas"),
  );
  const [sel, setSel] = useState(iActual);
  const pista = useRef<HTMLDivElement>(null);
  const casas = useRef<(HTMLButtonElement | null)[]>([]);
  const n = stages.length;
  const d = camino(n);
  // Tramo abierto (todas las casas menos la ficha cerrada): bastón de caramelo, como el riel de la barra.
  const abiertas = stages.filter((s) => s.estado !== "cerrada").length;
  const hecho = camino(n, abiertas - 1);

  const centrar = (i: number, suave = true) => {
    const p = pista.current;
    const el = casas.current[i];
    if (!p || !el) return;
    const col = el.parentElement as HTMLElement;
    p.scrollTo({ left: col.offsetLeft - (p.clientWidth - col.clientWidth) / 2, behavior: suave ? "smooth" : "instant" });
  };

  useEffect(() => centrar(iActual, false), [iActual]);

  const elegir = (i: number, foco = false) => {
    const j = Math.min(n - 1, Math.max(0, i));
    setSel(j);
    centrar(j);
    if (foco) casas.current[j]?.focus({ preventScroll: true });
  };

  return (
    <section aria-label="Aldea de stages" className="aldea-escena">
      <div className="relative z-[1] px-4 pt-4 text-center">
        <p className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-[var(--oro)]">{subtitulo}</p>
        <h1 className="f-titulo mt-1 text-[1.9rem] font-semibold leading-tight [text-wrap:balance] lg:text-[2.4rem]">{titulo}</h1>
      </div>

      <div className="aldea-marco">
        <div className="aldea-suelo" aria-hidden />
        <div ref={pista} className="aldea">
          <div
            className="aldea-pista"
            style={{ ["--n" as string]: n }}
            role="tablist"
            aria-label="Stages de la temporada"
            onKeyDown={(e) => {
              const paso = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
              if (!paso) return;
              e.preventDefault();
              elegir(sel + paso, true);
            }}
          >
            <svg className="aldea-camino" viewBox={`0 0 ${PASO * n} ${110 + OLA + 10}`} preserveAspectRatio="none" aria-hidden>
              <path d={d} fill="none" stroke="#c9d6f2" strokeWidth="10" strokeLinecap="round" />
              <path d={d} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
              <path d={d} fill="none" stroke="#9fb0da" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="1 7" />
              <path d={hecho} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
              <path d={hecho} fill="none" stroke="#e8283c" strokeWidth="7" strokeDasharray="6 6" />
            </svg>

            {stages.map((s, i) => {
              const titulo = s.n === 6 ? s.nombre : `${s.n}. ${s.nombre}`;
              return (
                <div key={s.n} className="aldea-col" data-impar={i % 2 === 1}>
                  <button
                    ref={(el) => {
                      casas.current[i] = el;
                    }}
                    id={`casa-${s.n}`}
                    type="button"
                    role="tab"
                    aria-selected={i === sel}
                    aria-controls="letrero-stage"
                    tabIndex={i === sel ? 0 : -1}
                    className="casa"
                    data-estado={s.estado}
                    onClick={() => elegir(i)}
                    aria-label={`${titulo}. ${nota(s)}`}
                  >
                    <CasaStage s={s} />
                    <span className="casa-nombre">
                      <span className="f-titulo">{s.n === 6 ? "★" : s.n}</span> {s.corto}
                    </span>
                    <span className="casa-nota">{s.estado === "cerrada" ? s.abre : s.n === 6 ? "Ver ficha" : s.porDia === 0 ? "—" : s.estado === "nuevas" ? `${faltanHoy(s)} nueva${faltanHoy(s) === 1 ? "" : "s"}` : "✓ Al día"}</span>
                  </button>
                  {i === iActual && (
                    <span className="aldea-tu" aria-hidden>
                      <Cabeza config={yo.avatar} size={18} yo />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-[2] px-4 pb-48 pt-2 lg:pb-56">
        <DetalleStage key={stages[sel].n} s={stages[sel]} id="letrero-stage" etiqueta={`casa-${stages[sel].n}`} />
      </div>
    </section>
  );
}

function nota(s: Stage) {
  if (s.estado === "cerrada") return textoCerrada(s);
  if (s.n === 6) return "Ver la ficha de tu amigo secreto";
  if (s.estado === "aldia") return "Al día: mañana salen más";
  return `Hoy: ${cuantas(faltanHoy(s), s.unidad)}`;
}
