import { manejador, ok } from "@/lib/server/api";
import { cerrarSesion } from "@/lib/server/sesion";

export const POST = manejador(async () => {
  await cerrarSesion();
  return ok();
});
