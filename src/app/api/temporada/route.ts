import { headers } from "next/headers";
import { cuerpo, ErrorDeUsuario, manejador, ok, texto } from "@/lib/server/api";
import { LIMITES, permitir } from "@/lib/server/limites";
import { ipFingerprint } from "@/lib/server/seguridad";
import { crearTemporada } from "@/lib/server/temporada";

/** Crear una temporada nueva: quien la crea queda como organizador (admin). */
export const POST = manejador(async (req) => {
  const ip = ipFingerprint(await headers());
  if (!(await permitir(`crear:${ip}`, LIMITES.crearTemporada.max, LIMITES.crearTemporada.ventana)))
    throw new ErrorDeUsuario("Demasiadas temporadas creadas desde aquí. Espera un rato.", 429);
  const b = await cuerpo(req);
  const r = await crearTemporada({
    nombre: texto(b, "nombre", 80),
    jugador: { username: texto(b, "username", 40), displayName: texto(b, "displayName", 40), avatar: b.avatar, pin: texto(b, "pin", 8), pin2: texto(b, "pin2", 8) },
  });
  return ok(r, 201);
});
