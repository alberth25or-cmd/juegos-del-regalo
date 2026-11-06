/**
 * Mapas de Snowville (vista desde arriba). Puro: sin dibujo ni React. Lo usan el
 * navegador (para pintar y caminar) y los tests. Unidades = baldosas.
 *
 * - "snowville" es el mundo principal donde están todos.
 * - Cada edificio tiene una puerta que lleva a su submundo; cada submundo tiene
 *   una salida que te devuelve frente a esa puerta.
 */
import type { NpcId } from "../contenido/npcs.ts";
import { crearAzar } from "../azar.ts";

export type SalaId = "snowville" | "arcade" | "fabrica" | "tablon" | "mercado" | "arena" | "trofeos" | "bosque";

export type Suelo = "nieve" | "camino" | "plaza" | "hielo" | "madera" | "alfombra" | "alfombraRoja" | "oscuro" | "muro" | "nieveOscura";

export interface Interaccion {
  titulo: string;
  texto: string;
  /** enlace si la actividad ya existe */
  href?: string;
  /** fase del plan en que se construye (se muestra "Próximamente") */
  abre?: string;
  npc?: NpcId;
}

export type TipoObjeto =
  | "pino"
  | "farol"
  | "banca"
  | "muneco"
  | "arbolPlaza"
  | "valla"
  | "roca"
  | "regalos"
  | "maquina"
  | "cinta"
  | "tablero"
  | "mostrador"
  | "estante"
  | "trofeos"
  | "buzon"
  | "cofre"
  | "cueva"
  | "runa"
  | "ring"
  | "podio"
  | "marcador"
  | "chimenea"
  | "mesa"
  | "neon"
  | "fotos"
  | "microfono"
  | "cabina"
  | "medidor";

export interface Objeto {
  tipo: TipoObjeto;
  x: number;
  y: number;
  /** baldosas que bloquea (desde x,y hacia la derecha/abajo) */
  w: number;
  h: number;
  bloquea: boolean;
  variante?: number;
  interaccion?: Interaccion;
}

export type EstiloEdificio = "casa" | "fabrica" | "arcade" | "tablon" | "tienda" | "arena" | "trofeos";

export interface Edificio {
  id: SalaId;
  nombre: string;
  estilo: EstiloEdificio;
  x: number;
  y: number;
  w: number;
  h: number;
  /** baldosa de la puerta (fila de abajo del edificio) */
  puerta: { x: number; y: number };
  color: string;
}

export interface Salida {
  x: number;
  y: number;
  destino: SalaId;
  /** dónde apareces en el destino */
  llegada: { x: number; y: number };
}

export interface NpcEnMapa {
  id: NpcId;
  x: number;
  y: number;
  radio: number;
}

export interface Sala {
  id: SalaId;
  nombre: string;
  ancho: number;
  alto: number;
  exterior: boolean;
  /** oscuridad base (bosque, mercado negro) 0..1 */
  penumbra: number;
  suelo: Suelo[];
  bloqueo: Uint8Array;
  objetos: Objeto[];
  edificios: Edificio[];
  salidas: Salida[];
  npcs: NpcEnMapa[];
  inicio: { x: number; y: number };
}

