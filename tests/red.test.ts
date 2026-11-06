/**
 * La red del mundo contra un Supabase Realtime FALSO que aplica su límite real:
 * más de 5 llamadas de presencia por cliente en 30 s => el servidor cierra el canal.
 * (Era la causa de "un amigo deja de ver a los demás aunque sigue en su mapa".)
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";

// El módulo usa window/document solo para escuchar "volver de segundo plano".
const escuchas = new Map<string, () => void>();
const doc = { hidden: false, addEventListener: (n: string, f: () => void) => escuchas.set(n, f), removeEventListener: () => {} };
Object.assign(globalThis, { document: doc, window: { addEventListener: (n: string, f: () => void) => escuchas.set(n, f), removeEventListener: () => {} } });

const { RedSupabase } = await import("../src/components/mundo/red.ts");

class CanalFalso {
  state = "closed";
  tracks: number[] = [];
  enviados: unknown[] = [];
  cerradoPorServidor = false;
  private cbSub: ((s: string) => void) | null = null;
  topic: string;
  private cli: ClienteFalso;
  constructor(topic: string, cli: ClienteFalso) {
    this.topic = topic;
    this.cli = cli;
  }
  on() {
    return this;
  }
  subscribe(cb: (s: string) => void) {
    this.cbSub = cb;
    this.state = "joining";
    setTimeout(() => {
      if (this.state !== "joining") return;
      this.state = "joined";
      cb("SUBSCRIBED");
    }, 100);
    return this;
  }
  async track() {
    const ahora = Date.now();
    this.cli.tracks.push(ahora);
    const recientes = this.cli.tracks.filter((t) => ahora - t < 30_000);
    if (recientes.length > 5) this.cerrarServidor();
    return "ok";
  }
  cerrarServidor() {
    this.cerradoPorServidor = true;
    this.state = "closed";
    this.cbSub?.("CLOSED");
  }
  async unsubscribe() {
    this.state = "leaving";
    await new Promise((r) => setTimeout(r, 300));
    this.state = "closed";
    return "ok";
  }
  teardown() {}
  presenceState() {
    return {};
  }
  async send(m: unknown) {
    this.enviados.push(m);
    return "ok";
  }
}

class ClienteFalso {
  channels: CanalFalso[] = [];
  creados: CanalFalso[] = [];
  tracks: number[] = [];
  conectado = true;
  channel(t: string) {
    const topic = `realtime:${t}`;
    const ya = this.channels.find((c) => c.topic === topic);
    if (ya) return ya; // igual que realtime-js: reutiliza
    const c = new CanalFalso(topic, this);
    this.channels.push(c);
    this.creados.push(c);
    return c;
  }
  getChannels() {
    return this.channels;
  }
  isConnected() {
    return this.conectado;
  }
  connect() {
    this.conectado = true;
  }
  disconnect() {}
}

const yo = { id: "p1", nombre: "Ana", avatar: null, color: null, x: 5, y: 5 };

function montar() {
  mock.timers.enable({ apis: ["setTimeout", "setInterval", "Date"], now: 1_000_000 });
  const cli = new ClienteFalso();
  const red = new RedSupabase("", "", cli as never);
  const estados: string[] = [];
  red.alEstado((e) => estados.push(e));
  return { cli, red, estados };
}

async function avanzar(ms: number, paso = 100) {
  for (let t = 0; t < ms; t += paso) {
    mock.timers.tick(paso);
    await Promise.resolve();
    await Promise.resolve();
  }
}

test("caminar sin parar nunca pasa el límite de presencia (el canal no se cierra)", async () => {
  const { cli, red, estados } = montar();
  try {
    red.unir("snow:t:snowville", yo);
    await avanzar(500);
    assert.equal(estados.at(-1), "en-vivo");
    // 2 minutos tocando el mapa: un movimiento y una parada cada 1,5 s.
    for (let i = 0; i < 80; i++) {
      red.enviar({ tipo: "mover", id: "p1", de: { x: i, y: 5 }, a: { x: i + 1, y: 5 } });
      await avanzar(1500);
      red.actualizar({ ...yo, x: i + 1 });
    }
    await avanzar(31_000);
    assert.ok(!cli.creados.some((c) => c.cerradoPorServidor), "el servidor cerró un canal por exceso de presencia");
    for (let i = 0; i < cli.tracks.length; i++) {
      const enVentana = cli.tracks.filter((t) => t > cli.tracks[i] - 30_000 && t <= cli.tracks[i]).length;
      assert.ok(enVentana <= 4, `más de 4 track en 30 s (${enVentana})`);
    }
    // La última posición sí llegó a la presencia.
    assert.ok(cli.tracks.length >= 2);
    assert.equal(estados.at(-1), "en-vivo");
  } finally {
    red.cerrar();
    mock.timers.reset();
  }
});

test("si el servidor cierra el canal, se vuelve a unir solo", async () => {
  const { cli, red, estados } = montar();
  try {
    red.unir("snow:t:snowville", yo);
    await avanzar(500);
    cli.creados[0].cerrarServidor();
    assert.equal(estados.at(-1), "reconectando");
    await avanzar(15_000);
    assert.ok(cli.creados.length >= 2, "no creó un canal nuevo");
    assert.equal(cli.creados.at(-1)!.state, "joined");
    assert.equal(estados.at(-1), "en-vivo");
  } finally {
    red.cerrar();
    mock.timers.reset();
  }
});

test("salir y volver rápido a la misma sala crea un canal nuevo (no reutiliza el que se cierra)", async () => {
  const { cli, red } = montar();
  try {
    red.unir("snow:t:snowville", yo);
    await avanzar(500);
    red.unir("snow:t:arcade", yo);
    await avanzar(50);
    red.unir("snow:t:snowville", yo);
    await avanzar(3000);
    const ultimo = cli.creados.at(-1)!;
    assert.equal(ultimo.topic, "realtime:snow:t:snowville");
    assert.notEqual(ultimo, cli.creados[0]);
    assert.equal(ultimo.state, "joined");
    assert.equal(cli.channels.filter((c) => c.topic === ultimo.topic).length, 1);
  } finally {
    red.cerrar();
    mock.timers.reset();
  }
});

test("al volver de segundo plano tras un rato, se rehace la conexión", async () => {
  const { cli, red } = montar();
  try {
    red.unir("snow:t:snowville", yo);
    await avanzar(500);
    doc.hidden = true;
    escuchas.get("visibilitychange")?.();
    await avanzar(20_000);
    doc.hidden = false;
    escuchas.get("visibilitychange")?.();
    await avanzar(1500);
    assert.equal(cli.creados.length, 2);
    assert.equal(cli.creados[1].state, "joined");
  } finally {
    red.cerrar();
    mock.timers.reset();
  }
});

test("los movimientos van numerados y los toques seguidos se agrupan", async () => {
  const { cli, red } = montar();
  try {
    red.unir("snow:t:snowville", yo);
    await avanzar(500);
    for (let i = 0; i < 10; i++) red.enviar({ tipo: "mover", id: "p1", de: { x: 1, y: 1 }, a: { x: 2 + i, y: 1 } });
    await avanzar(600);
    const enviados = cli.creados[0].enviados as { payload: { seq: number; a: { x: number } } }[];
    assert.equal(enviados.length, 2, "debió mandar el primero y el último");
    assert.equal(enviados[1].payload.a.x, 11);
    assert.ok(enviados[1].payload.seq > enviados[0].payload.seq);
  } finally {
    red.cerrar();
    mock.timers.reset();
  }
});
