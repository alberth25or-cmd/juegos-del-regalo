"use client";

/**
 * Motor del modo prueba. Todo vive en el navegador (localStorage) y nunca toca
 * la base de datos real. Los bots juegan solos al avanzar de día.
 */
import { useSyncExternalStore } from "react";
import { BOTS, CALENDARIO, ULTIMO_DIA, YO } from "./contenido";

export type Pid = string;

export interface Movimiento {
  pid: Pid;
  pts: number;
  reason: string;
  day: number;
  key?: string;
}

export interface SimState {
  v: 1;
  seed: number;
  day: number;
  me: { codename: string; avatar: string };
  ledger: Movimiento[];
  /** resultado guardado de cada juego jugado, por clave `juego:día` */
  done: Record<string, unknown>;
  /** bots que cumplen la misión de cada día (se decide al empezar el día) */
  botsDone: Record<number, Pid[]>;
  mySanta: Pid;
  myReceiver: Pid;
  doubleAgent: Pid;
  traitor: Pid;
  powerups: { escudo: number; robar: number; doble: number };
  dobleDay: number | null;
  bets: { day: number; pick: Pid; amount: number; result?: "won" | "lost" }[];
  feed: { day: number; text: string }[];
  streakAwardedAt: number[];
}

const KEY = "jdr:prueba:v1";

function rngFrom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
/** Aleatorio determinístico por clave: los bots responden siempre igual en la misma partida. */
export function rnd(s: SimState, key: string) {
  return rngFrom(s.seed ^ hash(key))();
}
export function pick<T>(s: SimState, key: string, arr: T[]): T {
  return arr[Math.floor(rnd(s, key) * arr.length) % arr.length];
}

function decidirBots(s: SimState, day: number) {
  if (day < 1 || day >= ULTIMO_DIA) return [];
  return BOTS.filter((b) => rnd(s, `bot:${b.id}:${day}`) < b.actividad).map((b) => b.id);
}

export function nuevaPartida(me?: SimState["me"]): SimState {
  const seed = Math.floor(Math.random() * 2 ** 31);
  const r = rngFrom(seed);
  const ids = BOTS.map((b) => b.id);
  const shuffled = [...ids].sort(() => r() - 0.5);
  const s: SimState = {
    v: 1,
    seed,
    day: 0,
    me: me ?? { codename: "Agente Mantequilla", avatar: "🐧" },
    ledger: [],
    done: {},
    botsDone: {},
    mySanta: shuffled[0],
    myReceiver: shuffled[1],
    doubleAgent: shuffled[2],
    traitor: shuffled[3],
    powerups: { escudo: 1, robar: 0, doble: 0 },
    dobleDay: null,
    bets: [],
    feed: [{ day: 0, text: "Empieza la pretemporada. ¡Bienvenido al modo prueba, agente!" }],
    streakAwardedAt: [],
  };
  return s;
}

// ------------------------------------------------------------- store
let state: SimState | null = null;
const listeners = new Set<() => void>();

function load(): SimState {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SimState;
      if (parsed.v === 1) {
        state = parsed;
        return state;
      }
    }
  } catch {}
  state = nuevaPartida();
  save();
  return state;
}
function save() {
  try {
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}
function emit() {
  listeners.forEach((l) => l());
}
function update(fn: (s: SimState) => void) {
  const next = structuredClone(load());
  fn(next);
  state = next;
  save();
  emit();
}

export function useSim(): SimState | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => load(),
    () => null,
  );
}

// ---------------------------------------------------------- consultas
export function totales(s: SimState): Record<Pid, number> {
  const t: Record<Pid, number> = { [YO]: 0 };
  for (const b of BOTS) t[b.id] = 0;
  for (const m of s.ledger) t[m.pid] = (t[m.pid] ?? 0) + m.pts;
  return t;
}

export interface Participante {
  pid: Pid;
  codename: string;
  avatar: string;
  points: number;
}

export function ranking(s: SimState): Participante[] {
  const t = totales(s);
  const list: Participante[] = [
    { pid: YO, codename: s.me.codename, avatar: s.me.avatar, points: t[YO] },
    ...BOTS.map((b) => ({ pid: b.id, codename: b.codename, avatar: b.avatar, points: t[b.id] })),
  ];
  return list.sort((a, b) => b.points - a.points || a.codename.localeCompare(b.codename));
}