// ------------------------------------------------------------- constructor
class Lienzo {
  suelo: Suelo[];
  bloqueo: Uint8Array;
  objetos: Objeto[] = [];
  edificios: Edificio[] = [];
  salidas: Salida[] = [];
  npcs: NpcEnMapa[] = [];
  readonly ancho: number;
  readonly alto: number;
  constructor(ancho: number, alto: number, base: Suelo) {
    this.ancho = ancho;
    this.alto = alto;
    this.suelo = Array(ancho * alto).fill(base);
    this.bloqueo = new Uint8Array(ancho * alto);
  }
  dentro(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.ancho && y < this.alto;
  }
  pintar(x0: number, y0: number, w: number, h: number, s: Suelo) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (this.dentro(x, y)) this.suelo[y * this.ancho + x] = s;
  }
  bloquear(x0: number, y0: number, w: number, h: number, v = 1) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (this.dentro(x, y)) this.bloqueo[y * this.ancho + x] = v;
  }
  libre(x: number, y: number) {
    return this.dentro(x, y) && !this.bloqueo[y * this.ancho + x];
  }
  sueloEn(x: number, y: number) {
    return this.suelo[y * this.ancho + x];
  }
  objeto(o: Omit<Objeto, "w" | "h" | "bloquea"> & Partial<Pick<Objeto, "w" | "h" | "bloquea">>) {
    const obj: Objeto = { w: 1, h: 1, bloquea: true, ...o };
    this.objetos.push(obj);
    if (obj.bloquea) this.bloquear(obj.x, obj.y, obj.w, obj.h);
    return obj;
  }
  edificio(e: Edificio) {
    this.edificios.push(e);
    this.bloquear(e.x, e.y, e.w, e.h);
    this.bloqueo[e.puerta.y * this.ancho + e.puerta.x] = 0;
  }
  /** Paredes del borde (interiores) con una salida abajo al centro. */
  muros(salidaX: number) {
    this.pintar(0, 0, this.ancho, 2, "muro");
    this.bloquear(0, 0, this.ancho, 2);
    this.bloquear(0, 0, 1, this.alto);
    this.bloquear(this.ancho - 1, 0, 1, this.alto);
    this.bloquear(0, this.alto - 1, this.ancho, 1);
    this.bloqueo[(this.alto - 1) * this.ancho + salidaX] = 0;
  }
  sala(id: SalaId, nombre: string, opts: { exterior: boolean; penumbra?: number; inicio: { x: number; y: number } }): Sala {
    return {
      id,
      nombre,
      ancho: this.ancho,
      alto: this.alto,
      exterior: opts.exterior,
      penumbra: opts.penumbra ?? 0,
      suelo: this.suelo,
      bloqueo: this.bloqueo,
      objetos: this.objetos.sort((a, b) => a.y + a.h - (b.y + b.h)),
      edificios: this.edificios,
      salidas: this.salidas,
      npcs: this.npcs,
      inicio: opts.inicio,
    };
  }
}

// --------------------------------------------------------- Snowville
const ANCHO = 46;
const ALTO = 36;

const EDIFICIOS: Edificio[] = [
  { id: "fabrica", nombre: "Fábrica de Regalos", estilo: "fabrica", x: 3, y: 3, w: 8, h: 5, puerta: { x: 6, y: 7 }, color: "#a8453a" },
  { id: "trofeos", nombre: "Salón de Trofeos", estilo: "trofeos", x: 19, y: 2, w: 8, h: 6, puerta: { x: 23, y: 7 }, color: "#d4a017" },
  { id: "arcade", nombre: "Arcade", estilo: "arcade", x: 35, y: 3, w: 8, h: 5, puerta: { x: 39, y: 7 }, color: "#7b4bb7" },
  { id: "tablon", nombre: "Tablón del Caos", estilo: "tablon", x: 3, y: 11, w: 7, h: 4, puerta: { x: 6, y: 14 }, color: "#2e9e78" },
  { id: "arena", nombre: "La Arena", estilo: "arena", x: 35, y: 10, w: 8, h: 5, puerta: { x: 39, y: 14 }, color: "#2f6fb0" },
  { id: "mercado", nombre: "Mercado Negro", estilo: "tienda", x: 4, y: 23, w: 6, h: 5, puerta: { x: 7, y: 27 }, color: "#3b3f5c" },
];

