/** Edificios de la aldea (hotspots). Posiciones relativas al mundo panorámico. */
import { SPRITES, SPRITE_SCALE } from "./assets/manifest";
import { buildingAspect } from "@/components/village/procedural";
import { zoneNumber } from "./modules";

export interface BuildingDef {
  id: string;
  label: string;
  href: string;
  /** centro horizontal, 0–1 del ancho del mundo */
  x: number;
  /** base del edificio, relativa al alto de la escena */
  bottom: number;
  /** alto del placeholder, relativo al alto de la escena */
  size: number;
  /** colores del placeholder procedural */
  roof: string;
  wall: string;
  chimney?: boolean;
  kind: "house" | "tower" | "board" | "chest" | "mailbox" | "tree" | "stall";
  /** letrero de zona (la portada lleva a cada zona de juegos) */
  zone?: string;
  zoneColor?: string;
}

export const BUILDINGS: BuildingDef[] = [
  { id: "casa-misiones", label: "Misiones", zone: `Zona ${zoneNumber("chocolatada")}`, zoneColor: "#e2445c", href: "#zona-chocolatada", x: 0.13, bottom: 0.18, size: 0.4, roof: "#e2445c", wall: "#fbe9c9", chimney: true, kind: "house" },
  { id: "tablero-plaza", label: "Competencia", zone: `Zona ${zoneNumber("pista")}`, zoneColor: "#57b9f0", href: "#zona-pista", x: 0.32, bottom: 0.19, size: 0.3, roof: "#2e9e78", wall: "#fff6e5", kind: "board" },
  { id: "arbol", label: "Árbol del adviento", href: "/calendario", x: 0.5, bottom: 0.19, size: 0.56, roof: "#2e9e78", wall: "#1f7a5c", kind: "tree" },
  { id: "buzon", label: "Clasificado", zone: `Zona ${zoneNumber("inteligencia")}`, zoneColor: "#b9a7f5", href: "#zona-inteligencia", x: 0.68, bottom: 0.17, size: 0.2, roof: "#e2445c", wall: "#2e9e78", kind: "mailbox" },
  { id: "cofre", label: "El pozo", zone: `Zona ${zoneNumber("boveda")}`, zoneColor: "#f6b93b", href: "#zona-boveda", x: 0.87, bottom: 0.16, size: 0.16, roof: "#f6b93b", wall: "#9a5b34", kind: "chest" },
];

/** Tamaño en pantalla de un edificio: sprite real si existe, si no el placeholder. */
export function buildingSize(def: BuildingDef, sceneH: number) {
  const s = SPRITES[def.id];
  if (s) return { w: s.w * SPRITE_SCALE * sceneH, h: s.h * SPRITE_SCALE * sceneH };
  const h = def.size * sceneH * 0.85;
  return { w: h * buildingAspect(def.kind), h };
}
