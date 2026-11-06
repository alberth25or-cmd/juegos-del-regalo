/**
 * Datos de ejemplo para la vista de diseño (/diseno). Nada de esto viene de la BD.
 * shortcut: los tipos viven aquí hasta que el Frente 3 (motor de stages) defina los reales.
 */
import { avatarAlAzar, type ConfigAvatar } from "@/features/avatar";
import { crearAzar } from "@/features/azar";
import type { IconName } from "@/components/ui/PixelIcon";

export type EstadoStage = "superado" | "actual" | "bloqueado";

export interface Stage {
  /** 1..5 para stages, 6 = ficha del amigo secreto. */
  n: number;
  nombre: string;
  corto: string;
  icono: IconName;
  descripcion: string;
  estado: EstadoStage;
  abre: string;
  /** Texto de avance dentro del stage ("Llevas 2 de 5"). */
  avance?: string;
  puntos?: number;
  accion?: string;
}

export interface Agente {
  alias: string;
  avatar: ConfigAvatar;
  /** Índice del stage donde va (1..6). */
  stage: number;
  puntos: number;
  yo?: boolean;
}

const PLATOS = [
  "Picarón", "Mazamorra", "Cau_Cau", "Rocoto", "Anticucho", "Causa", "Lúcuma", "Chicha",
  "Tamal", "Papa_Rellena", "Suspiro", "Ají_de_Gallina", "Cebiche", "Turrón", "Chaufa", "Seco",
  "Pachamanca", "Humita", "Alfajor", "Chicharrón",
];

const azar = crearAzar(2026);
const stageDe = [3, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1];

export const AGENTES: Agente[] = PLATOS.map((p, i) => ({
  alias: `Agente_${p}`,
  avatar: avatarAlAzar(azar),
  stage: stageDe[i],
  puntos: Math.max(40, 520 - i * 22 - Math.floor(azar() * 12)),
  yo: p === "Rocoto",
})).sort((a, b) => b.puntos - a.puntos);

export const YO = AGENTES.find((a) => a.yo)!;
export const PUESTO = AGENTES.indexOf(YO) + 1;

export const STAGES: Stage[] = [
  { n: 1, nombre: "Calentamiento", corto: "Calentamiento", icono: "mission", descripcion: "Gift Catcher, Memory y Trivia. Juega cada uno al menos una vez.", estado: "superado", abre: "25 nov", puntos: 180, accion: "Volver a jugar" },
  { n: 2, nombre: "La manada", corto: "Manada", icono: "friend", descripcion: "Adivina lo que piensa la mayoría. Una pregunta por día; ganas si coincides con el grupo.", estado: "actual", abre: "30 nov", avance: "Hoy: pendiente · Llevas 2 de 5 · Cierra 23:59", accion: "Responder la de hoy" },
  { n: 3, nombre: "Amor y relaciones", corto: "Amor", icono: "heart", descripcion: "Preguntas directas de respuesta corta. Puedes pasar, pero resta puntos.", estado: "bloqueado", abre: "5 dic" },
  { n: 4, nombre: "Picante", corto: "Picante", icono: "chili", descripcion: "Solo sí o no. Antes de entrar confirmas que eres mayor de edad.", estado: "bloqueado", abre: "10 dic" },
  { n: 5, nombre: "Juicio final", corto: "Juicio", icono: "ranking", descripcion: "El último reto y el cierre del ranking.", estado: "bloqueado", abre: "15 dic" },
  { n: 6, nombre: "Ficha de tu amigo secreto", corto: "Ficha", icono: "chest", descripcion: "Todo lo que necesitas para describirlo el día del intercambio.", estado: "bloqueado", abre: "20 dic" },
];

export const DIA = { stage: 2, de: 5, dia: 7, total: 30 };

export const SALA = { capacidad: 20, presupuesto: 40, premio: "Canasta navideña para el primer lugar" };