function construirSnowville(): Sala {
  const L = new Lienzo(ANCHO, ALTO, "nieve");

  // Caminos: avenida este-oeste, avenida norte-sur, calle norte y ramales a cada puerta.
  L.pintar(2, 17, ANCHO - 2, 2, "camino");
  L.pintar(22, 8, 2, ALTO - 10, "camino");
  L.pintar(2, 29, 22, 2, "camino");
  L.pintar(6, 8, 34, 1, "camino");
  for (const e of EDIFICIOS) {
    const hasta = e.puerta.y === 7 ? 8 : e.puerta.y === 14 ? 17 : 29;
    L.pintar(e.puerta.x, e.puerta.y + 1, 1, hasta - e.puerta.y, "camino");
  }

  // Plaza central con el árbol gigante.
  L.pintar(16, 12, 14, 12, "plaza");
  L.objeto({ tipo: "arbolPlaza", x: 21, y: 15, w: 4, h: 3, interaccion: { titulo: "El árbol de Snowville", texto: "Se enciende con la energía de todos: cada partida y cada voto suma. Al 100 %, Santa reparte monedas.", href: "/energia" } });
  for (const [x, y] of [
    [16, 12],
    [29, 12],
    [16, 23],
    [29, 23],
  ])
    L.objeto({ tipo: "farol", x, y });
  L.objeto({ tipo: "banca", x: 18, y: 20, w: 2, h: 1 });
  L.objeto({ tipo: "banca", x: 26, y: 20, w: 2, h: 1 });
  L.objeto({ tipo: "regalos", x: 20, y: 18, w: 1, h: 1, bloquea: true });
  L.objeto({ tipo: "regalos", x: 25, y: 18, w: 1, h: 1, bloquea: true, variante: 1 });
  L.objeto({
    tipo: "buzon",
    x: 27,
    y: 8,
    w: 1,
    h: 1,
    interaccion: { titulo: "Buzón del amigo secreto", texto: "Aquí llegarán las pistas de quién te regala y tu wishlist.", abre: "Fase 3" },
  });

  // Lago congelado
  L.pintar(32, 23, 9, 6, "hielo");
  L.objeto({ tipo: "muneco", x: 31, y: 21 });
  L.objeto({ tipo: "muneco", x: 13, y: 20, variante: 1 });

  // Edificios
  for (const e of EDIFICIOS) L.edificio(e);
  L.objeto({ tipo: "chimenea", x: 4, y: 2, w: 1, h: 1, bloquea: false });

  // Faroles a lo largo de las avenidas
  for (let x = 4; x < ANCHO - 3; x += 6) if (x < 15 || x > 30) L.objeto({ tipo: "farol", x, y: 16 });
  for (let y = 24; y < ALTO - 3; y += 5) L.objeto({ tipo: "farol", x: 24, y });

  // Vallas del lago
  L.objeto({ tipo: "valla", x: 32, y: 22, w: 9, h: 1 });

  // Salida al bosque (borde este) y bordes de pinos
  L.salidas.push({ x: ANCHO - 1, y: 17, destino: "bosque", llegada: { x: 2, y: 9 } });
  L.salidas.push({ x: ANCHO - 1, y: 18, destino: "bosque", llegada: { x: 2, y: 10 } });
  const azar = crearAzar(2026);
  const ocupado = (x: number, y: number) => !L.libre(x, y) || L.sueloEn(x, y) !== "nieve";
  for (let x = 0; x < ANCHO; x++) {
    for (const y of [0, ALTO - 1, ALTO - 2]) if (!ocupado(x, y)) L.objeto({ tipo: "pino", x, y, variante: Math.floor(azar() * 3) });
  }
  for (let y = 1; y < ALTO - 2; y++) {
    for (const x of [0, 1, ANCHO - 1]) if (!ocupado(x, y) && !(x === ANCHO - 1 && (y === 17 || y === 18))) L.objeto({ tipo: "pino", x, y, variante: Math.floor(azar() * 3) });
  }
  // Bosquecillos sueltos (sin tapar caminos ni puertas)
  for (let k = 0; k < 70; k++) {
    const x = 2 + Math.floor(azar() * (ANCHO - 4));
    const y = 2 + Math.floor(azar() * (ALTO - 5));
    const cerca = (dx: number, dy: number) => L.dentro(x + dx, y + dy) && (L.sueloEn(x + dx, y + dy) !== "nieve" || !L.libre(x + dx, y + dy));
    if (cerca(0, 0) || cerca(0, 1) || cerca(1, 0) || cerca(-1, 0) || cerca(0, -1)) continue;
    L.objeto({ tipo: azar() < 0.85 ? "pino" : "roca", x, y, variante: Math.floor(azar() * 3) });
  }

  L.npcs.push({ id: "santa", x: 19, y: 22, radio: 2 }, { id: "duende", x: 9, y: 9, radio: 2 }, { id: "auditor", x: 26, y: 10, radio: 1 }, { id: "muneco", x: 42, y: 20, radio: 1 });
  return L.sala("snowville", "Snowville", { exterior: true, inicio: { x: 23, y: 25 } });
}

