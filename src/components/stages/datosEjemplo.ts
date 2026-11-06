/**
 * Datos de ejemplo para la vista de diseño (/diseno). Nada de esto viene de la BD.
 * shortcut: los tipos viven aquí hasta que el Frente 3 (motor de stages) defina los reales.
 */
import { avatarAlAzar, type ConfigAvatar } from "@/features/avatar";
import { crearAzar } from "@/features/azar";
import type { IconName } from "@/components/ui/PixelIcon";

export type EstadoStage = "superado" | "actual" | "bloqueado";

export interface Juego {
  nombre: string;
  href: string;
  icono: IconName;
  /** Si es false, se muestra deshabilitado con su motivo. */
  disponible: boolean;
  nota?: string;
}

export interface Stage {
  /** 1..5 para stages, 6 = ficha del amigo secreto. */
  n: number;
  nombre: string;
  corto: string;
  icono: IconName;
  descripcion: string;
  estado: EstadoStage;
  abre: string;
  /** Color del papel de regalo cuando está bloqueado. */
  papel: "rojo" | "verde" | "azul" | "morado";
  avance?: string;
  puntos?: number;
  accion?: { texto: string; href: string };
  juegos?: Juego[];
}

export interface Agente {
  alias: string;
  avatar: ConfigAvatar;
  /** Índice del stage donde va (1..6). */
  stage: number;
  puntos: number;
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
const stageDe = [3, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1];

export const AGENTES: Agente[] = PLATOS.map((p, i) => ({
  alias: `Agente ${p}`,
  avatar: avatarAlAzar(azar),
  stage: stageDe[i],
  puntos: Math.max(40, 520 - i * 22 - Math.floor(azar() * 12)),
  yo: p === "Rocoto",
})).sort((a, b) => b.puntos - a.puntos);

export const YO = AGENTES.find((a) => a.yo)!;
export const PUESTO = AGENTES.indexOf(YO) + 1;

export const STAGES: Stage[] = [
  {
    n: 1, nombre: "Calentamiento", corto: "Calentar", icono: "mission", papel: "verde",
    descripcion: "Tres minijuegos para entrar en calor. Juega cada uno al menos una vez.",
    estado: "superado", abre: "25 nov", puntos: 180,
    juegos: [
      { nombre: "Gift Catcher", href: "/arcade/gift-catcher", icono: "chest", disponible: true },
      { nombre: "Memory Gifts", href: "/arcade/memory", icono: "sparkle", disponible: true },
      { nombre: "Trivia", href: "/arena/trivia", icono: "ranking", disponible: false, nota: "Necesita la base de datos" },
    ],
  },
  {
    n: 2, nombre: "La manada", corto: "Manada", icono: "sheep", papel: "rojo",
    descripcion: "Adivina lo que piensa la mayoría. Una pregunta por día: si coincides con el grupo, sumas.",
    estado: "actual", abre: "30 nov", avance: "Llevas 2 de 5 · Hoy cierra a las 23:59",
    accion: { texto: "Responder la de hoy", href: "/diseno/manada" },
  },
  { n: 3, nombre: "Amor y relaciones", corto: "Amor", icono: "heart", papel: "morado", descripcion: "Preguntas directas de respuesta corta. Puedes pasar, pero resta puntos.", estado: "bloqueado", abre: "5 dic" },
  { n: 4, nombre: "Picante", corto: "Picante", icono: "chili", papel: "rojo", descripcion: "Solo sí o no. Antes de entrar confirmas que eres mayor de edad.", estado: "bloqueado", abre: "10 dic" },
  { n: 5, nombre: "Juicio final", corto: "Juicio", icono: "star", papel: "azul", descripcion: "El último reto y el cierre del ranking.", estado: "bloqueado", abre: "15 dic" },
  { n: 6, nombre: "Tu amigo secreto", corto: "Ficha", icono: "chest", papel: "verde", descripcion: "Su ficha completa para describirlo el día del intercambio.", estado: "bloqueado", abre: "20 dic" },
];

export const DIA = { stage: 2, de: 5, dia: 7, total: 30 };

export const SALA = { capacidad: 20, presupuesto: 40, premio: "Canasta navideña para el primer lugar" };
