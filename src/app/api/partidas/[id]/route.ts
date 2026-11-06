import { cuerpo, exigirJugador, manejador, ok } from "@/lib/server/api";
import { terminarPartida } from "@/lib/server/partidas";

/** Terminar la partida: el servidor recalcula el puntaje con la semilla y otorga recompensas. */
export const POST = manejador(async (req) => {
  const yo = await exigirJugador({ activo: true });
  const id = new URL(req.url).pathname.split("/").at(-1) ?? "";
  const b = await cuerpo(req);
  const resultado = await terminarPartida(yo, id, b);
  return ok({ resultado });
});
