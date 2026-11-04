import { TIMEZONE } from "./config";

/**
 * Sistema de atmósfera: a partir del minuto del día (hora de Lima) calcula
 * colores de cielo, tinte de la escena, luz, estrellas y luces de la aldea.
 * Se interpola de forma continua entre fotogramas clave, así la página
 * cambia poco a poco a lo largo del día.
 */

type RGB = [number, number, number];

interface Keyframe {
  m: number; // minuto del día (0–1440)
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  tint: string; // color que multiplica la escena
  tintAlpha: number;
  haze: string; // neblina de las capas lejanas
  light: number; // brillo de la escena
  sat: number; // saturación de la escena
  stars: number;
  lights: number; // ventanas, faroles, guirnaldas
  glow: string; // brillo del horizonte (sol/luna)
}

const KEYFRAMES: Keyframe[] = [
  { m: 0, skyTop: "#0b0f2e", skyMid: "#1a1f4d", skyBottom: "#2f2c63", tint: "#3b3f9a", tintAlpha: 0.42, haze: "#2a2f6b", light: 0.62, sat: 0.8, stars: 1, lights: 1, glow: "#5b5fbf" },
  { m: 300, skyTop: "#151a48", skyMid: "#3b3a7a", skyBottom: "#7a5d9e", tint: "#5b4f9e", tintAlpha: 0.34, haze: "#4b4588", light: 0.7, sat: 0.85, stars: 0.7, lights: 0.9, glow: "#b07ab8" },
  { m: 345, skyTop: "#4a5aa8", skyMid: "#c487b0", skyBottom: "#ffb48a", tint: "#ff9f86", tintAlpha: 0.22, haze: "#e8a3b0", light: 0.86, sat: 1.05, stars: 0.15, lights: 0.45, glow: "#ffc27a" },
  { m: 420, skyTop: "#73b9ec", skyMid: "#b5dcf5", skyBottom: "#ffe6c4", tint: "#ffe1c2", tintAlpha: 0.1, haze: "#cfe4f2", light: 1, sat: 1.05, stars: 0, lights: 0.05, glow: "#fff0c4" },
  { m: 720, skyTop: "#4fb0ee", skyMid: "#98d4f6", skyBottom: "#dff3ff", tint: "#ffffff", tintAlpha: 0, haze: "#cde8f7", light: 1.06, sat: 1.08, stars: 0, lights: 0, glow: "#ffffff" },
  { m: 930, skyTop: "#6aaee6", skyMid: "#a9d2f0", skyBottom: "#ffe4b8", tint: "#ffe2b8", tintAlpha: 0.1, haze: "#d8e2ee", light: 1.02, sat: 1.06, stars: 0, lights: 0, glow: "#ffe9b0" },
  { m: 1050, skyTop: "#5d68c0", skyMid: "#e98aa0", skyBottom: "#ffa464", tint: "#ff9466", tintAlpha: 0.26, haze: "#f0a08f", light: 0.9, sat: 1.15, stars: 0, lights: 0.4, glow: "#ffb65c" },
  { m: 1110, skyTop: "#33357e", skyMid: "#9a5a9e", skyBottom: "#f07a7a", tint: "#a06ab6", tintAlpha: 0.32, haze: "#8a5a9a", light: 0.76, sat: 1.05, stars: 0.35, lights: 0.85, glow: "#ff8a7a" },
  { m: 1170, skyTop: "#151a48", skyMid: "#2c2b66", skyBottom: "#4a3d7c", tint: "#4b4aa8", tintAlpha: 0.38, haze: "#33356f", light: 0.65, sat: 0.85, stars: 0.9, lights: 1, glow: "#6a62c4" },
  { m: 1440, skyTop: "#0b0f2e", skyMid: "#1a1f4d", skyBottom: "#2f2c63", tint: "#3b3f9a", tintAlpha: 0.42, haze: "#2a2f6b", light: 0.62, sat: 0.8, stars: 1, lights: 1, glow: "#5b5fbf" },
];

export type PhaseId =
  | "madrugada"
  | "amanecer"
  | "manana"
  | "mediodia"
  | "tarde"
  | "atardecer"
  | "crepusculo"
  | "noche";

