/**
 * Agentes pixel dibujados en código (personajes pequeños para escenas:
 * patinadores, paseantes). Cada uno cambia colores de gorro, abrigo y bufanda.
 */

const SHAPE = [
  "...PP...",
  "..HHHH..",
  ".HHHHHH.",
  ".FFFFFF.",
  ".FkFFkF.",
  ".FFFFFF.",
  ".WWWWWW.",
  "CCCCCCCC",
  "FCCCCCCF",
  ".CCCCCC.",
  ".CCCCCC.",
  ".B....B.",
  ".B....B.",
];

export interface AgentColors {
  hat: string;
  coat: string;
  scarf: string;
  skin?: string;
  pom?: string;
}

export const AGENT_PALETTES: AgentColors[] = [
  { hat: "#e2445c", coat: "#2e9e78", scarf: "#f6b93b" },
  { hat: "#b9a7f5", coat: "#e2445c", scarf: "#fff6e5", skin: "#c98d62" },
  { hat: "#2e9e78", coat: "#57b9f0", scarf: "#e2445c" },
  { hat: "#f6b93b", coat: "#b9a7f5", scarf: "#2e9e78", skin: "#e0a77a" },
  { hat: "#ff8fb0", coat: "#f6b93b", scarf: "#57b9f0" },
  { hat: "#57b9f0", coat: "#ff8fb0", scarf: "#b9a7f5", skin: "#a8714a" },
];

export function PixelAgent({ colors, size = 28, flip = false }: { colors: AgentColors; size?: number; flip?: boolean }) {
  const map: Record<string, string> = {
    P: colors.pom ?? "#ffffff",
    H: colors.hat,
    F: colors.skin ?? "#f2c6a0",
    k: "#2a2342",
    W: colors.scarf,
    C: colors.coat,
    B: "#2a2342",
  };
  const w = SHAPE[0].length;
  const h = SHAPE.length;
  const filled = (x: number, y: number) => y >= 0 && y < h && x >= 0 && x < w && SHAPE[y][x] !== ".";
  const outline: React.ReactNode[] = [];
  const body: React.ReactNode[] = [];
  for (let y = -1; y <= h; y++) {
    for (let x = -1; x <= w; x++) {
      if (filled(x, y)) {
        body.push(<rect key={`b${x}-${y}`} x={x + 1} y={y + 1} width={1} height={1} fill={map[SHAPE[y][x]]} />);
      } else if (filled(x + 1, y) || filled(x - 1, y) || filled(x, y + 1) || filled(x, y - 1)) {
        outline.push(<rect key={`o${x}-${y}`} x={x + 1} y={y + 1} width={1} height={1} fill="#2a2342" />);
      }
    }
  }
  return (
    <svg
      viewBox={`0 0 ${w + 2} ${h + 2}`}
      width={size}
      height={(size * (h + 2)) / (w + 2)}
      shapeRendering="crispEdges"
      aria-hidden
      style={{ transform: flip ? "scaleX(-1)" : undefined, display: "block" }}
    >
      {outline}
      {body}
    </svg>
  );
}
