import { headers } from "next/headers";
import { cuerpo, ErrorDeUsuario, manejador, ok, texto } from "@/lib/server/api";
import { LIMITES, permitir } from "@/lib/server/limites";
import { ipFingerprint } from "@/lib/server/seguridad";
import { unirse } from "@/lib/server/temporada";

/** Inscribirse con el código de invitación. Queda "pendiente" hasta que el organizador apruebe. */
export const POST = manejador(async (req) => {
  const ip = ipFingerprint(await headers());
  if (!(await permitir(`unirse:${ip}`, LIMITES.unirse.max, LIMITES.unirse.ventana)))
    throw new ErrorDeUsuario("Demasiados registros desde esta conexión. Espera un rato.", 429);
  const b = await cuerpo(req);
  const r = await unirse({
    codigo: texto(b, "codigo", 20),
    jugador: { username: texto(b, "username", 40), displayName: texto(b, "displayName", 40), avatar: b.avatar, pin: texto(b, "pin", 8), pin2: texto(b, "pin2", 8) },
  });
  return ok(r, 201);
});
