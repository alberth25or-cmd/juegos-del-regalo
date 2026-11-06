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
  /** Número del último movimiento enviado: ordena la presencia (lenta) frente a los movimientos. */
  seq?: number;
}

export type Evento =
  | { tipo: "mover"; id: string; de: { x: number; y: number }; a: { x: number; y: number }; seq?: number }
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
/**
 * Límites de Supabase Realtime que mandan aquí (docs "Realtime limits" y "error codes"):
 * - Máximo 5 llamadas de presencia (track/untrack) por cliente cada 30 s. Si se pasa, el
 *   servidor CIERRA el canal de ese cliente sin avisar (ClientPresenceRateLimitReached):
 *   la persona sigue viendo su mapa pero deja de ver a los demás. Por eso la posición viaja
 *   por broadcast y la presencia solo se publica al entrar y, como mucho, cada 10 s.
 * - Mensajes por segundo por proyecto (100 en el plan gratis): los movimientos se agrupan.
 *
 * Además hay un vigía: si el canal se cae, el celular vuelve de segundo plano o recupera
 * internet, se vuelve a unir solo con un canal nuevo (y la lista de presentes fresca).
 */
const PRESENCIA_MAX = 4; // por ventana de 30 s (1 de margen sobre el límite de 5)
const PRESENCIA_VENTANA = 30_000;
const PRESENCIA_HUECO_ENTRAR = 1_500;
const PRESENCIA_HUECO_POS = 10_000;
const MOVER_CADA = 250; // como mucho 4 "mover" por segundo

export class RedSupabase implements Red {
  readonly modo = "supabase" as const;
  private cliente: RealtimeClient;
  private canal: RealtimeChannel | null = null;
  private topico: string | null = null;
  private yo: Presencia | null = null;
  private generacion = 0;
  private cbEvento: (e: Evento) => void = () => {};
  private cbPresencia: (l: Presencia[]) => void = () => {};
  private cbEstado: (e: EstadoRed) => void = () => {};
  private estado: EstadoRed = "conectando";
  // presencia
  private tracks: number[] = [];
  private trackTimer: ReturnType<typeof setTimeout> | null = null;
  private publicado = false;
  // movimientos
  private seq = 0;
  private ultimoMover = 0;
  private moverPendiente: Evento | null = null;
  private moverTimer: ReturnType<typeof setTimeout> | null = null;
  // vigía
  private vigia: ReturnType<typeof setInterval> | null = null;
  private malDesde = 0;
  private ultimoIntento = 0;
  private ocultoDesde = 0;
  private quitarEscuchas: () => void = () => {};

  /** `cliente` solo se pasa en los tests (un Supabase falso con sus límites). */
  constructor(url: string, key: string, cliente?: RealtimeClient) {
    this.cliente =
      cliente ??
      new RealtimeClient(`${url.replace(/\/$/, "")}/realtime/v1`, {
        params: { apikey: key, eventsPerSecond: 10 },
        heartbeatIntervalMs: 15_000,
      });
    if (typeof window !== "undefined") {
      const alVisibilidad = () => {
        if (document.hidden) this.ocultoDesde = Date.now();
        else this.alVolver();
      };
      const alOnline = () => this.reunir();
      const alPageshow = () => this.alVolver();
      document.addEventListener("visibilitychange", alVisibilidad);
      window.addEventListener("online", alOnline);
      window.addEventListener("pageshow", alPageshow);
      this.quitarEscuchas = () => {
        document.removeEventListener("visibilitychange", alVisibilidad);
        window.removeEventListener("online", alOnline);
        window.removeEventListener("pageshow", alPageshow);
      };
      this.vigia = setInterval(() => this.revisar(), 4000);
    }
  }
  alEvento(cb: (e: Evento) => void) {
    this.cbEvento = cb;
  }
  alPresencia(cb: (l: Presencia[]) => void) {
    this.cbPresencia = cb;
  }
  alEstado(cb: (e: EstadoRed) => void) {
    this.cbEstado = cb;
    cb(this.estado);
  }
  private ponerEstado(e: EstadoRed) {
    if (this.estado === e) return;
    this.estado = e;
    this.cbEstado(e);
  }

