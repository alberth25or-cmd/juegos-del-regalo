import { cuerpo, exigirJugador, manejador, ok, texto } from "@/lib/server/api";
import { reportar } from "@/lib/server/mundo";

/** Reportar un mensaje o a un jugador. El organizador lo revisa. */
export const POST = manejador(async (req) => {
  const yo = await exigirJugador();
  const b = await cuerpo(req);
  await reportar(yo, b.tipo, texto(b, "id", 40), texto(b, "motivo", 140));
  return ok();
});
