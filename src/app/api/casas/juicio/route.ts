import { exigirJugador, manejador, ok } from "@/lib/server/api";
import { premios } from "@/lib/server/casas";

/** Ranking de la vergüenza: premios de la temporada, solo con alias. */
export const GET = manejador(async () => {
  const yo = await exigirJugador({ activo: true });
  return ok({ premios: await premios(yo.seasonId) });
});