  unir(topico: string, yo: Presencia) {
    this.topico = topico;
    this.yo = { ...yo, seq: this.seq };
    this.ponerEstado("conectando");
    void this.conectar();
  }

  /** Crea un canal NUEVO para el tópico actual, soltando antes el anterior. */
  private async conectar() {
    const gen = ++this.generacion;
    this.ultimoIntento = Date.now();
    this.malDesde = Date.now();
    this.publicado = false;
    const viejo = this.canal;
    this.canal = null;
    if (viejo) await this.soltar(viejo);
    const t = this.topico;
    if (!t || gen !== this.generacion) return;
    // realtime-js reutiliza un canal con el mismo tópico aunque se esté cerrando (y al
    // cerrarse borra por tópico también el nuevo): esperamos a que se vaya del todo.
    for (const c of this.cliente.getChannels()) if (c.topic === `realtime:${t}`) await this.soltar(c);
    if (gen !== this.generacion) return;

    const yoId = this.yo?.id ?? "";
    const canal = this.cliente.channel(t, { config: { broadcast: { self: false }, presence: { key: yoId, enabled: true } } });
    canal.on("broadcast", { event: "ev" }, ({ payload }) => {
      if (this.canal === canal) this.cbEvento(payload as Evento);
    });
    canal.on("broadcast", { event: "chat" }, ({ payload }) => {
      if (this.canal === canal) this.cbEvento({ tipo: "chat", ...(payload as object) } as Evento);
    });
    canal.on("presence", { event: "sync" }, () => {
      if (this.canal !== canal) return;
      const estado = canal.presenceState<Presencia>();
      const lista: Presencia[] = [];
      for (const [k, metas] of Object.entries(estado)) {
        const m = metas[metas.length - 1] as unknown as Presencia | undefined;
        if (m && k !== yoId) lista.push(m);
      }
      this.cbPresencia(lista);
    });
    this.canal = canal;
    canal.subscribe((status) => {
      if (this.canal !== canal) return;
      if (status === "SUBSCRIBED") {
        this.malDesde = 0;
        this.ponerEstado("en-vivo");
        this.publicado = false;
        this.publicar(true);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        this.ponerEstado("reconectando");
        if (!this.malDesde) this.malDesde = Date.now();
      }
    });
  }

  /** Sale de un canal sin tocar la presencia a mano (salir del canal ya la borra y no gasta cupo). */
  private async soltar(c: RealtimeChannel) {
    try {
      await Promise.race([c.unsubscribe(), new Promise((r) => setTimeout(r, 2500))]);
    } catch {}
    try {
      c.teardown();
    } catch {}
    const cli = this.cliente as unknown as { channels?: RealtimeChannel[] };
    if (Array.isArray(cli.channels)) cli.channels = cli.channels.filter((x) => x !== c);
  }

  private unido() {
    const c = this.canal;
    return !!c && c.state === "joined" && this.cliente.isConnected() && this.cliente.getChannels().includes(c);
  }

  /** Vigía: si el canal lleva un rato caído o el servidor lo cerró, se rehace solo. */
  private revisar() {
    if (!this.topico || document.hidden) return;
    if (this.unido()) {
      this.malDesde = 0;
      this.ponerEstado("en-vivo");
      if (!this.publicado && !this.trackTimer) this.publicar(true);
      return;
    }
    const ahora = Date.now();
    if (!this.malDesde) this.malDesde = ahora;
    this.ponerEstado("reconectando");
    const st = this.canal?.state;
    const muerto = !this.canal || st === "closed" || st === "errored";
    const espera = muerto ? 3000 : 12_000; // si sigue uniéndose, darle tiempo a realtime-js
    if (ahora - this.malDesde > espera && ahora - this.ultimoIntento > 5000) this.reunir();
  }

  /** Al volver de segundo plano: el celular congela la conexión, así que se rehace si hace falta. */
  private alVolver() {
    if (!this.topico) return;
    const fuera = this.ocultoDesde ? Date.now() - this.ocultoDesde : 0;
    this.ocultoDesde = 0;
    if (fuera > 15_000 || !this.unido()) this.reunir();
  }

