import { exigirJugador, manejador, ok } from "@/lib/server/api";
import { equiposDeTemporada, jugadoresDeTemporada, rankingAnonimo, rankingEquipos } from "@/lib/server/consultas";

export const GET = manejador(async () => {
  const yo = await exigirJugador();
  const [jugadores, equipos] = await Promise.all([jugadoresDeTemporada(yo.seasonId), equiposDeTemporada(yo.seasonId)]);
  return ok({ ...rankingAnonimo(jugadores, yo.id), equipos: rankingEquipos(equipos, jugadores) });
});
