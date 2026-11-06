/**
 * Motor del mundo (canvas 2D). Sin React: el componente Mundo le pasa toques y
 * recibe avisos (entrar a una sala, tocar un objeto, un NPC o a otro jugador).
 */
import { caminable, sala as salaPorId, transicionEn, type Objeto, type Sala, type SalaId } from "@/features/mundo/mapas";
import { buscarRuta, masCercanoCaminable, posicionEnRuta, VELOCIDAD, type Punto } from "@/features/mundo/ruta";
import type { NpcId } from "@/features/contenido/npcs";
import { arteDeSala, T, type ArteSala, type Dibujable } from "./arte";
import { cuadrosAvatar, cuadrosNpc, type Cuadros, type Dir } from "./personajes";

export interface Burbuja {
  texto: string;
  tipo: "emote" | "chat";
  hasta: number;
}

interface Ente {
  id: string;
  nombre: string;
  color: string | null;
  cuadros: Cuadros | null;
  npc?: NpcId;
  pos: Punto;
  origen: Punto;
  ruta: Punto[];
  inicio: number;
  dir: Dir;
  burbuja?: Burbuja;
  esYo?: boolean;
  pendiente?: boolean;
  casa?: { x: number; y: number; radio: number };
  proximoPaseo?: number;
  /** Último número de movimiento recibido de este jugador (ordena red vs. presencia). */
  seq?: number;
}

export type Accion =
  | { tipo: "interaccion"; objeto: Objeto }
  | { tipo: "npc"; npc: NpcId }
  | { tipo: "jugador"; id: string; nombre: string }
  | { tipo: "puerta" };

export interface AvisosMotor {
  alCambiarSala(destino: SalaId, llegada: Punto): void;
  alAccion(a: Accion): void;
  alMoverme(de: Punto, a: Punto): void;
  alDetenerme(p: Punto): void;
}

const DIR_DE = (d: Punto, prev: Dir): Dir => (d.x > 0 ? "der" : d.x < 0 ? "izq" : d.y < 0 ? "arriba" : d.y > 0 ? "abajo" : prev);

function hash(s: string, n: number) {
  let h = n | 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}

