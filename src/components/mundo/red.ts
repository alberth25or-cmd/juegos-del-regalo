/**
 * Red del mundo: quién está en la sala y qué hace, en vivo.
 *
 * - Producción: Supabase Realtime (canal por sala, presencia + broadcast).
 * - Local / sin Supabase: BroadcastChannel entre pestañas del mismo navegador
 *   (sirve para probar varios jugadores abriendo varias pestañas).
 *
 * Por la red NO viaja cada paso: solo "voy de A a B" (cada celular calcula el mismo
 * camino), emotes, frases, saludos y chat. Así funciona fluido con datos móviles.
 */
import { RealtimeClient, type RealtimeChannel } from "@supabase/realtime-js";
import type { SalaId } from "@/features/mundo/mapas";

export interface Presencia {
  id: string;
  nombre: string;
  avatar: unknown;
  color: string | null;
  x: number;
  y: number;
  pendiente?: boolean;
}

export type Evento =
  | { tipo: "mover"; id: string; de: { x: number; y: number }; a: { x: number; y: number } }
  | { tipo: "emote"; id: string; emote: string }
  | { tipo: "frase"; id: string; texto: string }
  | { tipo: "saludo"; id: string; para: string; nombre: string }
  | { tipo: "chat"; id: string; playerId: string; nombre: string; texto: string; fecha: string };

export type EstadoRed = "conectando" | "en-vivo" | "reconectando" | "local" | "sin-red";

export interface Red {
  readonly modo: "supabase" | "local" | "ninguno";
  unir(topico: string, yo: Presencia): void;
  salir(): void;
  enviar(e: Evento): void;
  actualizar(p: Presencia): void;
  alEvento(cb: (e: Evento) => void): void;
  alPresencia(cb: (lista: Presencia[]) => void): void;
  alEstado(cb: (e: EstadoRed) => void): void;
  cerrar(): void;
}

// ------------------------------------------------------------ Supabase
class RedSupabase implements Red {
  readonly modo = "supabase" as const;
  private cliente: RealtimeClient;
  private canal: RealtimeChannel | null = null;
  private yo: Presencia | null = null;
  private cbEvento: (e: Evento) => void = () => {};
  private cbPresencia: (l: Presencia[]) => void = () => {};
  private cbEstado: (e: EstadoRed) => void = () => {};
  private ultimoTrack = 0;
  private trackPendiente: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string, key: string) {
    this.cliente = new RealtimeClient(`${url.replace(/\/$/, "")}/realtime/v1`, { params: { apikey: key, eventsPerSecond: 10 } });
  }
  alEvento(cb: (e: Evento) => void) {
    this.cbEvento = cb;
  }
  alPresencia(cb: (l: Presencia[]) => void) {
    this.cbPresencia = cb;
  }
  alEstado(cb: (e: EstadoRed) => void) {
    this.cbEstado = cb;
  }
  unir(topico: string, yo: Presencia) {
    this.salir();
    this.yo = yo;
    this.cbEstado("conectando");
    const canal = this.cliente.channel(topico, { config: { broadcast: { self: false }, presence: { key: yo.id, enabled: true } } });
    canal.on("broadcast", { event: "ev" }, ({ payload }) => this.cbEvento(payload as Evento));
    canal.on("broadcast", { event: "chat" }, ({ payload }) => this.cbEvento({ tipo: "chat", ...(payload as object) } as Evento));
    canal.on("presence", { event: "sync" }, () => {
      const estado = canal.presenceState<Presencia>();
      const lista: Presencia[] = [];
      for (const [k, metas] of Object.entries(estado)) {
        const m = metas[metas.length - 1] as unknown as Presencia | undefined;
        if (m && k !== yo.id) lista.push(m);
      }
      this.cbPresencia(lista);
    });
    canal.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        this.cbEstado("en-vivo");
        void canal.track(this.yo as unknown as Record<string, unknown>);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") this.cbEstado("reconectando");
      else if (status === "CLOSED") this.cbEstado("sin-red");
    });
    this.canal = canal;
  }
  salir() {
    if (this.trackPendiente) clearTimeout(this.trackPendiente);
    if (this.canal) {
      const c = this.canal;
      this.canal = null;
      void c.untrack().catch(() => {});
      void this.cliente.removeChannel(c);
    }
  }
  enviar(e: Evento) {
    void this.canal?.send({ type: "broadcast", event: "ev", payload: e });
  }
  /** La presencia se actualiza como mucho cada 1,5 s (al detenerse). */
  actualizar(p: Presencia) {
    this.yo = p;
    const ahora = Date.now();
    const hacer = () => {
      this.ultimoTrack = Date.now();
      void this.canal?.track(this.yo as unknown as Record<string, unknown>);
    };
    if (this.trackPendiente) clearTimeout(this.trackPendiente);
    if (ahora - this.ultimoTrack > 1500) hacer();
    else this.trackPendiente = setTimeout(hacer, 1500 - (ahora - this.ultimoTrack));
  }
  cerrar() {
    this.salir();
    this.cliente.disconnect();
  }
}

