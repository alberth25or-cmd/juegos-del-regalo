import { cuerpo, exigirJugador, manejador, ok } from "@/lib/server/api";
import { estadoVotacion, votar } from "@/lib/server/votacion";

/** Estado de la votación de esta ronda (pregunta, progreso y, si ya se revela, resultados). */
export const GET = manejador(async () => {
  const yo = await exigirJugador();
  return ok({ estado: await estadoVotacion(yo) });
});

/** Votar por alguien: { clave, objetivo }. */
export const POST = manejador(async (req) => {
  const yo = await exigirJugador({ activo: true });
  const b = await cuerpo(req);
  return ok({ estado: await votar(yo, b.clave, b.objetivo) });
});
