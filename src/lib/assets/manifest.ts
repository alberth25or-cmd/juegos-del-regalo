/**
 * Manifest de arte. Las imágenes vienen de Higgsfield, procesadas con
 * `node scripts/process-art.mjs` (que genera art.json). Si un archivo no
 * existe, se usa el placeholder procedural, así el arte se puede cambiar
 * sin tocar los componentes.
 */
import art from "./art.json";

type ArtFile = { src: string; w: number; h: number };
const sprites = art.sprites as Record<string, ArtFile>;
const layers = art.layers as Record<string, ArtFile>;

export interface LayerAsset {
  id: string;
  src: string | null;
  /** 0 = infinito (cielo), 1 = se mueve con la aldea, >1 = primer plano */
  speed: number;
  /** alto de la capa relativo al alto de la escena */
  height: number;
  /** distancia desde abajo, relativa al alto de la escena */
  bottom: number;
  /** cuánta neblina atmosférica recibe (capas lejanas = más) */
  haze: number;
  /** voltear horizontalmente (para reutilizar una capa con otra forma) */
  flip?: boolean;
  /** ajuste de brillo propio de la capa */
  tone?: number;
}

export const LAYERS: LayerAsset[] = [
  { id: "mountains-far", src: layers.mountains?.src ?? null, speed: 0.1, height: 0.46, bottom: 0.4, haze: 0.42, tone: 1.04 },
  { id: "mountains-near", src: layers.mountains?.src ?? null, speed: 0.24, height: 0.4, bottom: 0.3, haze: 0.16, flip: true, tone: 0.9 },
  { id: "hills", src: layers.hills?.src ?? null, speed: 0.5, height: 0.34, bottom: 0.24, haze: 0.08 },
  { id: "ground", src: layers.ground?.src ?? null, speed: 1, height: 0.4, bottom: 0, haze: 0 },
];

export const FOREGROUND: LayerAsset = {
  id: "foreground",
  src: layers.foreground?.src ?? null,
  speed: 1.4,
  height: 0.22,
  bottom: -0.06,
  haze: 0,
  tone: 0.82,
};

export const SPRITES: Record<string, ArtFile | undefined> = sprites;

/** Pixeles de pantalla por pixel de arte de los sprites (relativo al alto de escena). */
export const SPRITE_SCALE = 0.0031;