// ------------------------------------------------- local (entre pestañas)
class RedLocal implements Red {
  readonly modo = "local" as const;
  private bc: BroadcastChannel | null = null;
  private yo: Presencia | null = null;
  private otros = new Map<string, { p: Presencia; visto: number }>();
  private latido: ReturnType<typeof setInterval> | null = null;
  private cbEvento: (e: Evento) => void = () => {};
  private cbPresencia: (l: Presencia[]) => void = () => {};
  private cbEstado: (e: EstadoRed) => void = () => {};
  alEvento(cb: (e: Evento) => void) {
    this.cbEvento = cb;
  }
  alPresencia(cb: (l: Presencia[]) => void) {
    this.cbPresencia = cb;
  }
  alEstado(cb: (e: EstadoRed) => void) {
    this.cbEstado = cb;
  }
  private avisar() {
    const ahora = Date.now();
    for (const [k, v] of this.otros) if (ahora - v.visto > 9000) this.otros.delete(k);
    this.cbPresencia([...this.otros.values()].map((v) => v.p));
  }
  unir(topico: string, yo: Presencia) {
    this.salir();
    this.yo = yo;
    this.bc = new BroadcastChannel(topico);
    this.bc.onmessage = (m) => {
      const d = m.data as { k: "hola" | "chau" | "ev"; p?: Presencia; e?: Evento };
      if (d.k === "ev" && d.e) this.cbEvento(d.e);
      else if (d.k === "hola" && d.p && d.p.id !== this.yo?.id) {
        const nuevo = !this.otros.has(d.p.id);
        this.otros.set(d.p.id, { p: d.p, visto: Date.now() });
        if (nuevo) this.bc?.postMessage({ k: "hola", p: this.yo });
        this.avisar();
      } else if (d.k === "chau" && d.p) {
        this.otros.delete(d.p.id);
        this.avisar();
      }
    };
    this.bc.postMessage({ k: "hola", p: yo });
    this.latido = setInterval(() => {
      this.bc?.postMessage({ k: "hola", p: this.yo });
      this.avisar();
    }, 3000);
    this.cbEstado("local");
  }
  salir() {
    if (this.latido) clearInterval(this.latido);
    if (this.bc) {
      this.bc.postMessage({ k: "chau", p: this.yo });
      this.bc.close();
    }
    this.bc = null;
    this.otros.clear();
  }
  enviar(e: Evento) {
    this.bc?.postMessage({ k: "ev", e });
  }
  actualizar(p: Presencia) {
    this.yo = p;
    this.bc?.postMessage({ k: "hola", p });
  }
  cerrar() {
    this.salir();
  }
}

class RedNinguna implements Red {
  readonly modo = "ninguno" as const;
  unir() {}
  salir() {}
  enviar() {}
  actualizar() {}
  alEvento() {}
  alPresencia() {}
  alEstado(cb: (e: EstadoRed) => void) {
    cb("sin-red");
  }
  cerrar() {}
}

export function crearRed(config: { url: string; key: string } | null, conJugador: boolean): Red {
  if (!conJugador) return new RedNinguna();
  if (config) return new RedSupabase(config.url, config.key);
  if (typeof BroadcastChannel !== "undefined") return new RedLocal();
  return new RedNinguna();
}

export function topico(seasonId: string, sala: SalaId) {
  return `snow:${seasonId}:${sala}`;
}
