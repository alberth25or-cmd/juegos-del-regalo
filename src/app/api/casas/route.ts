import { cuerpo, ErrorDeUsuario, exigirJugador, manejador, ok, texto } from "@/lib/server/api";
import { aceptarTerminos, escribirCapsula, estadoCasas, guardarFicha, responder } from "@/lib/server/casas";
import { permitir } from "@/lib/server/limites";

/** Estado del juego de las casas para el jugador de esta sesión. */
export const GET = manejador(async () => {
  const yo = await exigirJugador({ activo: true });
  return ok({ estado: await estadoCasas(yo) });
});

/** Acciones: aceptar (pantalla de inicio) · responder · pasar · ficha · capsula. */
export const POST = manejador(async (req) => {
  const yo = await exigirJugador({ activo: true });
  if (!(await permitir(`casas:${yo.id}`, 60, 60))) throw new ErrorDeUsuario("Vas muy rápido. Espera un momento.", 429);
  const b = await cuerpo(req);
  switch (texto(b, "accion", 20)) {
    case "responder":
      return ok({ estado: await responder(yo, texto(b, "pregunta", 10), b.valor, false) });
    case "pasar":
      return ok({ estado: await responder(yo, texto(b, "pregunta", 10), null, true) });
    case "aceptar":
      if (b.mayorDeEdad !== true) throw new ErrorDeUsuario("Para jugar tienes que confirmar que eres mayor de edad.");
      return ok({ estado: await aceptarTerminos(yo) });
    case "ficha":
      return ok({ estado: await guardarFicha(yo, b.regalos, b.datos) });
    case "capsula":
      return ok(await escribirCapsula(yo, b.mensaje));
    default:
      throw new ErrorDeUsuario("Acción desconocida.");
  }
});