export function nombre(s: SimState, pid: Pid) {
  if (pid === YO) return s.me.codename;
  return BOTS.find((b) => b.id === pid)?.codename ?? "?";
}
export function bot(pid: Pid) {
  return BOTS.find((b) => b.id === pid)!;
}

export function hecho<T = unknown>(s: SimState, juego: string, day = s.day): T | undefined {
  return s.done[`${juego}:${day}`] as T | undefined;
}

/** ¿Cumplí la misión del día `day`? */
export function cumpliMision(s: SimState, day: number) {
  const tipo = CALENDARIO[day];
  return Boolean(s.done[`${tipo}:${day}`]);
}

/** Bolas de nieve del muñeco: agentes que cumplieron la misión del día. */
export function bolasDeNieve(s: SimState, day = s.day) {
  return (s.botsDone[day]?.length ?? 0) + (cumpliMision(s, day) ? 1 : 0);
}
export const META_MUNECO = 7; // de 9 agentes (≈ 12 de 15 en el grupo real)

// ------------------------------------------------------------ acciones
function otorgar(s: SimState, pid: Pid, pts: number, reason: string, day: number, key?: string) {
  if (pts === 0) return;
  const total = totales(s)[pid] ?? 0;
  const real = pts < 0 ? Math.max(pts, -total) : pts; // nadie baja de 0
  if (real === 0) return;
  s.ledger.push({ pid, pts: real, reason, day, key });
}

/** Marca un juego como jugado por mí y da los puntos (con comodín doble si aplica). */
export function completar(juego: string, resultado: unknown, pts = 0, reason?: string) {
  update((s) => {
    const key = `${juego}:${s.day}`;
    if (s.done[key]) return;
    s.done[key] = resultado ?? true;
    let p = pts;
    const esMision = CALENDARIO[s.day] === juego;
    if (esMision && s.dobleDay === s.day && p > 0) p *= 2;
    otorgar(s, YO, p, reason ?? juego, s.day, key);
  });
}

/** Puntos extra para mí ligados a un juego (p. ej. aciertos). */
export function sumar(pts: number, reason: string, juego?: string) {
  update((s) => otorgar(s, YO, pts, reason, s.day, juego ? `${juego}:${s.day}` : undefined));
}

/** Volver a jugar (solo modo prueba): borra el resultado y sus puntos. */
export function rejugar(juego: string) {
  update((s) => {
    const key = `${juego}:${s.day}`;
    delete s.done[key];
    s.ledger = s.ledger.filter((m) => m.key !== key);
  });
}

export function guardar(juego: string, valor: unknown) {
  update((s) => {
    s.done[`${juego}:${s.day}`] = valor;
  });
}

export function setMe(me: SimState["me"]) {
  update((s) => {
    s.me = me;
  });
}

export function reiniciar() {
  const me = load().me;
  state = nuevaPartida(me);
  save();
  emit();
}

export function usarComodin(tipo: "doble" | "robar", objetivo?: Pid): string {
  let msg = "";
  update((s) => {
    if (s.powerups[tipo] <= 0) {
      msg = "No te quedan comodines de ese tipo.";
      return;
    }
    s.powerups[tipo]--;
    if (tipo === "doble") {
      s.dobleDay = s.day;
      msg = "¡Doble puntaje activado para la misión de hoy!";
    } else if (objetivo) {
      if (rnd(s, `escudo:${objetivo}:${s.day}`) < 0.3) {
        msg = `${nombre(s, objetivo)} tenía un escudo 🛡️. ¡El robo rebotó!`;
      } else {
        otorgar(s, objetivo, -10, "Le robaron con comodín", s.day);
        otorgar(s, YO, 10, `Robo exitoso a ${nombre(s, objetivo)}`, s.day);
        msg = `Le robaste 10 puntos a ${nombre(s, objetivo)} 👀. No sabe que fuiste tú.`;
      }
      s.feed.push({ day: s.day, text: "Alguien robó puntos 👀" });
    }
  });
  return msg;
}

export function apostar(pickPid: Pid, amount: number) {
  update((s) => {
    if (s.bets.some((b) => b.day === s.day)) return;
    s.bets.push({ day: s.day, pick: pickPid, amount: Math.max(1, Math.min(20, Math.round(amount))) });
  });
}

