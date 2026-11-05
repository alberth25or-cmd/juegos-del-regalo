import { pixelPaths } from "@/components/ui/pixelPaths";
import { avatarValido, type ConfigAvatar } from "@/features/avatar";
import type { NpcId } from "@/features/contenido/npcs";
import { avatarSprite, NPC_SPRITES, type SpriteDef } from "./sprites";

/** Sprite pixel con contorno automático (un trazo SVG por color: liviano en celulares). */
export function PixelSprite({ sprite, size = 64, flip = false, className, title }: { sprite: SpriteDef; size?: number; flip?: boolean; className?: string; title?: string }) {
  const { rows, colors } = sprite;
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const filled = (x: number, y: number) => y >= 0 && y < h && x >= 0 && x < (rows[y]?.length ?? 0) && rows[y][x] !== "." && !!colors[rows[y][x]];
  const grid: string[] = [];
  for (let y = -1; y <= h; y++) {
    let row = "";
    for (let x = -1; x <= w; x++) {
      if (filled(x, y)) row += rows[y][x];
      else if (filled(x + 1, y) || filled(x - 1, y) || filled(x, y + 1) || filled(x, y - 1)) row += "~";
      else row += ".";
    }
    grid.push(row);
  }
  const paths = pixelPaths(grid, { ...colors, "~": "#2a2342" });
  return (
    <svg
      viewBox={`0 0 ${w + 2} ${h + 2}`}
      width={size}
      height={(size * (h + 2)) / (w + 2)}
      shapeRendering="crispEdges"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined, display: "block" }}
    >
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} />
      ))}
    </svg>
  );
}

export function NpcSprite({ id, size = 72, flip, className }: { id: NpcId; size?: number; flip?: boolean; className?: string }) {
  return <PixelSprite sprite={NPC_SPRITES[id]} size={size} flip={flip} className={className} />;
}

export function Avatar({ config, size = 48, flip, className, title }: { config: unknown; size?: number; flip?: boolean; className?: string; title?: string }) {
  const a: ConfigAvatar = avatarValido(config);
  return <PixelSprite sprite={avatarSprite(a)} size={size} flip={flip} className={className} title={title} />;
}