  private reunir() {
    if (!this.topico || Date.now() - this.ultimoIntento < 2000) return;
    this.ponerEstado("reconectando");
    if (!this.cliente.isConnected()) this.cliente.connect();
    void this.conectar();
  }

  /** Publica la presencia sin pasarse del límite de Supabase (máx. 4 cada 30 s, con espacio). */
  private publicar(alEntrar: boolean) {
    if (this.trackTimer) {
      clearTimeout(this.trackTimer);
      this.trackTimer = null;
    }
    const ahora = Date.now();
    this.tracks = this.tracks.filter((t) => ahora - t < PRESENCIA_VENTANA);
    const ultimo = this.tracks[this.tracks.length - 1] ?? 0;
    let espera = Math.max(0, ultimo + (alEntrar ? PRESENCIA_HUECO_ENTRAR : PRESENCIA_HUECO_POS) - ahora);
    if (this.tracks.length >= PRESENCIA_MAX) espera = Math.max(espera, this.tracks[0] + PRESENCIA_VENTANA - ahora + 200);
    if (espera > 0) {
      this.trackTimer = setTimeout(() => {
        this.trackTimer = null;
        this.publicar(alEntrar);
      }, espera);
      return;
    }
    const c = this.canal;
    if (!c || !this.yo || c.state !== "joined") return; // al unirse se vuelve a llamar
    this.tracks.push(ahora);
    this.publicado = true;
    void c.track(this.yo as unknown as Record<string, unknown>).catch(() => {
      this.publicado = false;
    });
  }

  salir() {
    this.generacion++;
    this.topico = null;
    if (this.trackTimer) clearTimeout(this.trackTimer);
    if (this.moverTimer) clearTimeout(this.moverTimer);
    this.trackTimer = null;
    this.moverTimer = null;
    this.moverPendiente = null;
    const c = this.canal;
    this.canal = null;
    if (c) void this.soltar(c);
  }

  enviar(e: Evento) {
    if (e.tipo !== "mover") {
      void this.canal?.send({ type: "broadcast", event: "ev", payload: e });
      return;
    }
    // Movimientos numerados y agrupados: si tocan muy seguido, solo viaja el último.
    this.seq++;
    const ev: Evento = { ...e, seq: this.seq };
    if (this.yo) this.yo = { ...this.yo, seq: this.seq };
    const mandar = (x: Evento) => {
      this.ultimoMover = Date.now();
      this.moverPendiente = null;
      void this.canal?.send({ type: "broadcast", event: "ev", payload: x });
    };
    const desde = Date.now() - this.ultimoMover;
    if (desde >= MOVER_CADA && !this.moverTimer) {
      mandar(ev);
      return;
    }
    this.moverPendiente = ev;
    if (!this.moverTimer) {
      this.moverTimer = setTimeout(() => {
        this.moverTimer = null;
        if (this.moverPendiente) mandar(this.moverPendiente);
      }, Math.max(0, MOVER_CADA - desde));
    }
  }

  /** Al detenerse: la posición entra a la presencia (para quien llegue después), sin pasarse del límite. */
  actualizar(p: Presencia) {
    this.yo = { ...p, seq: this.seq };
    this.publicar(false);
  }

  cerrar() {
    this.salir();
    if (this.vigia) clearInterval(this.vigia);
    this.quitarEscuchas();
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
  private seq = 0;
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
    this.yo = { ...yo, seq: this.seq };
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
    this.bc.postMessage({ k: "hola", p: this.yo });
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
    if (e.tipo === "mover") {
      this.seq++;
      e = { ...e, seq: this.seq };
      if (this.yo) this.yo = { ...this.yo, seq: this.seq };
    }
    this.bc?.postMessage({ k: "ev", e });
  }
  actualizar(p: Presencia) {
    this.yo = { ...p, seq: this.seq };
    this.bc?.postMessage({ k: "hola", p: this.yo });
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
