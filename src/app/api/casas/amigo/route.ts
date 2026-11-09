import { cuerpo, ErrorDeUsuario, exigirJugador, manejador, ok, texto } from "@/lib/server/api";
import { fichaAmigo, fisgonear } from "@/lib/server/casas";
import { permitir } from "@/lib/server/limites";

/** Ficha de tu amigo secreto (lo cerrado nunca viaja al navegador). */
export const GET = manejador(async () => {
  const yo = await exigirJugador({ activo: true });
  return ok({ ficha: await fichaAmigo(yo) });
});

/** Abrir un sobre: { respuesta }. Gratis 1 por día; los demás cuestan monedas. */
export const POST = manejador(async (req) => {
  const yo = await exigirJugador({ activo: true });
  if (!(await permitir(`fisgoneo:${yo.id}`, 30, 60))) throw new ErrorDeUsuario("Vas muy rápido. Espera un momento.", 429);
  const b = await cuerpo(req);
  return ok({ ficha: await fisgonear(yo, texto(b, "respuesta", 40)) });
});
