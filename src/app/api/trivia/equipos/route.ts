import { exigirJugador, manejador, ok } from "@/lib/server/api";
import { triviaEquiposHoy } from "@/lib/server/consultas";

/** Trivia de hoy por equipos (promedio por integrante activo). */
export const GET = manejador(async () => {
  const yo = await exigirJugador();
  return ok({ equipos: await triviaEquiposHoy(yo.seasonId) });
});
