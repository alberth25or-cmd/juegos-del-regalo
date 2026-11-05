import { exigirJugador, manejador, ok } from "@/lib/server/api";
import { noticias } from "@/lib/server/consultas";

/** Noticias de Snowville (la plaza las consulta cada pocos segundos). */
export const GET = manejador(async () => {
  const yo = await exigirJugador();
  return ok({ noticias: await noticias(yo.seasonId) });
});
