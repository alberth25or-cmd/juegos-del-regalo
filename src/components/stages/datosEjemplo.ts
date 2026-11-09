/**
 * Datos de ejemplo para la vista de diseño (/diseno). Nada de esto viene de la BD.
 * shortcut: los tipos viven aquí hasta que el Frente 3 (motor de stages) defina los reales.
 */
import { avatarAlAzar, type ConfigAvatar } from "@/features/avatar";
import { crearAzar } from "@/features/azar";
import type { IconName } from "@/components/ui/PixelIcon";

/**
 * Dinámica (decisión de Luis, 2026-11-09): TODAS las casas se abren con el "Empezar" y cada día
 * salen preguntas nuevas del tema de cada casa.
 *  - nuevas: hoy tiene preguntas (o retos) que todavía no respondiste.
 *  - aldia:  ya respondiste todas las de hoy; mañana salen más.
 *  - cerrada: solo la ficha del amigo secreto, que se abre en su fecha para todos.
 */
export type EstadoCasa = "nuevas" | "aldia" | "cerrada";

export interface Juego {
  nombre: string;
  href: string;
  icono: IconName;
  /** Si es false, se muestra deshabilitado con su motivo. */
  disponible: boolean;
  nota?: string;
  /** Ya lo jugaste hoy. */
  hechoHoy?: boolean;
}

export interface Stage {
  /** 1..5 para stages, 6 = ficha del amigo secreto. */
  n: number;
  nombre: string;
  corto: string;
  icono: IconName;
  descripcion: string;
  estado: EstadoCasa;
  /** Cuántas preguntas (o retos) nuevas salen cada día en esta casa. */
  porDia: number;
  /** Cuántas de las de hoy ya respondiste. */
  hechasHoy: number;
  /** "pregunta" o "reto", para los textos ("2 preguntas nuevas"). */
  unidad: "pregunta" | "reto";
  /** Solo la ficha (cerrada): cuándo se abre. */
  abre?: string;
  /** Color del techo de la casa. */
  papel: "rojo" | "verde" | "azul" | "morado";
  /** Monedas que llevas ganadas en esta casa. */
  monedas?: number;
  /** Solo Amor y Picante: pases que ya usaste en la temporada. */
  pasesUsados?: number;
  accion?: { texto: string; href: string };
  juegos?: Juego[];
}

export interface Agente {
  alias: string;
  avatar: ConfigAvatar;
  /** Casas en las que ya respondió todo lo de hoy (1..5). */
  hoy: number[];
  /** Saldo de monedas: es lo que cuenta en el ranking (una sola moneda para todo). */
  monedas: number;
  yo?: boolean;
}

/** Alias = "Agente" + plato peruano, con espacios (decisión de Cesar: sin barra baja). */
const PLATOS = [
  "Picarón", "Mazamorra", "Cau Cau", "Rocoto", "Anticucho", "Causa", "Lúcuma", "Chicha",
  "Tamal", "Papa Rellena", "Suspiro", "Ají de Gallina", "Cebiche", "Turrón", "Chaufa", "Seco",
  "Pachamanca", "Humita", "Alfajor", "Chicharrón",
];

/** "Agente Cau Cau" → "Cau Cau": para listas cortas donde "Agente" se repite. */
export const plato = (alias: string) => alias.replace(/^Agente\s+/, "");

const azar = crearAzar(2026);
// Casas en las que ya está al día cada agente. Rocoto (tú) solo terminó el Calentamiento.
const hoyDe = (p: string) => (p === "Rocoto" ? [1] : [1, 2, 3, 4, 5].filter(() => azar() < 0.55));

export const AGENTES: Agente[] = PLATOS.map((p, i) => ({
  alias: `Agente ${p}`,
  avatar: avatarAlAzar(azar),
  hoy: hoyDe(p),
  monedas: Math.max(40, 520 - i * 22 - Math.floor(azar() * 12)),
  yo: p === "Rocoto",
})).sort((a, b) => b.monedas - a.monedas);

