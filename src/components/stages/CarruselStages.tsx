"use client";

import { useEffect, useRef, useState } from "react";
import { TarjetaStage } from "./TarjetaStage";
import type { Stage } from "./datosEjemplo";

/**
 * Carrusel de stages (opción B). Scroll-snap nativo: en celular se desliza, en computadora
 * hay flechas y ← →. El stage actual empieza al centro; los vecinos se difuminan por distancia.
 */
export function CarruselStages({ stages, titulo, subtitulo }: { stages: Stage[]; titulo: string; subtitulo: string }) {
  const inicial = Math.max(0, stages.findIndex((s) => s.estado === "actual"));
  const [centro, setCentro] = useState(inicial);
  const pista = useRef<HTMLDivElement>(null);

  const ir = (i: number, suave = true) => {
    const p = pista.current;
    const el = p?.children[i] as HTMLElement | undefined;
    if (!el || !p) return;
    p.scrollTo({ left: el.offsetLeft - (p.clientWidth - el.clientWidth) / 2, behavior: suave ? undefined : "instant" });
  };

  // Al montar, el stage actual queda al centro sin animación.
  useEffect(() => ir(inicial, false), [inicial]);

  // El centro se calcula con la posición del scroll (igual con dedo, rueda o flechas).
  useEffect(() => {
    const p = pista.current;
    if (!p) return;
    let raf = 0;
    const medir = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mitad = p.scrollLeft + p.clientWidth / 2;
        let mejor = 0;
        let dist = Infinity;
        [...p.children].forEach((c, i) => {
          const el = c as HTMLElement;
          const d = Math.abs(el.offsetLeft + el.clientWidth / 2 - mitad);
          if (d < dist) [dist, mejor] = [d, i];
        });
        setCentro(mejor);
      });
    };
    p.addEventListener("scroll", medir, { passive: true });
    return () => {
      p.removeEventListener("scroll", medir);
      cancelAnimationFrame(raf);
    };
  }, []);

  const mover = (d: number) => ir(Math.min(stages.length - 1, Math.max(0, centro + d)));

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Stages de la temporada"
      className="relative"
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        mover(e.key === "ArrowRight" ? 1 : -1);
      }}
    >
      <div className="relative z-[1] px-4 pt-4 text-center">
        <p className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-[var(--oro)]">{subtitulo}</p>
        <h1 className="f-titulo mt-1 text-[1.9rem] font-semibold leading-tight [text-wrap:balance] lg:text-[2.4rem]">{titulo}</h1>
      </div>

      <div ref={pista} className="carrusel" tabIndex={0}>
        {stages.map((s, i) => (
          <div
            key={s.n}
            className="slide"
            data-dist={Math.min(2, Math.abs(i - centro))}
            role="group"
            aria-roledescription="stage"
            aria-label={`${i + 1} de ${stages.length}`}
            aria-hidden={i !== centro}
            onClick={() => i !== centro && ir(i)}
          >
            <TarjetaStage s={s} enfocada={i === centro} />
          </div>
        ))}
      </div>

      {/* Flechas: solo con puntero fino (en celular se desliza) */}
      <Flecha lado="izq" onClick={() => mover(-1)} disabled={centro === 0} />
      <Flecha lado="der" onClick={() => mover(1)} disabled={centro === stages.length - 1} />

      <div className="relative z-[1] flex justify-center gap-0.5 pb-48 lg:pb-56">
        {stages.map((s, i) => (
          <button key={s.n} type="button" onClick={() => ir(i)} className="grid h-11 w-7 place-items-center" aria-label={`Ir a ${s.corto}`} aria-current={i === centro ? "true" : undefined}>
            <span
              className="block h-3 rounded-full transition-[width,background-color] duration-200"
              style={{ width: i === centro ? 28 : 12, background: i === centro ? "var(--oro)" : "rgb(255 255 255 / 0.35)" }}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

function Flecha({ lado, onClick, disabled }: { lado: "izq" | "der"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={lado === "izq" ? "Stage anterior" : "Stage siguiente"}
      className="boton claro absolute top-[52%] z-10 hidden !h-14 !w-14 !rounded-full !p-0 [@media(pointer:fine)]:inline-flex"
      style={{ [lado === "izq" ? "left" : "right"]: "max(12px, calc(50% - 300px))" }}
    >
      <svg viewBox="0 0 10 10" width="18" height="18" aria-hidden style={{ transform: lado === "izq" ? "scaleX(-1)" : undefined }}>
        <path d="M3 1 L8 5 L3 9 Z" fill="currentColor" />
      </svg>
    </button>
  );
}
