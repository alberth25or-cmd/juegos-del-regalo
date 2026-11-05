import { cuerpo, exigirJugador, manejador, ok, texto } from "@/lib/server/api";
import { chatReciente, enviarChat } from "@/lib/server/mundo";
import { esSala } from "@/features/mundo/mapas";

/** Chat del mundo: el servidor filtra, guarda (para poder reportar) y difunde. */
export const POST = manejador(async (req) => {
  const yo = await exigirJugador();
  const b = await cuerpo(req);
  return ok(await enviarChat(yo, b.sala, texto(b, "texto", 200)), 201);
});

export const GET = manejador(async (req) => {
  const yo = await exigirJugador();
  const sala = new URL(req.url).searchParams.get("sala");
  return ok({ mensajes: esSala(sala) ? await chatReciente(yo.seasonId, sala) : [] });
});