export const YO = AGENTES.find((a) => a.yo)!;
export const PUESTO = AGENTES.indexOf(YO) + 1;

export const STAGES: Stage[] = [
  {
    n: 1, nombre: "Calentamiento", corto: "Calentar", icono: "mission", papel: "verde",
    descripcion: "Minijuegos para entrar en calor. Cada día: una partida de cada uno y una trivia nueva.",
    estado: "aldia", porDia: 3, hechasHoy: 3, unidad: "reto", monedas: 180,
    juegos: [
      { nombre: "Gift Catcher", href: "/arcade/gift-catcher", icono: "chest", disponible: true, hechoHoy: true },
      { nombre: "Memory Gifts", href: "/arcade/memory", icono: "sparkle", disponible: true, hechoHoy: true },
      { nombre: "Trivia del día", href: "/arena/trivia", icono: "ranking", disponible: false, nota: "Necesita la base de datos", hechoHoy: true },
    ],
  },
  {
    n: 2, nombre: "La manada", corto: "Manada", icono: "sheep", papel: "rojo",
    descripcion: "Adivina lo que piensa la mayoría. Una pregunta nueva cada día: si coincides con el grupo, sumas.",
    estado: "nuevas", porDia: 1, hechasHoy: 0, unidad: "pregunta", monedas: 40,
    accion: { texto: "Responder la de hoy", href: "/diseno/manada" },
  },
  {
    n: 3, nombre: "Amor y relaciones", corto: "Amor", icono: "heart", papel: "morado",
    descripcion: "Preguntas nuevas de amor cada día, de respuesta corta. Puedes pasar, pero cuesta monedas y los pases son pocos.",
    estado: "nuevas", porDia: 2, hechasHoy: 1, unidad: "pregunta", monedas: 60, pasesUsados: 2,
    accion: { texto: "Responder las de hoy", href: "/diseno/amor" },
  },
  {
    n: 4, nombre: "Picante", corto: "Picante", icono: "chili", papel: "rojo",
    descripcion: "Preguntas nuevas cada día, solo sí o no. La primera vez confirmas que eres mayor de edad (o eliges no jugarla).",
    estado: "nuevas", porDia: 2, hechasHoy: 0, unidad: "pregunta", monedas: 20, pasesUsados: 5,
    accion: { texto: "Responder las de hoy", href: "/diseno/picante" },
  },
  {
    n: 5, nombre: "Juicio final", corto: "Juicio", icono: "star", papel: "azul",
    descripcion: "Un reto nuevo cada día. El último día cierra el ranking.",
    estado: "nuevas", porDia: 1, hechasHoy: 0, unidad: "reto", monedas: 0,
  },
  {
    n: 6, nombre: "Tu amigo secreto", corto: "Ficha", icono: "chest", papel: "verde",
    descripcion: "Su ficha completa, con todo lo que respondió en las casas, para describirlo el día del intercambio.",
    estado: "cerrada", porDia: 0, hechasHoy: 0, unidad: "pregunta", abre: "20 dic",
  },
];

/** Texto de una casa cerrada: "Se abre el 20 dic" o el aviso tal cual ("Próximamente"). */
export const textoCerrada = (s: Stage) => (s.abre && /\d/.test(s.abre) ? `Se abre el ${s.abre}` : (s.abre ?? "Cerrada"));

/** Pendientes de hoy en una casa. */
export const faltanHoy = (s: Stage) => Math.max(0, s.porDia - s.hechasHoy);

/** "1 pregunta nueva" / "2 retos nuevos". */
export function cuantas(n: number, unidad: Stage["unidad"]) {
  const plural = n === 1 ? "" : "s";
  return unidad === "reto" ? `${n} reto${plural} nuevo${plural}` : `${n} pregunta${plural} nueva${plural}`;
}

export const DIA = { dia: 7, total: 30 };

/** Cuántas de tus respuestas abrió hoy quien te regala (el aviso no dice quién ni cuáles). */
export const FISGONEOS_HOY = 2;

export const SALA = { capacidad: 20, presupuesto: 40, premio: "Canasta navideña para el primer lugar" };
