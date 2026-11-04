import { pixelPaths } from "@/components/ui/pixelPaths";

/**
 * Personajes pixel propios, dibujados por filas (cada letra = un color).
 * - Ogro Panetonero: ogro de las nieves con chullo, duerme sobre los regalos.
 * - Muñeco de nieve: se arma entre todos en el juego colaborativo.
 */

const OGRE_W = 26;
const pad = (r: string) => (r + ".".repeat(OGRE_W)).slice(0, OGRE_W);

const OGRE = [
  "..........RRRRRR",
  "........RRGGGGGGRR",
  ".......RGGPPPPPPGGR",
  "......RRRRRRRRRRRRRR",
  ".....kBBBBBBBBBBBBBBk",
  "....kBBBBBBBBBBBBBBBBk",
  "...kBBBkkkBBBBBBkkkBBBk",
  "...kBBBBBBBBNNBBBBBBBBk",
  "...kBBBBBBBNNNNBBBBBBBk",
  "...kBBBBBBBBBBBBBBBBBBk",
  "...kBBkkkkkkkkkkkkkkBBk",
  "...kBBkWkMMMMMMMMkWkBBk",
  "...kBBBkkkkkkkkkkkkBBBk",
  "..kBBBBBBBBBBBBBBBBBBBBk",
  ".kBBbBBBBBBBBBBBBBBBBbBBk",
  "kBBbbBBBBBWWWWWWBBBBBbbBBk",
  "kBBbbBBBBWWWWWWWWBBBBbbBBk",
  "kBBbBBBBBWWWWWWWWBBBBBbBBk",
  ".kkBBBBBBBWWWWWWBBBBBBBkk",
  "..kBBBBBBBBBBBBBBBBBBBBk",
  "..kBBBBBkkkkkkkkkkBBBBBk",
  "..kBBBBk..........kBBBBk",
  "..kkkkkk..........kkkkkk",
].map(pad);

const OGRE_COLORS: Record<string, string> = {
  k: "#2a2342",
  B: "#8f97dc",
  b: "#6f78c4",
  N: "#b4b9ee",
  W: "#f4f8ff",
  M: "#5b2a3a",
  R: "#e2445c",
  G: "#2e9e78",
  P: "#f6b93b",
};

function rowsToRects(rows: string[], colors: Record<string, string>) {
  return pixelPaths(rows, colors).map((p, i) => <path key={i} d={p.d} fill={p.fill} />);
}

/** Ogro Panetonero. `awake` controla los ojos; `blink` los anima solos. */
export function Ogre({ size = 160, blink = true, ojos }: { size?: number; blink?: boolean; ojos?: "abiertos" | "cerrados" }) {
  const h = OGRE.length;
  return (
    <svg viewBox={`0 0 ${OGRE_W} ${h}`} width={size} height={(size * h) / OGRE_W} shapeRendering="crispEdges" aria-hidden style={{ display: "block" }}>
      {rowsToRects(OGRE, OGRE_COLORS)}
      {/* ojos abiertos: aparecen de vez en cuando */}
      <g style={ojos ? { opacity: ojos === "abiertos" ? 1 : 0 } : blink ? { animation: "ogre-eye 6s steps(1) infinite" } : { opacity: 0 }}>
        <rect x={6} y={5} width={4} height={3} fill="#2a2342" />
        <rect x={7} y={5} width={2} height={2} fill="#fff6e5" />
        <rect x={8} y={6} width={1} height={1} fill="#e2445c" />
        <rect x={15} y={5} width={4} height={3} fill="#2a2342" />
        <rect x={16} y={5} width={2} height={2} fill="#fff6e5" />
        <rect x={16} y={6} width={1} height={1} fill="#e2445c" />
      </g>
    </svg>
  );
}

/** Muñeco de nieve: con `build` se arma pieza por pieza en bucle. */
export function Snowman({ size = 120, build = false }: { size?: number; build?: boolean }) {
  const piece = (i: number): React.CSSProperties | undefined =>
    build ? { animation: `build-piece 8s ease-out infinite`, animationDelay: `${i * 0.7}s`, transformBox: "fill-box", transformOrigin: "50% 100%" } : undefined;
  return (
    <svg viewBox="0 0 30 40" width={size} height={(size * 40) / 30} shapeRendering="crispEdges" aria-hidden style={{ display: "block", overflow: "visible" }}>
      {/* base */}
      <g style={piece(0)}>
        <rect x={5} y={27} width={20} height={12} fill="#2a2342" />
        <rect x={3} y={29} width={24} height={8} fill="#2a2342" />
        <rect x={6} y={28} width={18} height={10} fill="#f4f8ff" />
        <rect x={4} y={30} width={22} height={6} fill="#f4f8ff" />
        <rect x={18} y={30} width={6} height={6} fill="#c9d6f0" />
      </g>
      {/* cuerpo */}
      <g style={piece(1)}>
        <rect x={8} y={17} width={14} height={11} fill="#2a2342" />
        <rect x={7} y={19} width={16} height={7} fill="#2a2342" />
        <rect x={9} y={18} width={12} height={9} fill="#f4f8ff" />
        <rect x={8} y={20} width={14} height={5} fill="#f4f8ff" />
        <rect x={14} y={20} width={2} height={2} fill="#2a2342" />
        <rect x={14} y={24} width={2} height={2} fill="#2a2342" />
      </g>
      {/* cabeza */}
      <g style={piece(2)}>
        <rect x={10} y={8} width={10} height={10} fill="#2a2342" />
        <rect x={11} y={9} width={8} height={8} fill="#f4f8ff" />
        <rect x={12} y={11} width={2} height={2} fill="#2a2342" />
        <rect x={16} y={11} width={2} height={2} fill="#2a2342" />
        <rect x={14} y={13} width={5} height={2} fill="#f6873b" />
        <rect x={12} y={15} width={6} height={1} fill="#2a2342" />
      </g>
      {/* bufanda */}
      <g style={piece(3)}>
        <rect x={9} y={16} width={12} height={3} fill="#e2445c" />
        <rect x={17} y={18} width={3} height={6} fill="#e2445c" />
        <rect x={9} y={17} width={12} height={1} fill="#ffb3c7" />
      </g>
      {/* chullo */}
      <g style={piece(4)}>
        <rect x={10} y={4} width={10} height={5} fill="#2a2342" />
        <rect x={11} y={5} width={8} height={3} fill="#2e9e78" />
        <rect x={11} y={6} width={8} height={1} fill="#f6b93b" />
        <rect x={14} y={1} width={2} height={3} fill="#fff6e5" />
      </g>
    </svg>
  );
}
