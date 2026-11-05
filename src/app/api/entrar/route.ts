import { headers } from "next/headers";
import { cuerpo, ErrorDeUsuario, manejador, ok, texto } from "@/lib/server/api";
import { LIMITES, permitir } from "@/lib/server/limites";
import { ipFingerprint } from "@/lib/server/seguridad";
import { entrar } from "@/lib/server/temporada";

/** Entrar desde otro celular con usuario + PIN. Límite por conexión y bloqueo por cuenta. */
export const POST = manejador(async (req) => {
  const ip = ipFingerprint(await headers());
  if (!(await permitir(`entrar:${ip}`, LIMITES.entrar.max, LIMITES.entrar.ventana)))
    throw new ErrorDeUsuario("Demasiados intentos desde esta conexión. Espera 15 minutos.", 429);
  const b = await cuerpo(req);
  await entrar({ username: texto(b, "username", 40), pin: texto(b, "pin", 8) });
  return ok();
});
