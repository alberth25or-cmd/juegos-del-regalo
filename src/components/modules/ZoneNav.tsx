"use client";

import { useEffect, useRef, useState } from "react";
import { MODULES } from "@/lib/modules";

/** Barra fija con las zonas: marca dónde estás y te lleva a cualquiera. */
export function ZoneNav({ visible }: { visible: boolean }) {
  const [active, setActive] = useState<string>(MODULES[0].id);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const line = window.innerHeight * 0.38;
      let current: string = MODULES[0].id;
      for (const s of document.querySelectorAll<HTMLElement>("[data-zone]")) {
        if (s.getBoundingClientRect().top <= line) current = s.dataset.zone ?? current;
      }
      setActive(current);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Mantener visible la zona activa dentro de la barra (sin mover la página).
  useEffect(() => {
    const bar = barRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!bar || !chip) return;
    const left = chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2;
    bar.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  const go = (id: string) => {
    const el = document.getElementById(`zona-${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 130, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Zonas de juegos"
      className="fixed inset-x-0 z-30 px-3"
      style={{
        top: "calc(max(12px, env(safe-area-inset-top)) + 58px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
        transition: "opacity 300ms ease, transform 400ms cubic-bezier(0.2, 0.9, 0.3, 1.2)",
      }}
      inert={!visible}
    >
      <div ref={barRef} className="no-scrollbar mx-auto flex max-w-3xl gap-1.5 overflow-x-auto px-1 py-1.5">
        {MODULES.map((m, i) => {
          const on = m.id === active;
          return (
            <button
              key={m.id}
              type="button"
              data-chip={m.id}
              onClick={() => go(m.id)}
              aria-current={on ? "true" : undefined}
              className="px-chip shrink-0 !gap-1 !px-2.5 !py-1 transition-transform"
              style={{
                ["--chip" as string]: on ? "var(--gold)" : "rgb(255 246 229 / 0.94)",
                transform: on ? "translateY(-2px) scale(1.06)" : undefined,
              }}
            >
              <span aria-hidden>{m.icon}</span>
              <span className="text-[0.7rem]">
                {i + 1}. {m.short}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