// ---------------------------------------------------------- interiores
function interior(id: SalaId, nombre: string, ancho: number, alto: number, piso: Suelo, deco: (L: Lienzo, sx: number) => void, opts: { penumbra?: number } = {}): Sala {
  const L = new Lienzo(ancho, alto, piso);
  const sx = Math.floor(ancho / 2);
  L.muros(sx);
  const e = EDIFICIOS.find((b) => b.id === id)!;
  L.salidas.push({ x: sx, y: alto - 1, destino: "snowville", llegada: { x: e.puerta.x, y: e.puerta.y + 1 } });
  deco(L, sx);
  return L.sala(id, nombre, { exterior: false, penumbra: opts.penumbra, inicio: { x: sx, y: alto - 2 } });
}

const ARCADE = () =>
  interior("arcade", "Arcade", 15, 11, "alfombra", (L) => {
    L.objeto({ tipo: "neon", x: 5, y: 0, w: 5, h: 1, bloquea: false });
    L.objeto({
      tipo: "maquina",
      x: 2,
      y: 2,
      w: 2,
      h: 1,
      variante: 0,
      interaccion: { titulo: "Gift Catcher", texto: "Santa en bancarrota: atrapa regalos, esquiva facturas. Tu mejor partida del día suma al ranking.", href: "/arcade/gift-catcher" },
    });
    L.objeto({ tipo: "maquina", x: 6, y: 2, w: 2, h: 1, variante: 1, interaccion: { titulo: "Memory Gifts", texto: "Memoria del desastre: encuentra los 8 pares con pocos movimientos. Tu mejor partida del día suma al ranking.", href: "/arcade/memory" } });
    L.objeto({ tipo: "maquina", x: 10, y: 2, w: 2, h: 1, variante: 2, interaccion: { titulo: "Aguanta el botón", texto: "Reflejos de duende en huelga.", abre: "Fase 2" } });
    L.objeto({ tipo: "mesa", x: 2, y: 6, w: 2, h: 1 });
    L.objeto({ tipo: "mesa", x: 11, y: 6, w: 2, h: 1 });
    L.npcs.push({ id: "rudolf", x: 10, y: 5, radio: 2 });
  });

const FABRICA = () =>
  interior("fabrica", "Fábrica de Regalos", 17, 12, "madera", (L) => {
    L.objeto({
      tipo: "cinta",
      x: 2,
      y: 4,
      w: 13,
      h: 1,
      interaccion: { titulo: "La fábrica de los inútiles", texto: "Cadena cooperativa: seleccionar, envolver, etiquetar y transportar. Cada uno tiene su estación.", abre: "Fase 2" },
    });
    L.objeto({ tipo: "regalos", x: 2, y: 7, w: 1, h: 1 });
    L.objeto({ tipo: "regalos", x: 3, y: 7, w: 1, h: 1, variante: 1 });
    L.objeto({ tipo: "regalos", x: 13, y: 7, w: 1, h: 1, variante: 2 });
    L.objeto({
      tipo: "medidor",
      x: 14,
      y: 2,
      w: 2,
      h: 1,
      interaccion: { titulo: "Energía navideña", texto: "Los 20 contra el desastre: toda la XP que ganan entre todos enciende el árbol de la plaza.", href: "/energia" },
    });
    L.objeto({ tipo: "estante", x: 1, y: 2, w: 3, h: 1 });
    L.npcs.push({ id: "duende", x: 8, y: 8, radio: 3 });
  });

