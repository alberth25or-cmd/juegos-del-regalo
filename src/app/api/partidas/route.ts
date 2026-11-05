import { exigirJugador, manejador, ok } from "@/lib/server/api";
import { iniciarPartida } from "@/lib/server/partidas";

/** Empezar una partida de Gift Catcher: el servidor da la semilla y marca la hora. */
export const POST = manejador(async () => {
  const yo = await exigirJugador({ activo: true });
  return ok(await iniciarPartida(yo), 201);
});
