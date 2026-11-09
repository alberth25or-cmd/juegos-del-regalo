/**
 * Música chiptune en el navegador (Web Audio): cero archivos, liviana para celulares.
 *
 * - Los celulares no dejan sonar nada hasta que la persona toca la pantalla: `iniciar()`
 *   se llama en el primer toque (lo instala <MusicaGlobal/>).
 * - Programador con "mirada adelante": cada 50 ms agenda las notas de los próximos 300 ms
 *   con el reloj del audio (no se desfasa aunque el juego esté ocupado dibujando).
 * - En segundo plano se suspende (no gasta batería ni suena con la pantalla apagada).
 * - El 🔇 se recuerda en cada celular (localStorage).
 */
import { duracion, leerVoz, PISTAS, type NombrePista, type Nota } from "@/features/musica/villancicos";

const CLAVE = "jdr:sonido";
const VOLUMEN = 0.07; // bajo a propósito: música de fondo, no protagonista
const MIRADA = 0.3;

interface Voz {
  notas: Nota[];
  i: number;
  t: number;
}

interface Sonando {
  nombre: NombrePista;
  salida: GainNode;
  voces: Voz[];
  pulso: number;
  ritmoT: number;
  ritmo: boolean;
  onda: OscillatorType;
}

let ctx: AudioContext | null = null;
let maestro: GainNode | null = null;
let ruido: AudioBuffer | null = null;
let deseada: NombrePista | null = null;
let actual: Sonando | null = null;
let reloj: ReturnType<typeof setInterval> | null = null;
let silencio = leerSilencio();
const oyentes = new Set<() => void>();
const cache = new Map<NombrePista, { melodia: Nota[]; bajo: Nota[] }>();

function leerSilencio() {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(CLAVE) === "0";
  } catch {
    return false;
  }
}

function avisar() {
  for (const f of oyentes) f();
}

function notasDe(n: NombrePista) {
  let c = cache.get(n);
  if (!c) {
    c = { melodia: leerVoz(PISTAS[n].melodia), bajo: leerVoz(PISTAS[n].bajo) };
    if (duracion(c.melodia) !== duracion(c.bajo)) console.warn(`[musica] ${n}: melodía y bajo no duran lo mismo`);
    cache.set(n, c);
  }
  return c;
}

function tocarNota(destino: AudioNode, f: number, t: number, dur: number, onda: OscillatorType, vol: number) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = onda;
  o.frequency.setValueAtTime(f, t);
  const fin = t + Math.max(0.05, dur * 0.88);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(vol * 0.55, t + Math.min(0.12, dur * 0.5));
  g.gain.exponentialRampToValueAtTime(0.0001, fin);
  o.connect(g).connect(destino);
  o.start(t);
  o.stop(fin + 0.02);
}

function golpe(destino: AudioNode, t: number, fuerte: boolean) {
  if (!ctx || !ruido) return;
  const s = ctx.createBufferSource();
  s.buffer = ruido;
  const filtro = ctx.createBiquadFilter();
  filtro.type = "highpass";
  filtro.frequency.value = fuerte ? 5000 : 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(fuerte ? 0.18 : 0.08, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  s.connect(filtro).connect(g).connect(destino);
  s.start(t);
  s.stop(t + 0.06);
}

function programar() {
  if (!ctx || !actual || ctx.state !== "running") return;
  const hasta = ctx.currentTime + MIRADA;
  const a = actual;
  a.voces.forEach((v, k) => {
    while (v.t < hasta) {
      const n = v.notas[v.i];
      const dur = n.pulsos * a.pulso;
      if (n.f !== null) tocarNota(a.salida, n.f, v.t, dur, k === 0 ? a.onda : "triangle", k === 0 ? 0.55 : 0.7);
      v.t += dur;
      v.i = (v.i + 1) % v.notas.length;
    }
  });
  if (a.ritmo) {
    while (a.ritmoT < hasta) {
      golpe(a.salida, a.ritmoT, false);
      a.ritmoT += a.pulso;
    }
  }
}

function arrancar(n: NombrePista) {
  if (!ctx || !maestro) return;
  const p = PISTAS[n];
  const { melodia, bajo } = notasDe(n);
  const salida = ctx.createGain();
  salida.gain.setValueAtTime(0.0001, ctx.currentTime);
  salida.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.6);
  salida.connect(maestro);
  const t0 = ctx.currentTime + 0.08;
  actual = {
    nombre: n,
    salida,
    voces: [
      { notas: melodia, i: 0, t: t0 },
      { notas: bajo, i: 0, t: t0 },
    ],
    pulso: 60 / p.bpm,
    ritmoT: t0,
    ritmo: !!p.ritmo,
    onda: p.onda,
  };
  programar();
}

function detenerActual() {
  if (!ctx || !actual) return;
  const s = actual.salida;
  const ahora = ctx.currentTime;
  s.gain.cancelScheduledValues(ahora);
  s.gain.setValueAtTime(s.gain.value || 0.0001, ahora);
  s.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.35);
  setTimeout(() => s.disconnect(), 600);
  actual = null;
}

function sincronizar() {
  if (!ctx) return;
  const quiere = silencio ? null : deseada;
  if (actual?.nombre === quiere) return;
  detenerActual();
  if (quiere) arrancar(quiere);
}

function alVisibilidad() {
  if (!ctx) return;
  if (document.hidden) void ctx.suspend();
  else void ctx.resume().then(() => {
    // al volver, reanclar las voces al reloj actual (no "recuperar" notas atrasadas)
    if (actual && ctx) {
      const t = ctx.currentTime + 0.05;
      for (const v of actual.voces) v.t = Math.max(v.t, t);
      actual.ritmoT = Math.max(actual.ritmoT, t);
    }
  });
}

export const musica = {
  /** Llamar dentro de un toque/tecla del usuario (requisito de los navegadores). */
  iniciar() {
    if (typeof window === "undefined") return;
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      maestro = ctx.createGain();
      maestro.gain.value = VOLUMEN;
      maestro.connect(ctx.destination);
      ruido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
      const d = ruido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      reloj = setInterval(programar, 50);
      document.addEventListener("visibilitychange", alVisibilidad);
    }
    if (ctx.state === "suspended" && !document.hidden) void ctx.resume();
    sincronizar();
  },
  /** Qué pista corresponde a la pantalla actual (null = ninguna). */
  pista(n: NombrePista | null) {
    deseada = n;
    sincronizar();
  },
  silenciado() {
    return silencio;
  },
  alternar() {
    silencio = !silencio;
    try {
      localStorage.setItem(CLAVE, silencio ? "0" : "1");
    } catch {}
    musica.iniciar();
    sincronizar();
    avisar();
  },
  suscribir(f: () => void) {
    oyentes.add(f);
    return () => {
      oyentes.delete(f);
    };
  },
  /** Solo pruebas: estado interno. */
  depurar() {
    return { contexto: ctx?.state ?? "sin-iniciar", pista: actual?.nombre ?? null, deseada, silencio };
  },
};

// Evita que el reloj quede vivo si el módulo se recarga en desarrollo.
if (typeof window !== "undefined") window.addEventListener("pagehide", () => reloj && ctx?.state === "closed" && clearInterval(reloj));
