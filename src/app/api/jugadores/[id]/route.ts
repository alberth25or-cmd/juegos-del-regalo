import { exigirJugador, manejador, ok } from "@/lib/server/api";
import { perfilPublico } from "@/lib/server/mundo";

/** Perfil público (nivel, equipo, puntos) de alguien de tu misma temporada. */
export const GET = manejador(async (req) => {
  const yo = await exigirJugador();
  const id = new URL(req.url).pathname.split("/").at(-1) ?? "";
  return ok({ perfil: await perfilPublico(yo, id) });
});
