import "server-only";
import { headers } from "next/headers";
import { connection } from "next/server";
import { ErrorDeServicio, hasDatabase } from "./db";
import { jugadorActual, type Jugador } from "./sesion";

/**
 * Envoltura de todos los Route Handlers:
 * - Respuestas JSON uniformes: { ok: true, ...datos } o { ok: false, error }.
 * - Comprueba que la petición venga de nuestra propia página (protección CSRF).
 * - Tope total de tiempo: si algo se traba, responde 503 "intenta otra vez".
 * - Nunca filtra detalles internos al navegador; los registra en el servidor.
 */

export class ErrorDeUsuario extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

const TOPE_TOTAL_MS = 15_000;

export function ok(datos: Record<string, unknown> = {}, status = 200) {
  return Response.json({ ok: true, ...datos }, { status, headers: { "Cache-Control": "no-store" } });
}

function fallo(error: string, status: number) {
  return Response.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}

async function mismoOrigen() {
  const h = await headers();
  const origen = h.get("origin");
  if (!origen) return h.get("sec-fetch-site") !== "cross-site";
  try {
    return new URL(origen).host === h.get("host");
  } catch {
    return false;
  }
}

export function manejador(fn: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    await connection();
    if (req.method !== "GET" && !(await mismoOrigen())) return fallo("Petición no permitida.", 403);
    if (!hasDatabase()) return fallo("El juego todavía no tiene base de datos configurada.", 503);
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        fn(req),
        new Promise<Response>((resolve) => {
          timer = setTimeout(() => resolve(fallo("El servidor está tardando demasiado. Intenta otra vez en unos segundos.", 503)), TOPE_TOTAL_MS);
        }),
      ]);
    } catch (e) {
      if (e instanceof ErrorDeUsuario) return fallo(e.message, e.status);
      if (e instanceof ErrorDeServicio) {
        console.error("[api] servicio", req.method, new URL(req.url).pathname, e.message);
        return fallo("El servidor está ocupado. Intenta otra vez en unos segundos.", 503);
      }
      console.error("[api] error", req.method, new URL(req.url).pathname, e);
      return fallo("Algo salió mal. Intenta otra vez.", 500);
    } finally {
      clearTimeout(timer);
    }
  };
}

/** Lee el cuerpo JSON como objeto (sin confiar en su forma). */
export async function cuerpo(req: Request): Promise<Record<string, unknown>> {
  try {
    const j = await req.json();
    return j && typeof j === "object" && !Array.isArray(j) ? (j as Record<string, unknown>) : {};
  } catch {
    throw new ErrorDeUsuario("Datos inválidos.");
  }
}

export function texto(b: Record<string, unknown>, campo: string, max = 200) {
  const v = b[campo];
  return typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

/** Exige sesión. `activo`: además aprobado por el organizador. */
export async function exigirJugador(opts: { activo?: boolean; admin?: boolean } = {}): Promise<Jugador> {
  const yo = await jugadorActual();
  if (!yo) throw new ErrorDeUsuario("Tu sesión terminó. Vuelve a entrar con tu usuario y PIN.", 401);
  if (opts.admin && (yo.role !== "admin" || yo.status !== "active")) throw new ErrorDeUsuario("Solo el organizador puede hacer esto.", 403);
  if (opts.activo && yo.status !== "active") throw new ErrorDeUsuario("Tu ingreso todavía no fue aprobado por el organizador.", 403);
  return yo;
}
