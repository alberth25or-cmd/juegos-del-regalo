import { exigirJugador, manejador, ok } from "@/lib/server/api";
import { capsulas } from "@/lib/server/casas";

/** Tu mensaje en la cápsula y, si ya se abrió, el que te dejaron. */
export const GET = manejador(async () => {
  const yo = await exigirJugador({ activo: true });
  return ok({ capsula: await capsulas(yo) });
});
