"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { MODULES, type ModuleDef } from "@/lib/modules";
import { GameCard } from "./GameCard";
import { Scene } from "./Scenes";

/** Divisor de nieve escalonado entre zonas (como un borde pixel). */
function Divider({ color }: { color: string }) {
  return (
    <div
      aria-hidden
      className="relative z-10 -mt-[22px] h-[24px] w-full"
      style={{
        background: color,
        maskImage:
          "linear-gradient(#000, #000) 0 100% / 100% 10px no-repeat, radial-gradient(circle at 12px 24px, #000 11px, transparent 12px) 0 0 / 24px 24px repeat-x",
        WebkitMaskImage:
          "linear-gradient(#000, #000) 0 100% / 100% 10px no-repeat, radial-gradient(circle at 12px 24px, #000 11px, transparent 12px) 0 0 / 24px 24px repeat-x",
      }}
    />
  );
}

function ModuleSection({ mod, index }: { mod: ModuleDef; index: number }) {
  const ink = mod.dark ? "var(--cream)" : "var(--ink)";
  const soft = mod.dark ? "rgb(255 246 229 / .75)" : "var(--ink-soft)";
  return (
    <section
      data-module
      data-zone={mod.id}
      className="relative overflow-clip pb-16 pt-12"
      style={{
        background: `linear-gradient(180deg, ${mod.bg} 0%, ${mod.bg2} 100%)`,
        ["--mp" as string]: 0,
      }}
      aria-labelledby={`zona-${mod.id}`}
    >
      {/* Patrón de nieve/ladrillo pixel que se desplaza con el scroll */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(#fff 1.5px, transparent 2px)",
          backgroundSize: "22px 22px",
          transform: "translateY(calc(var(--mp) * -60px))",
        }}
      />
      {/* Colinas lejanas de la zona */}
      <div
        aria-hidden
        className="pixelated pointer-events-none absolute inset-x-0 top-0 h-[120px] opacity-60"
        style={{
          backgroundImage: "url(/art/layers/hills.png)",
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: `calc(var(--mp) * ${index % 2 ? 120 : -120}px) bottom`,
          filter: mod.dark ? "brightness(0.35) saturate(0.6)" : "brightness(calc(var(--light) * 1.02)) saturate(var(--sat))",
          maskImage: "linear-gradient(#000 40%, transparent)",
          WebkitMaskImage: "linear-gradient(#000 40%, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4">
        {/* Encabezado de la zona: entra desde un lado */}
        <header className="reveal-x text-center" data-dir={index % 2 ? 1 : -1}>
          <span className="px-chip" style={{ ["--chip" as string]: mod.dark ? "var(--gold)" : "var(--cream)" }}>
            Zona {index + 1} · {mod.category}
          </span>
          <h2 id={`zona-${mod.id}`} className="zone-title mt-3 font-pixel" style={{ color: ink }}>
            {mod.title}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[0.95rem]" style={{ color: soft }}>
            {mod.description}
          </p>
        </header>

        {/* Escena animada */}
        <div className="reveal-pop mt-6" style={{ transform: "translateY(calc(var(--mp) * 30px))" }}>
          <div className="scene-scale">
            <Scene id={mod.id} />
          </div>
        </div>

        {/* Tarjetas: zigzag que entra en horizontal y deriva con el scroll */}
        <div className="cards-zigzag mt-8">
          {mod.cards.map((c, i) => {
            const dir = (i + index) % 2 ? 1 : -1;
            return (
              <div key={c.id} className={`zz zz-${i} reveal-x`} data-dir={dir} style={{ transitionDelay: `${i * 120}ms` }}>
                <div style={{ transform: `translateX(calc(var(--mp) * ${dir * 46}px)) rotate(${dir * (i === 0 ? 1 : 2)}deg)` }}>
                  <div className="card-float" style={{ animationDelay: `${i * 0.7}s` }}>
                    <GameCard card={c} index={i} dark={mod.dark} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Zonas de juegos bajo la aldea, con revelado horizontal y deriva al hacer scroll. */
export function Modules() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
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

    // Progreso de cada zona: -1 (entrando abajo) → 0 (centrada) → 1 (saliendo arriba).
    let raf = 0;
    const update = () => {
      const vh = window.innerHeight;
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const center = r.top + r.height / 2;
        const mp = Math.max(-1, Math.min(1, (vh / 2 - center) / (vh * 0.9 + r.height / 2)));
        s.style.setProperty("--mp", mp.toFixed(4));
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="relative z-10 pb-28">
      <div className="relative z-10 mx-auto -mb-4 max-w-md px-4 pt-6">
        <Link href="/prueba" className="px-box flex items-center gap-3 px-3 py-2" style={{ ["--bg" as string]: "var(--gold)" }}>
          <span className="text-2xl" aria-hidden>
            🧪
          </span>
          <span className="leading-tight">
            <span className="block font-pixel">Modo prueba</span>
            <span className="block text-[0.78rem]">Toca cualquier juego para probarlo, todo desbloqueado y con amigos simulados.</span>
          </span>
        </Link>
      </div>
      {MODULES.map((m, i) => (
        <div key={m.id}>
          <Divider color={m.bg} />
          <ModuleSection mod={m} index={i} />
        </div>
      ))}
      <footer className="px-4 pb-8 pt-10 text-center font-pixel text-sm text-[var(--on-sky)]">
        Hecho con 🍫 y mucho misterio · Temporada 2026
      </footer>
    </div>
  );
}
