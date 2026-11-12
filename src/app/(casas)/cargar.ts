import "server-only";
import { unstable_rethrow } from "next/navigation";
import { estadoCasas, type EstadoCasas } from "@/lib/server/casas";
import { hasDatabase } from "@/lib/server/db";
import { jugadorActual, type Jugador } from "@/lib/server/sesion";

export type Carga =
  | { tipo: "demo" }
  | { tipo: "pendiente"; yo: Jugador }
  | { tipo: "error" }
  | { tipo: "terminos"; yo: Jugador; alias: string }
  | { tipo: "real"; yo: Jugador; estado: EstadoCasas };

/**
 * Quién mira la aldea: sin sesión (o sin base de datos) se ve la vista de ejemplo; con sesión
 * activa, sus datos reales. Si la base de datos falla, se dice claro (nunca datos inventados
 * haciéndose pasar por reales).
 */
export async function cargarCasas(): Promise<Carga> {
  if (!hasDatabase()) return { tipo: "demo" };
  try {
    const yo = await jugadorActual();
    if (!yo) return { tipo: "demo" };
    if (yo.status !== "active") return { tipo: "pendiente", yo };
    const estado = await estadoCasas(yo);
    // Pantalla de inicio: mayor de edad + reglas, una sola vez, antes de cualquier casa.
    if (!estado.yo.aceptoTerminos) return { tipo: "terminos", yo, alias: estado.yo.alias };
    return { tipo: "real", yo, estado };
  } catch (e) {
    unstable_rethrow(e);
    console.error("[casas]", e);
    return { tipo: "error" };
  }
}