const TABLON = () =>
  interior("tablon", "Tablón del Caos", 15, 11, "madera", (L) => {
    L.objeto({
      tipo: "tablero",
      x: 4,
      y: 1,
      w: 7,
      h: 2,
      interaccion: { titulo: "¿Quién es más probable…?", texto: "Una pregunta, un voto secreto por persona. Cuando votan todos, el Auditor revela quién ganó.", href: "/votacion" },
    });
    L.objeto({ tipo: "cabina", x: 12, y: 3, w: 2, h: 2, interaccion: { titulo: "Confesionario", texto: "Responde anónimo (para los jugadores) y adivina quién escribió qué.", abre: "Fase 3" } });
    L.objeto({ tipo: "microfono", x: 2, y: 4, w: 1, h: 1, interaccion: { titulo: "Roast Battle", texto: "Solo voluntarios. Dos personas, una situación absurda y el grupo vota.", abre: "Fase 3" } });
    L.objeto({ tipo: "fotos", x: 1, y: 2, w: 2, h: 1, interaccion: { titulo: "Batalla de memes", texto: "Plantillas propias del juego. Gana el que haga reír al grupo.", abre: "Fase 4" } });
    L.objeto({ tipo: "banca", x: 5, y: 7, w: 2, h: 1 });
    L.objeto({ tipo: "banca", x: 9, y: 7, w: 2, h: 1 });
  });

const MERCADO = () =>
  interior(
    "mercado",
    "Mercado Negro",
    13,
    10,
    "oscuro",
    (L) => {
      L.objeto({
        tipo: "mostrador",
        x: 3,
        y: 3,
        w: 7,
        h: 1,
        interaccion: { titulo: "La tienda del Muñeco", texto: "Gorros, marcos, emotes y objetos absurdos como el Calcetín sospechoso. Nada de lo que compres da puntos.", abre: "Fase 5" },
      });
      L.objeto({ tipo: "estante", x: 1, y: 2, w: 2, h: 1 });
      L.objeto({ tipo: "estante", x: 10, y: 2, w: 2, h: 1 });
      L.objeto({ tipo: "cofre", x: 10, y: 6, w: 2, h: 1, interaccion: { titulo: "Tu inventario", texto: "Aquí guardarás lo que compres con tus monedas.", abre: "Fase 5" } });
      L.npcs.push({ id: "muneco", x: 6, y: 2, radio: 0 });
    },
    { penumbra: 0.45 },
  );

const TROFEOS = () =>
  interior("trofeos", "Salón de Trofeos", 15, 11, "alfombraRoja", (L) => {
    L.objeto({ tipo: "trofeos", x: 2, y: 1, w: 4, h: 2 });
    L.objeto({ tipo: "trofeos", x: 9, y: 1, w: 4, h: 2, variante: 1 });
    L.objeto({ tipo: "marcador", x: 6, y: 1, w: 3, h: 2, interaccion: { titulo: "Ranking en vivo", texto: "Individual y por equipos (promedio por integrante).", href: "/ranking" } });
    L.objeto({ tipo: "podio", x: 6, y: 5, w: 3, h: 1, interaccion: { titulo: "Ranking de la vergüenza", texto: "Premios absurdos y también bonitos, cada semana.", abre: "Fase 3" } });
    L.objeto({ tipo: "buzon", x: 12, y: 6, w: 1, h: 1, interaccion: { titulo: "Cápsula del tiempo", texto: "Escribe algo hoy; se abre en la ceremonia final.", abre: "Fase 5" } });
    L.npcs.push({ id: "auditor", x: 4, y: 6, radio: 2 });
  });

function construirArena(): Sala {
  const L = new Lienzo(18, 13, "nieve");
  L.muros(9);
  L.pintar(0, 0, 18, 2, "muro");
  L.pintar(4, 4, 10, 6, "plaza");
  L.objeto({ tipo: "ring", x: 6, y: 5, w: 6, h: 3, bloquea: false });
  L.objeto({ tipo: "podio", x: 2, y: 3, w: 2, h: 1, interaccion: { titulo: "Juicio del Polo Norte", texto: "Trivia por equipos: 8 preguntas, 15 segundos cada una. Cuenta el promedio de tu equipo.", href: "/arena/trivia" } });
  L.objeto({ tipo: "marcador", x: 13, y: 2, w: 3, h: 1, interaccion: { titulo: "Marcador de equipos", texto: "Ranking por equipos en vivo.", href: "/ranking" } });
  L.objeto({ tipo: "muneco", x: 15, y: 9, interaccion: { titulo: "Guerra de nieve", texto: "Por rondas: defiende tu base y captura la del rival.", abre: "Fase 5" } });
  L.objeto({ tipo: "roca", x: 2, y: 9 });
  L.npcs.push({ id: "rudolf", x: 9, y: 10, radio: 2 });
  const e = EDIFICIOS.find((b) => b.id === "arena")!;
  L.salidas.push({ x: 9, y: 12, destino: "snowville", llegada: { x: e.puerta.x, y: e.puerta.y + 1 } });
  return L.sala("arena", "La Arena", { exterior: true, inicio: { x: 9, y: 11 } });
}