/** Termina el día actual: los bots juegan, se resuelven votos y apuestas, y empieza el siguiente. */
export function avanzarDia() {
  update((s) => {
    if (s.day >= ULTIMO_DIA) return;
    const d = s.day;
    const tipo = CALENDARIO[d];

    if (d === 0) {
      // pretemporada: los bots dejan su wishlist y cápsula
      for (const b of BOTS) otorgar(s, b.id, 30, "Cápsula del tiempo", d);
    } else {
      // 1) misión del día de los bots
      for (const pid of s.botsDone[d] ?? []) otorgar(s, pid, 10, `Misión del día ${d}`, d);
      // aciertos de los bots en juegos de adivinar
      if (["verdad", "emoji", "trivia", "adivina"].includes(tipo)) {
        for (const pid of s.botsDone[d] ?? []) {
          const aciertos = Math.floor(rnd(s, `aciertos:${pid}:${d}`) * 4);
          otorgar(s, pid, aciertos * 5, `Aciertos (${tipo})`, d);
        }
      }
      // 2) votación de la foto de AYER se cierra hoy
      if (CALENDARIO[d - 1] === "foto") {
        const autores = [...(s.botsDone[d - 1] ?? []), ...(cumpliMision(s, d - 1) ? [YO] : [])];
        if (autores.length >= 2) {
          const orden = [...autores].sort((a, b) => rnd(s, `votos:${a}:${d}`) - rnd(s, `votos:${b}:${d}`));
          otorgar(s, orden[0], 20, "Foto más votada 🥇", d);
          otorgar(s, orden[1], 10, "Segunda foto más votada 🥈", d);
          s.feed.push({ day: d, text: `${nombre(s, orden[0])} ganó la votación de fotos 📸` });
        }
      }
      // 3) muñeco gigante (colaborativo)
      if (bolasDeNieve(s, d) >= META_MUNECO) {
        otorgar(s, YO, 5, "Muñeco gigante completado ☃️", d);
        for (const b of BOTS) otorgar(s, b.id, 5, "Muñeco gigante completado ☃️", d);
        s.feed.push({ day: d, text: "¡El grupo completó el muñeco gigante! +5 para todos ☃️" });
      }
      // 4) racha de 3 días
      if (cumpliMision(s, d) && cumpliMision(s, d - 1) && cumpliMision(s, d - 2) && !s.streakAwardedAt.includes(d)) {
        s.streakAwardedAt.push(d);
        otorgar(s, YO, 15, "Racha de 3 días 🔥", d);
        const premio = pick(s, `premio:${d}`, ["doble", "robar", "escudo"] as const);
        s.powerups[premio]++;
        s.feed.push({ day: d, text: `Ganaste un comodín por tu racha: ${premio}` });
      }
      // 5) semanales de los bots
      if (d === 7 || d === 13) {
        for (const b of BOTS) if (rnd(s, `semanal:${b.id}:${d}`) < 0.75) otorgar(s, b.id, 30, "Misión semanal", d);
      }
      // 6) robo de un bot
      if (rnd(s, `robo:${d}`) < 0.18) {
        const ladron = pick(s, `ladron:${d}`, BOTS).id;
        if (s.powerups.escudo > 0) {
          s.powerups.escudo--;
          s.feed.push({ day: d, text: "Alguien intentó robarte… ¡tu escudo 🛡️ lo detuvo!" });
        } else {
          otorgar(s, YO, -10, "Te robaron 10 puntos 👀", d);
          otorgar(s, ladron, 10, "Robo exitoso", d);
          s.feed.push({ day: d, text: "¡Te robaron 10 puntos! 👀" });
        }
      }
      // 7) apuesta del día
      const apuesta = s.bets.find((b) => b.day === d && !b.result);
      if (apuesta) {
        const delDia: Record<Pid, number> = {};
        for (const m of s.ledger) if (m.day === d && m.pts > 0) delDia[m.pid] = (delDia[m.pid] ?? 0) + m.pts;
        const top = Object.entries(delDia).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (top === apuesta.pick) {
          apuesta.result = "won";
          otorgar(s, YO, apuesta.amount, "Apuesta ganada 🎲", d);
        } else {
          apuesta.result = "lost";
          otorgar(s, YO, -apuesta.amount, "Apuesta perdida 🎲", d);
        }
      }
    }

    s.day = d + 1;
    s.botsDone[s.day] = decidirBots(s, s.day);
    if (s.day === ULTIMO_DIA) s.feed.push({ day: s.day, text: "¡Llegó la gran final! 🏆" });
  });
}

export function irAlDia(n: number) {
  const target = Math.max(0, Math.min(ULTIMO_DIA, n));
  while (load().day < target) avanzarDia();
}
