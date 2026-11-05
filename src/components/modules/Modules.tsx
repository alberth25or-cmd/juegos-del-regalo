import { MODULES, type ModuleDef } from "@/lib/modules";
import { GameCard } from "./GameCard";
import { Scene } from "./Scenes";
import { ZonasEfectos } from "./ZonasEfectos";
import { InterruptorLigero } from "@/components/rendimiento/InterruptorLigero";

/**
 * Zonas de juegos bajo la aldea. Se generan en el SERVIDOR (cero JavaScript
 * para dibujarlas) y con `content-visibility: auto` el teléfono solo dibuja
 * la zona que está viendo. Las animaciones de entrada y deriva las pone
 * <ZonasEfectos/>, un componente cliente pequeñito.
 */

/** Partículas de luz flotante de cada zona (posiciones fijas: mismo HTML en servidor y cliente). */
const POLVO = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 37 + 7) % 100,
  dur: 6 + (i % 4) * 1.3,
  delay: -(i * 0.85),
  dx: ((i % 2 ? 1 : -1) * (12 + (i % 3) * 14)),
  size: 8 + (i % 3) * 4,
}));

function PolvoDeLuz({ dark }: { dark?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[18%] overflow-hidden" style={{ opacity: dark ? 0.95 : 0.75 }}>
      {POLVO.map((p, i) => (
        <span
          key={i}
          className="polvo-luz"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            bottom: `${(i * 13) % 60}%`,
            ["--dur" as string]: `${p.dur}s`,
            ["--delay" as string]: `${p.delay}s`,
            ["--dx" as string]: `${p.dx}px`,
          }}
        />
      ))}
    </div>
  );
}

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
  const dirColinas = index % 2 ? 1 : -1;
  return (
    <section
      data-module
      data-zone={mod.id}
      className="zona relative overflow-clip pb-16 pt-12"
      style={{
        background: `linear-gradient(180deg, ${mod.bg} 0%, ${mod.bg2} 100%)`,
        ["--mp" as string]: 0,
      }}
      aria-labelledby={`zona-${mod.id}`}
    >
      {/* Patrón de nieve que se desplaza con el scroll (solo transform: barato) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-y-16 inset-x-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(#fff 1.5px, transparent 2px)",
          backgroundSize: "22px 22px",
          transform: "translateY(calc(var(--mp) * -60px))",
        }}
      />
      {/* Colinas lejanas de la zona (más anchas y movidas con transform, sin filtros) */}
      <div
        aria-hidden
        className="pixelated pointer-events-none absolute -inset-x-32 top-0 h-[120px]"
        style={{
          backgroundImage: "url(/art/layers/hills.png)",
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "left bottom",
          opacity: mod.dark ? 0.14 : 0.6,
          transform: `translateX(calc(var(--mp) * ${dirColinas * 120}px))`,
          maskImage: "linear-gradient(#000 40%, transparent)",
          WebkitMaskImage: "linear-gradient(#000 40%, transparent)",
        }}
      />

      <PolvoDeLuz dark={mod.dark} />

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
            <Scene id={mod.scene} />
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

export function Modules() {
  return (
    <div id="zonas" className="relative z-10 pb-28">
      <ZonasEfectos />
      {MODULES.map((m, i) => (
        <div key={m.id}>
          <Divider color={m.bg} />
          <ModuleSection mod={m} index={i} />
        </div>
      ))}
      <footer className="flex flex-col items-center gap-3 px-4 pb-8 pt-10 text-center font-pixel text-sm text-[var(--on-sky)]">
        <InterruptorLigero />
        <span>Los Juegos del Regalo · Temporada Christmas Chaos 2026</span>
      </footer>
    </div>
  );
}
