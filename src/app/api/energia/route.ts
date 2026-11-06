import { exigirJugador, manejador, ok } from "@/lib/server/api";
import { energiaDe } from "@/lib/server/energia";

/** Energía navideña de la temporada (misión global). */
export const GET = manejador(async () => {
  const yo = await exigirJugador();
  return ok({ energia: await energiaDe(yo.seasonId) });
});
