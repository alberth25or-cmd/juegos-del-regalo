/** Zonas de la aldea que aparecen al bajar, cada una con sus juegos. */

export type SceneId =
  | "chocolatada"
  | "galeria"
  | "pista"
  | "mirador"
  | "inteligencia"
  | "callejon"
  | "ogro"
  | "taller"
  | "salon"
  | "boveda";

export interface GameCardDef {
  id: string;
  title: string;
  tagline: string;
  href: string;
  /** sprite de /art/sprites o emoji grande */
  sprite?: string;
  emoji?: string;
  color: string;
  points?: string;
  minutes?: string;
  /** día de la temporada en que se desbloquea */
  unlockDay?: number;
  featured?: boolean;
  /** silueta misteriosa del sprite */
  mystery?: boolean;
  /** texto de la cinta destacada */
  ribbon?: string;
  /** arte pixel propio en lugar de sprite/emoji */
  art?: "ogre" | "snowman";
  /** progreso compartido del grupo (juegos colaborativos) */
  progress?: [number, number];
}

export interface ModuleDef {
  id: SceneId;
  /** emoji para la barra de zonas */
  icon: string;
  /** nombre corto para la barra de zonas */
  short: string;
  category: string;
  title: string;
  description: string;
  bg: string;
  bg2: string;
  dark?: boolean;
  cards: GameCardDef[];
}

