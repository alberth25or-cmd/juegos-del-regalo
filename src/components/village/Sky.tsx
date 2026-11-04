import { rng } from "./procedural";
import { pixelPaths } from "@/components/ui/pixelPaths";
import { Aurora, Birds, SunRays } from "./Ambient";
import { Sleigh } from "./Sleigh";

const CLOUD = [
  "......WWWW..........",
  "....WWWWWWWW...WWW..",
  "..WWWWWWWWWWWWWWWWW.",
  ".WWWWWWWWWWWWWWWWWWW",
  "SSWWWWWWWWWWWWWWWWSS",
  ".SSSSSSSSSSSSSSSSSS.",
];
const CLOUD_2 = [
  "....WWWW......",
  "..WWWWWWWWW...",
  ".WWWWWWWWWWWW.",
  "SSWWWWWWWWWWSS",
  ".SSSSSSSSSSSS.",
];

const CLOUD_COLORS = {
  W: "color-mix(in srgb, #ffffff 72%, var(--glow))",
  S: "color-mix(in srgb, var(--sky-mid) 55%, #ffffff)",
};

function PixelCloud({ rows }: { rows: string[] }) {
  return (
    <svg viewBox={`0 0 ${rows[0].length} ${rows.length}`} width="100%" height="100%" shapeRendering="crispEdges" aria-hidden>
      {pixelPaths(rows, CLOUD_COLORS).map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} />
      ))}
    </svg>
  );
}

const SUN = [
  "....YYYY....",
  "..YYWWWWYY..",
  ".YWWWWWWWWY.",
  ".YWWWWWWWWY.",
  "YWWWWWWWWWWY",
  "YWWWWWWWWWWY",
  "YWWWWWWWWWWY",
  "YWWWWWWWWWWY",
  ".YWWWWWWWWY.",
  ".YWWWWWWWWY.",
  "..YYWWWWYY..",
  "....YYYY....",
];
const MOON = [
  "....MMMM....",
  "..MMMMMM....",
  ".MMMMMM.....",
  ".MMMMM......",
  "MMMMM.......",
  "MMMMM.......",
  "MMMMM.......",
  "MMMMMM......",
  ".MMMMMM.....",
  ".MMMMMMMM..M",
  "..MMMMMMMMM.",
  "....MMMM....",
];

function PixelDisc({ rows, colors }: { rows: string[]; colors: Record<string, string> }) {
  return (
    <svg viewBox="0 0 12 12" width="100%" height="100%" shapeRendering="crispEdges" aria-hidden>
      {pixelPaths(rows, colors).map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} />
      ))}
    </svg>
  );
}

/** Estrellas en 5 grupos (cada grupo = 1 elemento con muchas sombras), titilan por grupo. */
const STAR_GROUPS = (() => {
  const r = rng(42);
  return [0, 1, 2, 3, 4].map((g) => {
    const shadows: string[] = [];
    for (let i = 0; i < 14; i++) {
      const x = (r() * 100).toFixed(1);
      const y = (r() * 62).toFixed(1);
      const big = r() > 0.85;
      shadows.push(`${x}vw ${y}vh 0 ${big ? "1px" : "0"} #fff`);
    }
    return { shadow: shadows.join(","), dur: 2 + g * 0.7, delay: g * 0.55 };
  });
})();

const CLOUDS = [
  { top: "10%", w: 30, dur: 160, delay: -40, rows: CLOUD, o: 0.95 },
  { top: "22%", w: 18, dur: 210, delay: -150, rows: CLOUD_2, o: 0.8 },
  { top: "6%", w: 14, dur: 260, delay: -90, rows: CLOUD_2, o: 0.6 },
  { top: "30%", w: 24, dur: 190, delay: -10, rows: CLOUD, o: 0.7 },
];

export function Sky() {
  const clouds = CLOUDS;
  return (
    <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden>
      {/* Degradado del cielo */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 52%, var(--sky-bottom) 100%)" }}
      />
      {/* Bandas pixeladas (dithering) para que el degradado no se vea "liso" */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, #fff 0 calc(var(--px)*2), transparent calc(var(--px)*2) calc(var(--px)*6))",
        }}
      />
      {/* Resplandor del horizonte */}
      <div
        className="absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background: "radial-gradient(120% 70% at var(--sun-x) 100%, color-mix(in srgb, var(--glow) 55%, transparent) 0%, transparent 70%)",
          opacity: "calc(0.35 + var(--sun-o) * 0.4)",
        }}
      />

      {/* Todo lo celeste baja un poco cuando la cámara mira hacia arriba */}
      <div className="absolute inset-0" style={{ transform: "translateY(calc((1 - var(--p, 1)) * 18vh))" }}>
      <SunRays />
      <Aurora />

      {/* Estrellas */}
      <div className="absolute inset-0" style={{ opacity: "var(--stars)" }}>
        {STAR_GROUPS.map((g, i) => (
          <span
            key={i}
            className="absolute left-0 top-0 block"
            style={{
              width: "calc(var(--px) * 1)",
              height: "calc(var(--px) * 1)",
              boxShadow: g.shadow,
              animation: `twinkle ${g.dur}s steps(3) ${g.delay}s infinite`,
            }}
          />
        ))}
        <span className="shooting-star" />
      </div>

      {/* Sol */}
      <div
        className="absolute"
        style={{
          left: "var(--sun-x)",
          top: "var(--sun-y)",
          width: "calc(var(--px) * 18)",
          height: "calc(var(--px) * 18)",
          transform: "translate(-50%, -50%)",
          opacity: "var(--sun-o)",
          filter: "drop-shadow(0 0 24px color-mix(in srgb, var(--glow) 80%, transparent))",
        }}
      >
        <PixelDisc rows={SUN} colors={{ Y: "color-mix(in srgb, #ffd166 70%, var(--glow))", W: "color-mix(in srgb, #fff6d8 80%, var(--glow))" }} />
      </div>

      {/* Luna */}
      <div
        className="absolute"
        style={{
          left: "var(--moon-x)",
          top: "var(--moon-y)",
          width: "calc(var(--px) * 15)",
          height: "calc(var(--px) * 15)",
          transform: "translate(-50%, -50%)",
          opacity: "var(--moon-o)",
          filter: "drop-shadow(0 0 18px rgba(220, 225, 255, 0.55))",
        }}
      >
        <PixelDisc rows={MOON} colors={{ M: "#f3f0ff" }} />
      </div>

      <Birds />
      <Sleigh />

      {/* Nubes */}
      {clouds.map((c, i) => (
        <div
          key={i}
          className="absolute left-0"
          style={{
            top: c.top,
            width: `calc(var(--px) * ${c.w * 2.2})`,
            aspectRatio: `${c.rows[0].length} / ${c.rows.length}`,
            animation: `drift ${c.dur}s linear ${c.delay}s infinite`,
            opacity: `calc(${c.o} * (0.35 + var(--light) * 0.6))`,
            filter: "brightness(var(--light))",
          }}
        >
          <PixelCloud rows={c.rows} />
        </div>
      ))}
      </div>
    </div>
  );
}
