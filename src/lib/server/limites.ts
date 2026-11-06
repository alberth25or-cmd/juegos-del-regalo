import "server-only";
import { conTope, db } from "./db";

/**
 * Límite de intentos por ventana fija, guardado en Postgres (sirve entre
 * instancias de Vercel sin Redis). Devuelve true si se permite la acción.
 */
export async function permitir(clave: string, maximo: number, ventanaSeg: number): Promise<boolean> {
  const sql = db();
  const [r] = await conTope(
    sql`
      insert into cc.rate_limits as r (key, window_start, hits)
      values (${clave}, now(), 1)
      on conflict (key) do update set
        hits = case when r.window_start < now() - make_interval(secs => ${ventanaSeg}) then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => ${ventanaSeg}) then now() else r.window_start end
      returning hits
    `,
    undefined,
    "verificación de intentos",
  );
  return (r?.hits ?? 1) <= maximo;
}

/**
 * Límites usados en la app (por IP salvo que diga otra cosa). Ojo: 40 amigos en la
 * misma red Wi-Fi comparten IP, por eso los límites por IP son holgados; la defensa
 * fuerte contra adivinar PINs es el bloqueo por CUENTA (5 fallos → 15 min).
 */
export const LIMITES = {
  entrar: { max: 80, ventana: 15 * 60 },
  unirse: { max: 60, ventana: 60 * 60 },
  crearTemporada: { max: 3, ventana: 60 * 60 },
  partidasPorDia: { max: 60, ventana: 24 * 60 * 60 },
  admin: { max: 120, ventana: 60 },
} as const;
