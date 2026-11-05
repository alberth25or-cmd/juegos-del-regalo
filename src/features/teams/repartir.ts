import { crearAzar, mezclar } from "../azar.ts";

/** Equipos por defecto (nombres y colores editables por el organizador). */
export const EQUIPOS_POR_DEFECTO = [
  { slug: "duendes-en-huelga", name: "Duendes en Huelga", color: "#2e9e78", emblem: "✊" },
  { slug: "renos-endeudados", name: "Renos Endeudados", color: "#c0392b", emblem: "🦌" },
  { slug: "carbon-premium", name: "Carbón Premium", color: "#3b3f5c", emblem: "⚫" },
  { slug: "auditores-sin-alma", name: "Auditores sin Alma", color: "#d4a017", emblem: "📋" },
] as const;

/**
 * Reparto al azar equilibrado: tamaños que difieren a lo sumo en 1.
 * Si `semilla` se repite, el reparto también (útil para tests).
 */
export function repartirEquipos<T>(jugadores: readonly T[], equipos: number, semilla = Date.now()): T[][] {
  if (equipos < 1) throw new Error("Debe haber al menos un equipo");
  const orden = mezclar(jugadores, crearAzar(semilla));
  const out: T[][] = Array.from({ length: equipos }, () => []);
  orden.forEach((j, i) => out[i % equipos].push(j));
  return out;
}
