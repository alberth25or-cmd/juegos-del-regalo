"use client";

import { useEffect } from "react";

/**
 * Toda la interactividad de las zonas en un solo componente pequeño:
 * - revelado horizontal al entrar en pantalla,
 * - deriva con el scroll (variable --mp por zona, solo en la zona visible),
 * - inclinación 3D de las tarjetas con el mouse (un único listener delegado).
 * Las zonas en sí son HTML del servidor: no se hidratan.
 */
export function ZonasEfectos() {
  useEffect(() => {
    const root = document.getElementById("zonas");
    if (!root) return;
    const sections = [...root.querySelectorAll<HTMLElement>("[data-module]")];
    const reveals = [...root.querySelectorAll<HTMLElement>(".reveal-x, .reveal-pop")];

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -6% 0px" },
    );
    reveals.forEach((el) => io.observe(el));

    const ligero = () => document.documentElement.dataset.ligero === "1";

    let raf = 0;
    const update = () => {
      if (ligero()) return;
      const vh = window.innerHeight;
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const center = r.top + r.height / 2;
        const mp = Math.max(-1, Math.min(1, (vh / 2 - center) / (vh * 0.9 + r.height / 2)));
        s.style.setProperty("--mp", mp.toFixed(3));
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Inclinación de tarjetas (solo mouse)
    let actual: HTMLElement | null = null;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || ligero()) return;
      const card = (e.target as HTMLElement).closest<HTMLElement>(".game-card");
      if (actual && actual !== card) {
        actual.style.removeProperty("--rx");
        actual.style.removeProperty("--ry");
      }
      actual = card;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
    };
    root.addEventListener("pointermove", move, { passive: true });

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.removeEventListener("pointermove", move);
    };
  }, []);
  return null;
}
