import { pixelPaths } from "./pixelPaths";

/**
 * Íconos pixel dibujados en código: cada fila es una cadena y cada letra un color.
 * Se ven nítidos a cualquier tamaño y pesan casi nada.
 */

const COLORS: Record<string, string> = {
  k: "var(--ink)",
  W: "#ffffff",
  C: "var(--cream)",
  R: "var(--cherry)",
  r: "#a8243f",
  Y: "var(--gold)",
  O: "#c98a1e",
  G: "var(--pine)",
  g: "#7fd6a8",
  B: "#9a5b34",
  b: "#6b3a22",
  L: "var(--lavender)",
  S: "var(--sky)",
  P: "var(--rose)",
};

export const ICONS = {
  home: [
    ".....kk.....",
    "....kRRk....",
    "...kRRRRk...",
    "..kRRRRRRk..",
    ".kRRRRRRRRk.",
    "kkkkkkkkkkkk",
    ".kCCCCCCCCk.",
    ".kCkkCCYYCk.",
    ".kCkkCCYYCk.",
    ".kCkkCCCCCk.",
    ".kCkkCCCCCk.",
    ".kkkkkkkkkk.",
  ],
  mission: [
    ".....kk.....",
    "....kYYk....",
    "....kYYk....",
    "kkkkkYYkkkkk",
    "kYYYYWYYYYYk",
    ".kYYYYYYYYk.",
    "..kYYYYYYk..",
    "..kYYYYYYk..",
    ".kYYYkkYYYk.",
    ".kYYk..kYYk.",
    "kYkk....kkYk",
    "kk........kk",
  ],
  ranking: [
    ".kkkkkkkkkk.",
    "kkYYYYYYYYkk",
    "kYkYWYYYYkYk",
    "kYkYWYYYYkYk",
    ".kkYYYYYYkk.",
    "...kYYYOk...",
    "....kYOk....",
    ".....kk.....",
    "....kYOk....",
    "...kkkkkk...",
    "..kBBBBBBk..",
    "..kkkkkkkk..",
  ],
  friend: [
    "............",
    "kkkkkkkkkkkk",
    "kWkCCCCCCkWk",
    "kCCkCCCCkCCk",
    "kCCCkCCkCCCk",
    "kCCCCkkCCCCk",
    "kCCCCRRCCCCk",
    "kCCCCRRCCCCk",
    "kCCCCCCCCCCk",
    "kkkkkkkkkkkk",
    "............",
    "............",
  ],
  chest: [
    "............",
    "..kkkkkkkk..",
    ".kBBBBBBBBk.",
    "kBBYBBBBYBBk",
    "kkkkkYYkkkkk",
    "kbbbkYYkbbbk",
    "kBBBBkkBBBBk",
    "kBBYBBBBYBBk",
    "kBBYBBBBYBBk",
    "kkkkkkkkkkkk",
    "............",
    "............",
  ],
  coin: [
    "..kkkk..",
    ".kYYYYk.",
    "kYYWYYOk",
    "kYWYYYOk",
    "kYYYYYOk",
    "kYYYYOOk",
    ".kOOOOk.",
    "..kkkk..",
  ],
  lock: [
    "..kkkkkk..",
    ".k......k.",
    ".k......k.",
    "kkkkkkkkkk",
    "kYYYYYYYYk",
    "kYYYkkYYYk",
    "kYYYkkYYYk",
    "kOOOOOOOOk",
    "kkkkkkkkkk",
  ],
  check: [
    "..........kk",
    ".........kGk",
    "........kGk.",
    ".kk....kGk..",
    "kGGk..kGk...",
    ".kGGkkGk....",
    "..kGGGk.....",
    "...kGk......",
    "....k.......",
  ],
  bang: [
    "kkkk",
    "kRRk",
    "kRRk",
    "kRRk",
    "kRRk",
    "kkkk",
    "....",
    "kkkk",
    "kRRk",
    "kkkk",
  ],
  heart: [
    "............",
    ".kkk....kkk.",
    "kRRRk..kRRRk",
    "kRWRRkkRRRRk",
    "kRWRRRRRRRrk",
    "kRRRRRRRRRrk",
    ".kRRRRRRRrk.",
    "..kRRRRRrk..",
    "...kRRRrk...",
    "....kRrk....",
    ".....kk.....",
    "............",
  ],
  chili: [
    "........kk..",
    ".......kGk..",
    ".....kkGGk..",
    "....kRRRRRk.",
    "...kRWRRRrk.",
    "..kRWRRRRrk.",
    ".kRRRRRRrk..",
    ".kRRRRRrk...",
    "kRRRRrrk....",
    "kRrrrk......",
    ".kkkk.......",
    "............",
  ],
  bow: [
    ".kkk......kkk.",
    "kRRRk....kRRRk",
    "kRWRRk..kRRRrk",
    "kRRRRRkkRRRRrk",
    ".kRRRkRRkRRrk.",
    "..kkkkRRkkkk..",
    "....kRrrRk....",
    "...kRk..kRk...",
    "...kk....kk...",
  ],
  bowOro: [
    ".kkk......kkk.",
    "kYYYk....kYYYk",
    "kYWYYk..kYYYOk",
    "kYYYYYkkYYYYOk",
    ".kYYYkYYkYYOk.",
    "..kkkkYYkkkk..",
    "....kYOOYk....",
    "...kYk..kYk...",
    "...kk....kk...",
  ],
  star: [
    ".....kk.....",
    "....kYYk....",
    "....kYYk....",
    "kkkkYWYYkkkk",
    "kYYYYWYYYYYk",
    ".kYYYYYYYYk.",
    "..kYYYYYOk..",
    "..kYYYYYOk..",
    ".kYYOkkYYOk.",
    ".kYOk..kYOk.",
    "kOkk....kkOk",
    "kk........kk",
  ],
  sheep: [
    "....kkkk....",
    "..kkWWWWkk..",
    ".kWWWWWWWWk.",
    "kWWWWWWWkkkk",
    "kWWWWWWkCCCk",
    "kWWWWWWkCkCk",
    "kWWWWWWkCCCk",
    ".kWWWWWWkPk.",
    "..kkkkkkkk..",
    "..kk..kk....",
    "..kk..kk....",
    "............",
  ],
  share: [
    "....kkkk....",
    "..kkGGGGkk..",
    ".kGGGGGGGGk.",
    ".kGGWWGGGGk.",
    "kGGWWGGGGGGk",
    "kGGWWWGGGGGk",
    "kGGGWWWGWWGk",
    "kGGGGWWWWWGk",
    ".kGGGGWWWGk.",
    ".kWGGGGGGGk.",
    "kWkkGGGGkk..",
    "kk..kkkk....",
  ],
  clock: [
    "...kkkkkk...",
    "..kCCCCCCk..",
    ".kCCCCkCCCk.",
    "kCCCCCkCCCCk",
    "kCCCCCkCCCCk",
    "kCCCCCkkkCCk",
    "kCCCCCCCCCCk",
    "kCCCCCCCCCCk",
    ".kCCCCCCCCk.",
    "..kCCCCCCk..",
    "...kkkkkk...",
  ],
  sparkle: [
    "...k...",
    "..kYk..",
    "kkYWYkk",
    "kYWWWYk",
    "kkYWYkk",
    "..kYk..",
    "...k...",
  ],
} as const;

export type IconName = keyof typeof ICONS;

export function PixelIcon({
  name,
  size = 24,
  className,
  title,
}: {
  name: IconName;
  size?: number;
  className?: string;
  title?: string;
}) {
  const rows = ICONS[name];
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const paths = pixelPaths(rows, COLORS);
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * h) / w}
      shapeRendering="crispEdges"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} />
      ))}
    </svg>
  );
}
