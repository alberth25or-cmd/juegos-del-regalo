import { cuerpo, ErrorDeUsuario, exigirJugador, manejador, ok, texto } from "@/lib/server/api";
import { decidirPicante, estadoCasas, guardarFicha, responder } from "@/lib/server/casas";
import { permitir } from "@/lib/server/limites";

/** Estado del juego de las casas para el jugador de esta sesión. */
export const GET = manejador(async () => {
  const yo = await exigirJugador({ activo: true });
  return ok({ estado: await estadoCasas(yo) });
});

/** Acciones: responder · pasar · picante · ficha. */
export const POST = manejador(async (req) => {
  const yo = await exigirJugador({ activo: true });
  if (!(await permitir(`casas:${yo.id}`, 60, 60))) throw new ErrorDeUsuario("Vas muy rápido. Espera un momento.", 429);
  const b = await cuerpo(req);
  switch (texto(b, "accion", 20)) {
    case "responder":
      return ok({ estado: await responder(yo, texto(b, "pregunta", 10), b.valor, false) });
    case "pasar":
      return ok({ estado: await responder(yo, texto(b, "pregunta", 10), null, true) });
    case "picante":
      return ok({ estado: await decidirPicante(yo, b.acepta === true) });
    case "ficha":
      return ok({ estado: await guardarFicha(yo, b.regalos, b.datos) });
    default:
      throw new ErrorDeUsuario("Acción desconocida.");
  }
});