export const MODULES: ModuleDef[] = [
  {
    id: "chocolatada",
    icon: "🍫",
    short: "Misiones",
    category: "Misiones del día",
    title: "Plaza de la Chocolatada",
    description: "Aquí salen las misiones del día. Dos minutitos y listo, agente.",
    bg: "#fbe9c9",
    bg2: "#f4d6a8",
    cards: [
      { id: "foto", title: "Foto misión", tagline: "Algo rojo cerca de ti", href: "/reto", sprite: "muro-fotos", color: "#ffb3c7", points: "+10", minutes: "1 min", featured: true, ribbon: "Hoy" },
      { id: "palabra", title: "Palabra secreta", tagline: "Haz que la digan en el chat", href: "/reto", sprite: "mascota", color: "#9fe3cf", points: "+15", minutes: "WhatsApp" },
      { id: "verdad", title: "Verdad o mentira", tagline: "3 datos, 1 es falso", href: "/reto", emoji: "🤥", color: "#b9a7f5", points: "+15", minutes: "2 min", unlockDay: 4 },
    ],
  },
  {
    id: "galeria",
    icon: "📸",
    short: "Galería",
    category: "Creatividad",
    title: "Galería del Tendedero",
    description: "Fotos anónimas colgadas al aire. Vota la mejor y adivina de quién es.",
    bg: "#ffe3ec",
    bg2: "#ffc6d8",
    cards: [
      { id: "muro", title: "Muro de fotos", tagline: "Votación abierta: 12 fotos", href: "/fotos", sprite: "muro-fotos", color: "#ffb3c7", points: "+20", featured: true, ribbon: "Votación" },
      { id: "emoji", title: "Emoji resumen", tagline: "Tu día en 3 emojis", href: "/reto", emoji: "🤪", color: "#f6b93b", points: "+10", minutes: "30 s" },
      { id: "meme", title: "Meme al secreto", tagline: "Mándalo por privado, sin firmar", href: "/reto", emoji: "😂", color: "#9fe3cf", points: "+15", minutes: "WhatsApp", unlockDay: 6 },
    ],
  },
  {
    id: "pista",
    icon: "⛸️",
    short: "Ranking",
    category: "Competencia",
    title: "Pista de hielo",
    description: "Quién va primero, quién apuesta y quién se guarda un comodín.",
    bg: "#dff3ff",
    bg2: "#bfe3f7",
    cards: [
      { id: "ranking", title: "Ranking en vivo", tagline: "Vas 4.º, ¡a remar!", href: "/ranking", sprite: "tablero-plaza", color: "#8fd3ff", featured: true, ribbon: "En vivo" },
      { id: "apuestas", title: "Apuestas", tagline: "¿Quién gana la foto de hoy?", href: "/tienda", emoji: "🎲", color: "#f6b93b", points: "x2" },
      { id: "comodines", title: "Comodines", tagline: "Escudo, robar, doble", href: "/tienda", sprite: "tienda", color: "#ffb3c7" },
    ],
  },
  {
    id: "mirador",
    icon: "⏰",
    short: "Semanales",
    category: "Misiones semanales",
    title: "Mirador de las Semanales",
    description: "Retos de hasta 10 minutos que dan más puntos. Uno por semana, con calma.",
    bg: "#ece7ff",
    bg2: "#d4caff",
    cards: [
      { id: "cumplidos", title: "Cadena de cumplidos", tagline: "Un mensaje anónimo bonito", href: "/reto", emoji: "💌", color: "#ffb3c7", points: "+30", minutes: "Semanal", featured: true, ribbon: "Esta semana" },
      { id: "duelo", title: "Duelo de dos", tagline: "24 h, el grupo elige al ganador", href: "/reto", emoji: "☃️", color: "#8fd3ff", points: "+30", unlockDay: 7 },
      { id: "capsula", title: "Cápsula del tiempo", tagline: "Se abre el día de la entrega", href: "/reto", emoji: "⏳", color: "#f6b93b", points: "+30", minutes: "5 min" },
    ],
  },
  {
    id: "inteligencia",
    icon: "🕵️",
    short: "Secreto",
    category: "Clasificado",
    title: "Oficina de Inteligencia",
    description: "Pistas, sospechas y expedientes. Nadie sabe quién le regala… todavía.",
    bg: "#1f2552",
    bg2: "#141a40",
    dark: true,
    cards: [
      { id: "amigo", title: "Mi amigo secreto", tagline: "Expediente confidencial", href: "/amigo", sprite: "buzon", color: "#e2445c", featured: true, ribbon: "Nueva pista" },
      { id: "quien", title: "¿Quién te regala?", tagline: "Arriesga tu sospecha", href: "/amigo", sprite: "mascota", mystery: true, color: "#b9a7f5", points: "+50" },
      { id: "trivia", title: "Trivia del grupo", tagline: "¿Quién llegó tarde al último plan?", href: "/reto", emoji: "🧠", color: "#9fe3cf", unlockDay: 5 },
    ],
  },
  {
    id: "callejon",
    icon: "🔦",
    short: "Traidor",
    category: "Espionaje",
    title: "Callejón del Traidor",
    description: "Alguien tiene una misión secreta. Alguien miente. ¿Te das cuenta a tiempo?",
    bg: "#2b1d3f",
    bg2: "#180f29",
    dark: true,
    cards: [
      { id: "doble", title: "Agente doble", tagline: "Tienes una misión secreta 🤫", href: "/reto", emoji: "🕶️", color: "#e2445c", points: "+25", featured: true, ribbon: "Solo para ti" },
      { id: "traidor", title: "Caza al traidor", tagline: "Vota quién sabotea hoy", href: "/reto", emoji: "🔍", color: "#f6b93b", points: "+20", unlockDay: 6 },
      { id: "adivina", title: "Adivina quién", tagline: "Una pista anónima, ¿de quién es?", href: "/reto", emoji: "🎭", color: "#b9a7f5", points: "+10" },
    ],
  },
  {
    id: "ogro",
    icon: "🧌",
    short: "Ogro",
    category: "Sigilo",
    title: "Cueva del Ogro Panetonero",
    description: "Se robó los regalos y duerme encima. Cruza sin hacer bulla, agente… y si ronca, avanza.",
    bg: "#dcf3f7",
    bg2: "#a9dbe6",
    cards: [
      { id: "sigilo", title: "¡Que no despierte!", tagline: "Avanza solo cuando ronca", href: "/reto", art: "ogre", color: "#b9a7f5", points: "+15", minutes: "1 min", featured: true, ribbon: "Nuevo" },
      { id: "acertijos", title: "Acertijos del ogro", tagline: "Falla y se come tu panetón", href: "/reto", emoji: "🧩", color: "#9fe3cf", points: "+10", minutes: "1 min" },
      { id: "rescate", title: "Rescata el regalo", tagline: "Sigue las huellas: ¿dónde lo escondió?", href: "/reto", emoji: "🎁", color: "#ffb3c7", points: "+30", unlockDay: 8 },
    ],
  },
  {
    id: "taller",
    icon: "☃️",
    short: "Equipo",
    category: "Juego colaborativo",
    title: "Taller del Muñeco Gigante",
    description: "Aquí no se compite: si el grupo cumple la meta, ganan todos. Nadie se queda atrás.",
    bg: "#ffe4d9",
    bg2: "#ffc3ad",
    cards: [
      { id: "muneco", title: "Muñeco de nieve gigante", tagline: "Aporta tu bola de nieve de hoy", href: "/reto", art: "snowman", color: "#8fd3ff", points: "+20 c/u", featured: true, ribbon: "Entre todos", progress: [9, 15] },
      { id: "mosaico", title: "Mosaico del grupo", tagline: "Cada uno destapa una pieza", href: "/reto", emoji: "🖼️", color: "#f6b93b", points: "+10 c/u", progress: [6, 15] },
      { id: "fogata", title: "Fogata del equipo", tagline: "Si todos entran 3 días: ¡doble puntaje!", href: "/reto", emoji: "🔥", color: "#e2445c", progress: [2, 3] },
    ],
  },
  {
    id: "salon",
    icon: "🏆",
    short: "Fama",
    category: "Logros",
    title: "Salón de la Fama",
    description: "Tus insignias, tus pistas y el calendario que se abre día a día.",
    bg: "#e3fbef",
    bg2: "#bfeed8",
    cards: [
      { id: "insignias", title: "Insignias", tagline: "Madrugador, Detective y más", href: "/calendario", emoji: "🏅", color: "#f6b93b", featured: true, ribbon: "3 de 6" },
      { id: "pistas", title: "Mis pistas y wishlist", tagline: "Lo que le llega a tu secreto", href: "/amigo", emoji: "🎁", color: "#ffb3c7" },
      { id: "calendario", title: "Calendario de adviento", tagline: "Día 3 de 14 abierto", href: "/calendario", sprite: "arbol", color: "#9fe3cf" },
    ],
  },
  {
    id: "boveda",
    icon: "💰",
    short: "Pozo",
    category: "El pozo",
    title: "Bóveda del Pozo",
    description: "S/ 150 en juego. El podio se lleva el botín el día de la entrega.",
    bg: "#fff1c9",
    bg2: "#f6dc8f",
    cards: [
      { id: "pozo", title: "El pozo", tagline: "11 de 15 ya pagaron", href: "/pozo", sprite: "cofre", color: "#f6b93b", featured: true, ribbon: "S/ 150" },
      { id: "custodio", title: "Custodio", tagline: "Vota quién guarda la plata", href: "/pozo", emoji: "🗳️", color: "#9fe3cf" },
      { id: "final", title: "Gran final", tagline: "Revelación y podio", href: "/calendario", sprite: "arbol", color: "#e2445c", unlockDay: 14 },
    ],
  },
];

/** Número de zona (1–8) a partir de su id. */
export function zoneNumber(id: string) {
  return MODULES.findIndex((m) => m.id === id) + 1;
}
