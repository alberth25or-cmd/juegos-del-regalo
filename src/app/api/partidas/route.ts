import { exigirJugador, manejador, ok } from "@/lib/server/api";
import { iniciarPartida } from "@/lib/server/partidas";

/** Empezar una partida ({ juego }: gift-catcher, memory o trivia): el servidor da la semilla y marca la hora. */
export const POST = manejador(async (req) => {
  const yo = await exigirJugador({ activo: true });
  const b = (await req.json().catch(() => ({}))) as { juego?: unknown } | null;
  const juego = typeof b?.juego === "string" ? b.juego : "gift-catcher";
  return ok(await iniciarPartida(yo, juego), 201);
});