function construirBosque(): Sala {
  const L = new Lienzo(26, 20, "nieveOscura");
  L.pintar(0, 9, 14, 2, "camino");
  L.pintar(13, 4, 2, 7, "camino");
  L.objeto({ tipo: "cueva", x: 12, y: 1, w: 4, h: 3, interaccion: { titulo: "La cueva del ogro", texto: "Escape del Polo Norte: cada uno ve pistas distintas. Hablen o se quedan atrapados.", abre: "Fase 5" } });
  L.objeto({ tipo: "runa", x: 19, y: 12, interaccion: { titulo: "Acertijos del Muñeco", texto: "Piedras con acertijos nuevos cada pocos días.", abre: "Fase 3" } });
  L.objeto({ tipo: "runa", x: 6, y: 14, variante: 1, interaccion: { titulo: "Desactiva la máquina", texto: "Uno ve el dispositivo, los demás el manual. Información asimétrica.", abre: "Fase 5" } });
  const azar = crearAzar(77);
  for (let k = 0; k < 150; k++) {
    const x = Math.floor(azar() * 26);
    const y = Math.floor(azar() * 20);
    if (!L.libre(x, y) || L.sueloEn(x, y) !== "nieveOscura") continue;
    if ((x <= 1 && (y === 9 || y === 10)) || (Math.abs(x - 19) <= 1 && Math.abs(y - 12) <= 1) || (Math.abs(x - 6) <= 1 && Math.abs(y - 14) <= 1)) continue;
    if (L.sueloEn(Math.max(0, x - 1), y) === "camino" || L.sueloEn(Math.min(25, x + 1), y) === "camino") continue;
    L.objeto({ tipo: "pino", x, y, variante: Math.floor(azar() * 3) });
  }
  // Claros alrededor de los acertijos
  L.npcs.push({ id: "muneco", x: 17, y: 10, radio: 2 });
  L.salidas.push({ x: 0, y: 9, destino: "snowville", llegada: { x: ANCHO - 2, y: 17 } }, { x: 0, y: 10, destino: "snowville", llegada: { x: ANCHO - 2, y: 18 } });
  return L.sala("bosque", "Bosque Congelado", { exterior: true, penumbra: 0.35, inicio: { x: 2, y: 9 } });
}

let cache: Record<SalaId, Sala> | null = null;

export function salas(): Record<SalaId, Sala> {
  if (!cache) {
    cache = {
      snowville: construirSnowville(),
      arcade: ARCADE(),
      fabrica: FABRICA(),
      tablon: TABLON(),
      mercado: MERCADO(),
      trofeos: TROFEOS(),
      arena: construirArena(),
      bosque: construirBosque(),
    };
  }
  return cache;
}

export function sala(id: SalaId): Sala {
  return salas()[id];
}

export const SALAS_IDS: SalaId[] = ["snowville", "arcade", "fabrica", "tablon", "mercado", "arena", "trofeos", "bosque"];

export function esSala(v: unknown): v is SalaId {
  return typeof v === "string" && (SALAS_IDS as string[]).includes(v);
}

export function caminable(s: Sala, x: number, y: number) {
  return x >= 0 && y >= 0 && x < s.ancho && y < s.alto && !s.bloqueo[y * s.ancho + x];
}

/** Puerta de edificio o salida en esta baldosa (si hay). */
export function transicionEn(s: Sala, x: number, y: number): { destino: SalaId; llegada: { x: number; y: number } } | null {
  const e = s.edificios.find((b) => b.puerta.x === x && b.puerta.y === y);
  if (e) {
    const dest = sala(e.id);
    return { destino: e.id, llegada: dest.inicio };
  }
  const sal = s.salidas.find((o) => o.x === x && o.y === y);
  return sal ? { destino: sal.destino, llegada: sal.llegada } : null;
}
