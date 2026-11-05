/**
 * Llamadas del navegador a nuestra API. Pensado para celulares con mala señal:
 * - tope de tiempo (nunca "cargando" para siempre),
 * - reintento automático en GET y en errores de red/servidor ocupado,
 * - mensajes de error en español, listos para mostrar.
 */

export type RespuestaApi<T> = ({ ok: true } & T) | { ok: false; error: string; status: number };

interface Opciones {
  method?: "GET" | "POST";
  body?: unknown;
  /** ms por intento (por defecto 15 s) */
  tope?: number;
  /** reintentar también un POST (solo si la operación es segura de repetir) */
  idempotente?: boolean;
  intentos?: number;
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function api<T = Record<string, never>>(ruta: string, opts: Opciones = {}): Promise<RespuestaApi<T>> {
  const method = opts.method ?? (opts.body === undefined ? "GET" : "POST");
  const reintentable = method === "GET" || opts.idempotente === true;
  const intentos = opts.intentos ?? (reintentable ? 3 : 1);
  let ultimo: RespuestaApi<T> = { ok: false, error: "No hay conexión.", status: 0 };

  for (let i = 0; i < intentos; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), opts.tope ?? 15_000);
    try {
      const res = await fetch(ruta, {
        method,
        headers: opts.body === undefined ? undefined : { "Content-Type": "application/json" },
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        signal: ctrl.signal,
        cache: "no-store",
        credentials: "same-origin",
      });
      let data: Record<string, unknown> = {};
      try {
        data = await res.json();
      } catch {}
      if (res.ok && data.ok) return data as { ok: true } & T;
      ultimo = { ok: false, error: typeof data.error === "string" ? data.error : `Error del servidor (${res.status}).`, status: res.status };
      // Solo vale la pena reintentar si el servidor estaba ocupado.
      if (res.status !== 503 && res.status !== 502 && res.status !== 504) return ultimo;
    } catch (e) {
      const abortado = e instanceof DOMException && e.name === "AbortError";
      ultimo = {
        ok: false,
        error: abortado ? "La conexión está muy lenta. Revisa tu señal e intenta otra vez." : "No hay conexión con el servidor. Revisa tu internet.",
        status: 0,
      };
      if (!reintentable) return ultimo;
    } finally {
      clearTimeout(timer);
    }
    if (i < intentos - 1) await espera(600 * (i + 1) + Math.random() * 400);
  }
  return ultimo;
}