const PHASES: { from: number; id: PhaseId; label: string; emoji: string }[] = [
  { from: 0, id: "madrugada", label: "Madrugada en la aldea", emoji: "🌌" },
  { from: 330, id: "amanecer", label: "Amanece en la aldea", emoji: "🌅" },
  { from: 420, id: "manana", label: "Mañana nevada", emoji: "☀️" },
  { from: 690, id: "mediodia", label: "Mediodía en la plaza", emoji: "🌤️" },
  { from: 900, id: "tarde", label: "Tarde tranquila", emoji: "⛅" },
  { from: 1035, id: "atardecer", label: "Atardecer dorado", emoji: "🌇" },
  { from: 1110, id: "crepusculo", label: "Se prenden las luces", emoji: "✨" },
  { from: 1170, id: "noche", label: "Noche de misterio", emoji: "🌙" },
];

export interface Atmosphere {
  minute: number;
  phase: PhaseId;
  label: string;
  emoji: string;
  isNight: boolean;
  vars: Record<string, string>;
}

const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = ([r, g, b]: RGB) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const mixColor = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return toHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Minuto del día en la zona horaria del juego. */
export function limaMinuteNow(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get("hour") * 60 + get("minute") + get("second") / 60;
}

export function parseHHMM(v: string | null | undefined): number | null {
  if (!v) return null;
  const m = /^(\d{1,2}):?(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function formatMinute(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const mm = Math.floor(m % 60);
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

const SUNRISE = 345; // 05:45
const SUNSET = 1095; // 18:15

export function computeAtmosphere(minuteIn: number): Atmosphere {
  const minute = ((minuteIn % 1440) + 1440) % 1440;
  let i = 0;
  while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1].m <= minute) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const t = smooth((minute - a.m) / (b.m - a.m || 1));

  // Arco del sol (día) y de la luna (noche). x,y en % del cielo.
  const dayT = (minute - SUNRISE) / (SUNSET - SUNRISE);
  const sunUp = dayT >= -0.04 && dayT <= 1.04;
  const sunX = mix(8, 92, dayT);
  const sunY = 78 - Math.sin(Math.PI * Math.min(Math.max(dayT, 0), 1)) * 62;
  const nightLen = 1440 - (SUNSET - SUNRISE);
  const nightT = (((minute - SUNSET + 1440) % 1440) / nightLen);
  const moonUp = !sunUp || dayT < 0.02 || dayT > 0.98;
  const moonX = mix(10, 90, nightT);
  const moonY = 70 - Math.sin(Math.PI * Math.min(Math.max(nightT, 0), 1)) * 55;
  const edge = (x: number) => Math.min(1, Math.max(0, x));
  const sunO = sunUp ? edge(Math.min(dayT + 0.04, 1.04 - dayT) * 12) : 0;
  const moonO = moonUp && nightT >= 0 && nightT <= 1 ? edge(Math.min(nightT, 1 - nightT) * 10) : 0;

  const phase = [...PHASES].reverse().find((p) => minute >= p.from) ?? PHASES[0];
  const lights = mix(a.lights, b.lights, t);
  const stars = mix(a.stars, b.stars, t);
  const light = mix(a.light, b.light, t);
  const isNight = lights > 0.6;

  const vars: Record<string, string> = {
    "--sky-top": mixColor(a.skyTop, b.skyTop, t),
    "--sky-mid": mixColor(a.skyMid, b.skyMid, t),
    "--sky-bottom": mixColor(a.skyBottom, b.skyBottom, t),
    "--tint": mixColor(a.tint, b.tint, t),
    "--tint-alpha": mix(a.tintAlpha, b.tintAlpha, t).toFixed(3),
    "--haze": mixColor(a.haze, b.haze, t),
    "--glow": mixColor(a.glow, b.glow, t),
    "--light": light.toFixed(3),
    "--sat": mix(a.sat, b.sat, t).toFixed(3),
    "--stars": stars.toFixed(3),
    "--lights": lights.toFixed(3),
    "--sun-x": `${sunX.toFixed(2)}%`,
    "--sun-y": `${sunY.toFixed(2)}%`,
    "--sun-o": sunO.toFixed(3),
    "--moon-x": `${moonX.toFixed(2)}%`,
    "--moon-y": `${moonY.toFixed(2)}%`,
    "--moon-o": moonO.toFixed(3),
    // Texto sobre el cielo: claro de noche, tinta de día.
    "--on-sky": isNight || light < 0.8 ? "#fff6e5" : "#2a2342",
  };

  return { minute, phase: phase.id, label: phase.label, emoji: phase.emoji, isNight, vars };
}
