import arteMundo from "@/lib/assets/mundo.json";
import type { NpcId } from "@/features/contenido/npcs";
import { NpcSprite } from "./PixelSprite";

const ARTE = arteMundo as Record<string, { src: string; w: number; h: number }>;

/** Retrato pixel del NPC (arte de Higgsfield) para los diálogos; si falta, su sprite chico. */
export function Retrato({ npc, size = 88, className }: { npc: NpcId; size?: number; className?: string }) {
  const a = ARTE[`retrato-${npc}`];
  if (!a) return <NpcSprite id={npc} size={size * 0.8} className={className} />;
  const alto = Math.round((a.h / a.w) * size);
  return (
    <span className={`relative block overflow-hidden ${className ?? ""}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={a.src} alt="" width={size} height={alto} className="pixelated absolute left-0 block" style={{ bottom: alto > size ? undefined : 0, top: alto > size ? Math.round(-(alto - size) * 0.25) : undefined }} draggable={false} />
    </span>
  );
}
