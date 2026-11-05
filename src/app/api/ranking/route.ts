import { exigirJugador, manejador, ok } from "@/lib/server/api";
import { equiposDeTemporada, jugadoresDeTemporada, rankingEquipos } from "@/lib/server/consultas";

export const GET = manejador(async () => {
  const yo = await exigirJugador();
  const [jugadores, equipos] = await Promise.all([jugadoresDeTemporada(yo.seasonId), equiposDeTemporada(yo.seasonId)]);
  return ok({ jugadores, equipos: rankingEquipos(equipos, jugadores), yo: yo.id });
});
