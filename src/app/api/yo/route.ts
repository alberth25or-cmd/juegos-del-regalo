import { exigirJugador, manejador, ok } from "@/lib/server/api";

/** Quién soy (para pantallas cliente). */
export const GET = manejador(async () => {
  const yo = await exigirJugador();
  return ok({
    yo: { id: yo.id, username: yo.username, displayName: yo.displayName, avatar: yo.avatar, role: yo.role, status: yo.status, teamId: yo.teamId },
  });
});
