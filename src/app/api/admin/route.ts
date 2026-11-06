import { cuerpo, ErrorDeUsuario, exigirJugador, manejador, ok, texto } from "@/lib/server/api";
import { LIMITES, permitir } from "@/lib/server/limites";
import { ajustarPuntos, asignarEquipo, cambiarFechas, decidirJugador, reiniciarPin, renombrarEquipo, repartirAlAzar, simularDia } from "@/lib/server/temporada";

/** Operaciones del organizador. El rol se comprueba aquí, en el servidor, en cada llamada. */
export const POST = manejador(async (req) => {
  const yo = await exigirJugador({ admin: true });
  if (!(await permitir(`admin:${yo.id}`, LIMITES.admin.max, LIMITES.admin.ventana))) throw new ErrorDeUsuario("Vas muy rápido. Espera un momento.", 429);
  const b = await cuerpo(req);
  const accion = texto(b, "accion", 30);
  const playerId = texto(b, "playerId", 40);
  switch (accion) {
    case "aprobar":
      await decidirJugador(yo.id, yo.seasonId, playerId, "active");
      break;
    case "rechazar":
      await decidirJugador(yo.id, yo.seasonId, playerId, "rejected");
      break;
    case "desactivar":
      await decidirJugador(yo.id, yo.seasonId, playerId, "inactive");
      break;
    case "reiniciarPin":
      await reiniciarPin(yo.id, yo.seasonId, playerId, texto(b, "pin", 8));
      break;
    case "asignarEquipo":
      await asignarEquipo(yo.id, yo.seasonId, playerId, texto(b, "teamId", 40) || null);
      break;
    case "repartir":
      await repartirAlAzar(yo.id, yo.seasonId);
      break;
    case "renombrarEquipo":
      await renombrarEquipo(yo.id, yo.seasonId, texto(b, "teamId", 40), texto(b, "nombre", 60));
      break;
    case "fechas":
      await cambiarFechas(yo.id, yo.seasonId, texto(b, "desde", 10), texto(b, "hasta", 10));
      break;
    case "simularDia":
      await simularDia(yo.id, yo.seasonId, b.dia === null ? null : Number(b.dia));
      break;
    case "ajustar":
      await ajustarPuntos(yo.id, yo.seasonId, playerId, Number(b.puntos), texto(b, "motivo", 160));
      break;
    default:
      throw new ErrorDeUsuario("Acción desconocida.");
  }
  return ok();
});