const brillos = new Map<string, HTMLCanvasElement>();
function brillo(color: string) {
  let c = brillos.get(color);
  if (!c) {
    c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${color},0.55)`);
    gr.addColorStop(0.5, `rgba(${color},0.18)`);
    gr.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    brillos.set(color, c);
  }
  return c;
}

export class Motor {
  private ctx: CanvasRenderingContext2D;
  private oscuro = document.createElement("canvas");
  private octx = this.oscuro.getContext("2d")!;
  sala!: Sala;
  private arte!: ArteSala;
  yo!: Ente;
  private otros = new Map<string, Ente>();
  private npcs: Ente[] = [];
  private cam = { x: 0, y: 0 };
  private k = 3;
  private raf = 0;
  private ultimo = 0;
  private fuente = "monospace";
  private luces = 0;
  private leidoLuces = 0;
  private objetivo: { tile: Punto; hasta: number } | null = null;
  private alLlegar: Accion | null = null;
  private pendiente: Punto | null = null;
  private transicion: { hasta: number; destino: SalaId; llegada: Punto } | null = null;
  private fundido = 1;
  private copos = Array.from({ length: 50 }, () => ({ x: Math.random(), y: Math.random(), v: 0.02 + Math.random() * 0.04, d: Math.random() * 6 }));
  private humo: { x: number; y: number; t: number }[] = [];
  ligero = false;
  /** Energía navideña del grupo (0–100 %): enciende las luces del árbol de la plaza. */
  energia = 0;
  vivo = true;
  private errorVisto = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private avisos: AvisosMotor,
    yo: { id: string; nombre: string; avatar: unknown; color: string | null; pendiente?: boolean },
    salaInicial: SalaId,
    pos?: Punto,
  ) {
    this.ctx = canvas.getContext("2d")!;
    const fuenteEl = document.querySelector(".font-pixel");
    if (fuenteEl) this.fuente = getComputedStyle(fuenteEl).fontFamily || this.fuente;
    this.cargarSala(salaInicial, pos);
    this.yo = this.crearEnte({ ...yo, esYo: true }, pos ?? this.sala.inicio);
    this.centrarCamara(true);
  }

  private crearEnte(d: { id: string; nombre: string; avatar?: unknown; color?: string | null; npc?: NpcId; esYo?: boolean; pendiente?: boolean }, p: Punto): Ente {
    return {
      id: d.id,
      nombre: d.nombre,
      color: d.color ?? null,
      cuadros: d.npc ? null : cuadrosAvatar(d.avatar),
      npc: d.npc,
      pos: { ...p },
      origen: { ...p },
      ruta: [],
      inicio: 0,
      dir: "abajo",
      esYo: d.esYo,
      pendiente: d.pendiente,
    };
  }

  private cargarSala(id: SalaId, pos?: Punto) {
    this.sala = salaPorId(id);
    this.arte = arteDeSala(this.sala);
    this.otros.clear();
    this.npcs = this.sala.npcs.map((n) => {
      const e = this.crearEnte({ id: `npc:${n.id}`, nombre: "", npc: n.id }, { x: n.x, y: n.y });
      e.casa = { x: n.x, y: n.y, radio: n.radio };
      e.proximoPaseo = performance.now() + 1500 + hash(n.id, 1) * 4000;
      return e;
    });
    this.objetivo = null;
    this.alLlegar = null;
    if (this.yo) {
      const p = pos ?? this.sala.inicio;
      this.yo.pos = { ...p };
      this.yo.origen = { ...p };
      this.yo.ruta = [];
    }
  }

  // ------------------------------------------------------------ tamaño
  medir() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    // ~9-10 baldosas de ancho en un celular; múltiplos de 0,5 para que el pixel se vea parejo.
    const esc = Math.max(2, Math.min(4, Math.round(Math.min(w / (T * 9.5), h / (T * 13)) * 2) / 2));
    this.k = esc * dpr;
    this.oscuro.width = Math.ceil(this.canvas.width / 6);
    this.oscuro.height = Math.ceil(this.canvas.height / 6);
    this.ctx.imageSmoothingEnabled = false;
    this.centrarCamara(true);
  }

  private vista() {
    return { w: this.canvas.width / this.k, h: this.canvas.height / this.k };
  }

  private centrarCamara(ya = false) {
    const v = this.vista();
    const mundoW = this.sala.ancho * T;
    const mundoH = this.sala.alto * T;
    let tx = (this.yo?.pos.x ?? this.sala.inicio.x) * T + T / 2 - v.w / 2;
    let ty = (this.yo?.pos.y ?? this.sala.inicio.y) * T - v.h / 2;
    tx = mundoW <= v.w ? (mundoW - v.w) / 2 : Math.max(0, Math.min(mundoW - v.w, tx));
    ty = mundoH <= v.h ? (mundoH - v.h) / 2 : Math.max(0, Math.min(mundoH - v.h, ty));
    if (ya) this.cam = { x: tx, y: ty };
    else {
      this.cam.x += (tx - this.cam.x) * 0.12;
      this.cam.y += (ty - this.cam.y) * 0.12;
    }
  }

  // ------------------------------------------------------------ jugadores
  sincronizar(lista: { id: string; nombre: string; avatar: unknown; color: string | null; x: number; y: number; pendiente?: boolean; seq?: number }[]) {
    const vistos = new Set<string>();
    for (const p of lista) {
      vistos.add(p.id);
      const e = this.otros.get(p.id);
      if (!e) {
        const n = this.crearEnte(p, { x: p.x, y: p.y });
        n.seq = p.seq ?? 0;
        this.otros.set(p.id, n);
      } else {
        e.nombre = p.nombre;
        // La presencia se publica con retraso: solo manda si es igual o más nueva que el último movimiento recibido.
        const seq = p.seq ?? 0;
        if (seq < (e.seq ?? 0)) continue;
        e.seq = seq;
        if (e.ruta.length === 0 && (Math.abs(e.pos.x - p.x) > 0.5 || Math.abs(e.pos.y - p.y) > 0.5)) this.moverEnte(e, { x: Math.round(e.pos.x), y: Math.round(e.pos.y) }, { x: p.x, y: p.y });
      }
    }
    for (const id of [...this.otros.keys()]) if (!vistos.has(id)) this.otros.delete(id);
  }

  /** Para pruebas: posición de cada jugador visible. */
  depurar() {
    return { sala: this.sala.id, yo: this.yo.pos, otros: [...this.otros.values()].map((e) => ({ id: e.id, nombre: e.nombre, pos: e.pos, andando: e.ruta.length > 0 })) };
  }

  cuantosAqui() {
    return this.otros.size;
  }

  listaAqui() {
    return [...this.otros.values()].map((e) => ({ id: e.id, nombre: e.nombre }));
  }

  moverOtro(id: string, de: Punto, a: Punto, seq?: number) {
    const e = this.otros.get(id);
    if (!e) return;
    if (seq !== undefined) {
      if (seq < (e.seq ?? 0)) return;
      e.seq = seq;
    }
    if (Math.hypot(e.pos.x - de.x, e.pos.y - de.y) > 2) e.pos = { ...de };
    this.moverEnte(e, de, a);
  }

  burbuja(id: string, texto: string, tipo: Burbuja["tipo"]) {
    const e = id === this.yo.id ? this.yo : this.otros.get(id);
    if (e) e.burbuja = { texto, tipo, hasta: performance.now() + (tipo === "chat" ? 5500 : 3200) };
  }

  private moverEnte(e: Ente, de: Punto, a: Punto) {
    const ruta = buscarRuta(this.sala, de, a);
    e.origen = { ...de };
    e.ruta = ruta;
    e.inicio = performance.now();
    if (ruta.length === 0) e.pos = { ...de };
  }

  // ---------------------------------------------------------------- toques
  tocar(clientX: number, clientY: number) {
    if (this.transicion) return;
    const r = this.canvas.getBoundingClientRect();
    const dpr = this.canvas.width / r.width;
    const wx = this.cam.x + ((clientX - r.left) * dpr) / this.k;
    const wy = this.cam.y + ((clientY - r.top) * dpr) / this.k;

    // 1) otro jugador
    for (const e of this.otros.values()) {
      if (this.dentroEnte(e, wx, wy)) return this.avisos.alAccion({ tipo: "jugador", id: e.id, nombre: e.nombre });
    }
    // 2) NPC
    for (const n of this.npcs) {
      if (this.dentroEnte(n, wx, wy)) {
        this.irA({ x: Math.round(n.pos.x), y: Math.round(n.pos.y) + 1 }, { tipo: "npc", npc: n.npc! });
        return;
      }
    }
    // 3) objetos interactivos y edificios (por su dibujo, que sobresale hacia arriba)
    for (let i = this.arte.altos.length - 1; i >= 0; i--) {
      const d = this.arte.altos[i];
      if (!this.dentroDibujo(d, wx, wy)) continue;
      if (d.objeto?.interaccion) {
        const o = d.objeto;
        this.irA({ x: o.x + Math.floor(o.w / 2), y: o.y + o.h }, { tipo: "interaccion", objeto: o });
        return;
      }
      if (d.edificio) {
        this.irA(d.edificio.puerta, { tipo: "puerta" });
        return;
      }
    }
    // 4) el suelo
    this.irA({ x: Math.floor(wx / T), y: Math.floor(wy / T) }, null);
  }

  private dentroEnte(e: Ente, wx: number, wy: number) {
    const w = e.npc ? 18 : (e.cuadros?.w ?? 16);
    const h = e.npc ? 22 : (e.cuadros?.h ?? 20);
    const x = e.pos.x * T + T / 2 - w / 2;
    const y = (e.pos.y + 1) * T - h;
    return wx >= x - 3 && wx <= x + w + 3 && wy >= y - 3 && wy <= y + h + 3;
  }

  private dentroDibujo(d: Dibujable, wx: number, wy: number) {
    return wx >= d.x && wx <= d.x + d.img.width && wy >= d.y && wy <= d.y + d.img.height;
  }

  /** Camina hacia una baldosa. Si ya va caminando, termina el paso actual y cambia de rumbo. */
  irA(destino: Punto, accion: Accion | null) {
    const fin = masCercanoCaminable(this.sala, destino, this.yo.pos);
    if (!fin) return;
    this.alLlegar = accion;
    this.objetivo = { tile: fin, hasta: performance.now() + 900 };
    if (this.yo.ruta.length) {
      this.pendiente = fin;
      return;
    }
    this.empezarRuta(fin);
  }

  private empezarRuta(fin: Punto) {
    const de = { x: Math.round(this.yo.pos.x), y: Math.round(this.yo.pos.y) };
    this.moverEnte(this.yo, de, fin);
    if (this.yo.ruta.length) this.avisos.alMoverme(de, fin);
    else this.llegue();
  }

  private llegue() {
    const p = { x: Math.round(this.yo.pos.x), y: Math.round(this.yo.pos.y) };
    this.yo.pos = p;
    const tr = transicionEn(this.sala, p.x, p.y);
    if (tr) {
      this.transicion = { hasta: performance.now() + 350, destino: tr.destino, llegada: tr.llegada };
      this.alLlegar = null;
      return;
    }
    this.avisos.alDetenerme(p);
    const a = this.alLlegar;
    this.alLlegar = null;
    if (a) {
      if (a.tipo === "npc") {
        const n = this.npcs.find((x) => x.npc === a.npc);
        if (n) this.yo.dir = n.pos.x > p.x ? "der" : n.pos.x < p.x ? "izq" : n.pos.y < p.y ? "arriba" : "abajo";
      } else if (a.tipo === "interaccion") this.yo.dir = "arriba";
      this.avisos.alAccion(a);
    }
  }

  /** Entra a otra sala (lo llama el componente al terminar el fundido). */
  entrar(destino: SalaId, llegada: Punto) {
    this.cargarSala(destino, llegada);
    this.yo.dir = destino === "snowville" ? "abajo" : "arriba";
    this.centrarCamara(true);
  }

  // ------------------------------------------------------------------ bucle
  iniciar() {
    const paso = (t: number) => {
      if (!this.vivo) return;
      const dt = Math.min(64, t - (this.ultimo || t));
      if (this.ligero && dt < 30 && this.ultimo) {
        this.raf = requestAnimationFrame(paso);
        return;
      }
      this.ultimo = t;
      try {
        this.actualizar(t);
        this.dibujar(t, dt);
      } catch (e) {
        // Un error en un cuadro no debe congelar el mundo: se registra y se sigue.
        if (!this.errorVisto) console.error("[mundo]", e);
        this.errorVisto = true;
      }
      this.raf = requestAnimationFrame(paso);
    };
    this.raf = requestAnimationFrame(paso);
  }

  detener() {
    this.vivo = false;
    cancelAnimationFrame(this.raf);
  }

  private avanzar(e: Ente, t: number) {
    if (!e.ruta.length) return true;
    const r = posicionEnRuta(e.origen, e.ruta, t - e.inicio);
    e.pos = r.p;
    e.dir = DIR_DE(r.dir, e.dir);
    if (r.termino) {
      e.ruta = [];
      e.origen = { ...r.p };
      return true;
    }
    return false;
  }

  private actualizar(t: number) {
    // Yo
    if (this.yo.ruta.length) {
      if (this.pendiente) {
        // Cambiar de rumbo al llegar a la próxima baldosa del camino actual.
        const pasos = ((t - this.yo.inicio) / 1000) * VELOCIDAD;
        const n = Math.floor(pasos);
        if (n >= 1 || this.yo.ruta.length === 1) {
          const actual = this.yo.ruta[Math.min(this.yo.ruta.length - 1, Math.max(0, n - 1))];
          this.yo.pos = { ...actual };
          this.yo.ruta = [];
          const fin = this.pendiente;
          this.pendiente = null;
          this.empezarRuta(fin);
        }
      }
      if (this.yo.ruta.length && this.avanzar(this.yo, t)) this.llegue();
    }
    // Otros
    for (const e of this.otros.values()) this.avanzar(e, t);
    // NPCs que pasean
    for (const n of this.npcs) {
      this.avanzar(n, t);
      if (!n.ruta.length && n.casa && n.casa.radio > 0 && t > (n.proximoPaseo ?? 0)) {
        const k = Math.floor(Date.now() / 6000);
        const dx = Math.round((hash(n.id, k) * 2 - 1) * n.casa.radio);
        const dy = Math.round((hash(n.id, k + 99) * 2 - 1) * n.casa.radio);
        const dest = { x: n.casa.x + dx, y: n.casa.y + dy };
        if (caminable(this.sala, dest.x, dest.y)) this.moverEnte(n, { x: Math.round(n.pos.x), y: Math.round(n.pos.y) }, dest);
        n.proximoPaseo = t + 3500 + hash(n.id, k + 7) * 5000;
      }
    }
    // Transición entre salas
    if (this.transicion) {
      this.fundido = Math.max(0, this.fundido - 0.12);
      if (t >= this.transicion.hasta && this.fundido <= 0) {
        const tr = this.transicion;
        this.transicion = null;
        this.avisos.alCambiarSala(tr.destino, tr.llegada);
      }
    } else this.fundido = Math.min(1, this.fundido + 0.08);
    this.centrarCamara();
    if (t - this.leidoLuces > 2000) {
      this.leidoLuces = t;
      const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--lights"));
      this.luces = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
    }
  }

  // ----------------------------------------------------------------- dibujo
  private aPantalla(x: number, y: number) {
    return { x: Math.round((x - this.cam.x) * this.k), y: Math.round((y - this.cam.y) * this.k) };
  }

  private dibujarImg(img: HTMLCanvasElement, x: number, y: number) {
    const p = this.aPantalla(x, y);
    const w = Math.round(img.width * this.k);
    const h = Math.round(img.height * this.k);
    if (p.x > this.canvas.width || p.y > this.canvas.height || p.x + w < 0 || p.y + h < 0) return;
    this.ctx.drawImage(img, p.x, p.y, w, h);
  }

  private dibujarEnte(e: Ente, t: number) {
    const andando = e.ruta.length > 0;
    const fase = andando ? 1 + (Math.floor((t - e.inicio) / 140) % 2) : 0;
    const baseX = e.pos.x * T + T / 2;
    const baseY = (e.pos.y + 1) * T;
    // sombra
    const s = this.aPantalla(baseX - 6, baseY - 3);
    this.ctx.fillStyle = "rgba(42,35,66,0.25)";
    this.ctx.fillRect(s.x, s.y, 12 * this.k, 3 * this.k);
    if (e.npc) {
      const c = cuadrosNpc(e.npc);
      const img = e.dir === "izq" ? c.izq : c.der;
      const bob = andando ? (fase === 1 ? -1 : 0) : Math.sin(t / 400 + e.id.length) > 0.6 ? -1 : 0;
      this.dibujarImg(img, baseX - img.width / 2, baseY - img.height + 1 + bob);
      return;
    }
    const cu = e.cuadros!;
    const img = cu.dir[e.dir][fase];
    const bob = fase === 2 ? -1 : 0;
    if (e.color) {
      const a = this.aPantalla(baseX - 7, baseY - 2);
      this.ctx.fillStyle = e.color;
      this.ctx.globalAlpha = 0.55;
      this.ctx.fillRect(a.x, a.y, 14 * this.k, 2 * this.k);
      this.ctx.globalAlpha = 1;
    }
    this.dibujarImg(img, baseX - cu.w / 2, baseY - cu.h + 1 + bob);
  }

  private dibujar(t: number, dt: number) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const v = this.vista();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = this.sala.exterior ? "#1f3a4a" : "#1b1730";
    ctx.fillRect(0, 0, W, H);
    // Suelo (una sola copia recortada)
    const sx = Math.max(0, this.cam.x);
    const sy = Math.max(0, this.cam.y);
    const sw = Math.min(this.arte.suelo.width - sx, v.w);
    const sh = Math.min(this.arte.suelo.height - sy, v.h);
    if (sw > 0 && sh > 0) {
      const p = this.aPantalla(sx, sy);
      ctx.drawImage(this.arte.suelo, sx, sy, sw, sh, p.x, p.y, Math.round(sw * this.k), Math.round(sh * this.k));
    }
    // Animados planos: cinta transportadora
    for (const o of this.sala.objetos) {
      if (o.tipo !== "cinta") continue;
      const p = this.aPantalla(o.x * T, o.y * T + 3);
      ctx.fillStyle = "#3b3f5c";
      ctx.fillRect(p.x, p.y, o.w * T * this.k, 10 * this.k);
      ctx.fillStyle = "#555a7a";
      const off = (t / 60) % 8;
      for (let x = -8; x < o.w * T; x += 8) ctx.fillRect(p.x + Math.round((x + off) * this.k), p.y + 2 * this.k, 3 * this.k, 6 * this.k);
      // regalos viajando
      for (let k = 0; k < 4; k++) {
        const gx = ((t / 25 + k * 52) % (o.w * T - 10)) + 1;
        const q = this.aPantalla(o.x * T + gx, o.y * T - 2);
        ctx.fillStyle = ["#e2445c", "#2e9e78", "#f6b93b", "#7b4bb7"][k];
        ctx.fillRect(q.x, q.y, 9 * this.k, 8 * this.k);
        ctx.fillStyle = "#fff6e5";
        ctx.fillRect(q.x + 4 * this.k, q.y, this.k, 8 * this.k);
      }
    }
    // Marcador de destino
    if (this.objetivo && t < this.objetivo.hasta) {
      const p = this.aPantalla(this.objetivo.tile.x * T + 3, this.objetivo.tile.y * T + 3);
      const a = (this.objetivo.hasta - t) / 900;
      ctx.strokeStyle = `rgba(246,185,59,${a})`;
      ctx.lineWidth = this.k;
      ctx.strokeRect(p.x, p.y, 10 * this.k, 10 * this.k);
    }

    // Profundidad: estáticos altos + personajes, ordenados por su base.
    const entes: Ente[] = [...this.npcs, ...this.otros.values(), this.yo];
    entes.sort((a, b) => a.pos.y - b.pos.y);
    let i = 0;
    const altos = this.arte.altos;
    for (const e of entes) {
      const base = e.pos.y + 1;
      while (i < altos.length && altos[i].yBase <= base) this.dibujarAlto(altos[i++], t);
      this.dibujarEnte(e, t);
    }
    while (i < altos.length) this.dibujarAlto(altos[i++], t);

    // Humo de la chimenea de la fábrica
    const fab = this.sala.edificios.find((e) => e.estilo === "fabrica");
    if (fab) {
      // chimenea del dibujo de la fábrica (a ~72 % del ancho, sobre el techo)
      if (Math.random() < dt / 180) this.humo.push({ x: fab.x * T + fab.w * T * 0.7, y: (fab.y + fab.h) * T - 116, t });
      this.humo = this.humo.filter((h) => t - h.t < 3200);
      for (const h of this.humo) {
        const e = (t - h.t) / 3200;
        const p = this.aPantalla(h.x + Math.sin(e * 6) * 4 + e * 10, h.y - e * 40);
        ctx.fillStyle = `rgba(230,236,246,${0.7 * (1 - e)})`;
        const s = Math.round((3 + e * 6) * this.k);
        ctx.fillRect(p.x, p.y, s, s);
      }
    }
    // Lucecitas del árbol de la plaza
    // (cuántas se encienden depende de la energía navideña del grupo)
    const arbol = this.sala.objetos.find((o) => o.tipo === "arbolPlaza");
    if (arbol) {
      const cols = ["#ff5a7a", "#ffd23f", "#7ce0ff", "#b9f5a7", "#ffffff"];
      const encendidas = Math.round(3 + (Math.max(0, Math.min(100, this.energia)) / 100) * 37);
      if (this.energia >= 100) {
        const p = this.aPantalla((arbol.x + arbol.w / 2) * T, (arbol.y + arbol.h) * T - 98);
        const s = Math.round((4 + Math.sin(t / 250)) * this.k);
        ctx.fillStyle = "#ffd23f";
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      for (let k = 0; k < encendidas; k++) {
        if ((Math.floor(t / 300) + k) % 3 === 0) continue;
        const fx = hash("luz", k);
        const fy = hash("luzy", k);
        const ancho = 10 + fy * 44;
        const p = this.aPantalla((arbol.x + arbol.w / 2) * T - ancho / 2 + fx * ancho, (arbol.y + arbol.h) * T - 92 + fy * 70);
        ctx.fillStyle = cols[k % cols.length];
        ctx.fillRect(p.x, p.y, 2 * this.k, 2 * this.k);
      }
    }

    // Noche / penumbra con luces cálidas
    const oscuridad = Math.min(0.78, (this.sala.exterior ? this.luces * 0.6 : this.luces * 0.12) + this.sala.penumbra);
    if (oscuridad > 0.02) {
      const o = this.octx;
      const f = this.oscuro.width / W;
      o.globalCompositeOperation = "source-over";
      o.clearRect(0, 0, this.oscuro.width, this.oscuro.height);
      o.fillStyle = `rgba(14,18,52,${oscuridad})`;
      o.fillRect(0, 0, this.oscuro.width, this.oscuro.height);
      o.globalCompositeOperation = "destination-out";
      const luces = [...this.arte.luces, { x: this.yo.pos.x * T + 8, y: this.yo.pos.y * T, r: 40, color: "" }];
      for (const l of luces) {
        const p = this.aPantalla(l.x, l.y);
        const r = l.r * this.k * f;
        const cx = p.x * f;
        const cy = p.y * f;
        if (cx < -r || cy < -r || cx > this.oscuro.width + r || cy > this.oscuro.height + r) continue;
        const gr = o.createRadialGradient(cx, cy, 0, cx, cy, r);
        gr.addColorStop(0, "rgba(0,0,0,0.95)");
        gr.addColorStop(1, "rgba(0,0,0,0)");
        o.fillStyle = gr;
        o.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this.oscuro, 0, 0, W, H);
      // brillo cálido
      ctx.globalCompositeOperation = "lighter";
      for (const l of this.arte.luces) {
        const p = this.aPantalla(l.x, l.y);
        const r = l.r * this.k * 0.8;
        if (p.x < -r || p.y < -r || p.x > W + r || p.y > H + r) continue;
        ctx.globalAlpha = Math.min(1, oscuridad * 1.4) * (0.85 + Math.sin(t / 500 + l.x) * 0.15);
        ctx.drawImage(brillo(l.color), p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.imageSmoothingEnabled = false;
    }

    // Nieve (exteriores)
    if (this.sala.exterior && !this.ligero) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (const c of this.copos) {
        c.y += c.v * (dt / 1000);
        c.d += dt / 900;
        if (c.y > 1) c.y -= 1;
        const x = ((c.x + Math.sin(c.d) * 0.01) % 1) * W;
        ctx.fillRect(x, c.y * H, Math.max(2, this.k * 0.7), Math.max(2, this.k * 0.7));
      }
    }

    this.dibujarTextos(t);

    if (this.fundido < 1) {
      ctx.fillStyle = `rgba(27,23,48,${1 - this.fundido})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  private dibujarAlto(d: Dibujable, t: number) {
    this.dibujarImg(d.img, d.x, d.y);
    // marquesina del arcade titilando
    if (d.edificio?.estilo === "arcade" && !d.generado && Math.floor(t / 400) % 2) {
      const p = this.aPantalla(d.x + (d.edificio.w * T) / 2 - 28, d.y + 34 + 9);
      this.ctx.fillStyle = "#ffd23f";
      for (let x = 0; x < 56; x += 8) this.ctx.fillRect(p.x + x * this.k, p.y, 2 * this.k, 3 * this.k);
    }
  }

  private texto(txt: string, x: number, y: number, opts: { tam?: number; fondo?: string; color?: string; borde?: boolean } = {}) {
    const ctx = this.ctx;
    const dpr = this.k / Math.max(1, Math.round(this.k / (this.canvas.width / this.canvas.clientWidth || 1)));
    const tam = Math.round((opts.tam ?? 10) * (this.canvas.width / Math.max(1, this.canvas.clientWidth)));
    void dpr;
    ctx.font = `${tam}px ${this.fuente}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const w = ctx.measureText(txt).width + tam * 0.9;
    const h = tam * 1.5;
    if (opts.fondo) {
      ctx.fillStyle = opts.fondo;
      ctx.fillRect(Math.round(x - w / 2), Math.round(y - h / 2), Math.round(w), Math.round(h));
      if (opts.borde) {
        ctx.strokeStyle = "#2a2342";
        ctx.lineWidth = Math.max(2, tam / 6);
        ctx.strokeRect(Math.round(x - w / 2), Math.round(y - h / 2), Math.round(w), Math.round(h));
      }
    }
    ctx.fillStyle = opts.color ?? "#2a2342";
    ctx.fillText(txt, Math.round(x), Math.round(y + tam * 0.05));
  }

  private dibujarTextos(t: number) {
    // Letreros de edificios
    for (const e of this.sala.edificios) {
      const p = this.aPantalla((e.x + e.w / 2) * T, e.y * T - 30);
      this.texto(e.nombre, p.x, p.y, { tam: 10, fondo: "rgba(255,246,229,0.95)", borde: true });
    }
    // "!" sobre lo interactivo
    for (const o of this.sala.objetos) {
      if (!o.interaccion) continue;
      const p = this.aPantalla((o.x + o.w / 2) * T, o.y * T - 18 + Math.sin(t / 300 + o.x) * 2);
      this.texto(o.interaccion.href ? "▶" : "!", p.x, p.y, { tam: 9, fondo: o.interaccion.href ? "#f6b93b" : "rgba(255,246,229,0.9)", borde: true });
    }
    // Nombres y globitos
    const todos = [...this.otros.values(), this.yo];
    for (const e of todos) {
      const cab = this.aPantalla(e.pos.x * T + T / 2, (e.pos.y + 1) * T - 24);
      this.texto(e.esYo ? "Tú" : e.nombre, cab.x, cab.y, { tam: 8, fondo: e.esYo ? "#f6b93b" : "rgba(27,31,74,0.8)", color: e.esYo ? "#2a2342" : "#fff6e5" });
      if (e.burbuja && t < e.burbuja.hasta) {
        const y = cab.y - (e.burbuja.tipo === "emote" ? 22 : 20) * (this.canvas.width / this.canvas.clientWidth);
        if (e.burbuja.tipo === "emote") this.texto(e.burbuja.texto, cab.x, y, { tam: 18 });
        else this.texto(e.burbuja.texto, cab.x, y, { tam: 9, fondo: "#ffffff", borde: true });
      } else if (e.burbuja) e.burbuja = undefined;
    }
    for (const n of this.npcs) {
      const cab = this.aPantalla(n.pos.x * T + T / 2, (n.pos.y + 1) * T - 28);
      this.texto("💬", cab.x, cab.y + Math.sin(t / 350) * 2, { tam: 9 });
    }
  }
}
