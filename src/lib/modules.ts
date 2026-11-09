/**
 * Zonas de Snowville (debajo de la aldea). Cada zona reutiliza una escena
 * animada y lista sus actividades. Solo las que existen de verdad tienen enlace;
 * las demás dicen honestamente cuándo se abren (nada de botones decorativos).
 */

export type SceneId = "chocolatada" | "galeria" | "pista" | "mirador" | "inteligencia" | "callejon" | "ogro" | "taller" | "salon" | "boveda";

export type ZonaId = "plaza" | "arcade" | "fabrica" | "bosque" | "mercado" | "tablon" | "arena" | "trofeos";

export interface GameCardDef {
  id: string;
  title: string;
  tagline: string;
  /** enlace SOLO si la actividad ya funciona */
  href?: string;
  /** fase del plan en que se construye (se muestra "Próximamente") */
  abre?: string;
  sprite?: string;
  emoji?: string;
  npc?: "santa" | "rudolf" | "duende" | "muneco" | "auditor";
  color: string;
  points?: string;
  minutes?: string;
  featured?: boolean;
  ribbon?: string;
  art?: "ogre" | "snowman";
  /** silueta misteriosa del sprite */
  mystery?: boolean;
  /** progreso compartido del grupo (juegos colaborativos) */
  progress?: [number, number];
}

export interface ModuleDef {
  id: ZonaId;
  scene: SceneId;
  icon: string;
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
    id: "arcade",
    scene: "pista",
    icon: "🕹️",
    short: "Arcade",
    category: "Yo contra todos",
    title: "Arcade de Snowville",
    description: "Minijuegos de un minuto. Tu mejor partida del día da monedas; repetir sube tu récord, no tus monedas.",
    bg: "#dff3ff",
    bg2: "#bfe3f7",
    cards: [
      { id: "gift-catcher", title: "Gift Catcher", tagline: "Santa en bancarrota: atrapa regalos, esquiva facturas", href: "/arcade/gift-catcher", npc: "santa", color: "#ffb3c7", points: "hasta 🪙100/día", minutes: "1 min", featured: true, ribbon: "Ya disponible" },
      { id: "memory", title: "Memory Gifts", tagline: "Memoria del desastre: encuentra los pares", emoji: "🧩", color: "#9fe3cf", abre: "Fase 2", minutes: "2 min" },
      { id: "mantener", title: "Aguanta el botón", tagline: "Reflejos de duende en huelga", emoji: "⏱️", color: "#f6b93b", abre: "Fase 2", minutes: "30 s" },
    ],
  },
  {
    id: "fabrica",
    scene: "taller",
    icon: "🏭",
    short: "Fábrica",
    category: "Nosotros contra el juego",
    title: "Fábrica de Regalos",
    description: "Cadena de producción cooperativa: cada uno tiene una estación y nadie puede hacerlo todo solo.",
    bg: "#fff1dc",
    bg2: "#f6d9ad",
    cards: [
      { id: "inutiles", title: "La fábrica de los inútiles", tagline: "Seleccionar, envolver, etiquetar, transportar", npc: "duende", color: "#9fe3cf", abre: "Fase 2", featured: true, ribbon: "Cooperativo" },
      { id: "arbol", title: "Encender el árbol", tagline: "Los 20 contra el desastre: 10 000 de energía", emoji: "🎄", color: "#f6b93b", abre: "Fase 2" },
      { id: "regalo-imposible", title: "El regalo imposible", tagline: "Muévanlo entre todos sin romperlo", emoji: "📦", color: "#ffb3c7", abre: "Fase 5" },
    ],
  },
  {
    id: "bosque",
    scene: "ogro",
    icon: "🌲",
    short: "Bosque",
    category: "Exploración y misterio",
    title: "Bosque Congelado",
    description: "Pistas, acertijos y escapes. Cada jugador ve una parte: hablen o se quedan atrapados.",
    bg: "#1f3a4a",
    bg2: "#142533",
    dark: true,
    cards: [
      { id: "escape", title: "Escape del Polo Norte", tagline: "Pistas distintas para cada uno", art: "ogre", color: "#8fd3ff", abre: "Fase 5", featured: true, ribbon: "Misterio" },
      { id: "acertijo", title: "Acertijos del Muñeco", tagline: "Uno nuevo cada pocos días", npc: "muneco", color: "#b9a7f5", abre: "Fase 3" },
      { id: "maquina", title: "Desactiva la máquina", tagline: "Uno ve la bomba, otros el manual", emoji: "💣", color: "#ffb3c7", abre: "Fase 5" },
    ],
  },
  {
    id: "tablon",
    scene: "galeria",
    icon: "📌",
    short: "Tablón",
    category: "Nosotros contra nosotros",
    title: "Tablón del Caos",
    description: "Votaciones, confesiones anónimas, roast voluntario y memes. Humor ácido, nunca ataques personales.",
    bg: "#ffe3ec",
    bg2: "#ffc6d8",
    cards: [
      { id: "probable", title: "¿Quién es más probable…?", tagline: "Un voto por persona, resultados al cierre", npc: "auditor", color: "#ffb3c7", abre: "Fase 3", featured: true, ribbon: "Votación" },
      { id: "confesionario", title: "Confesionario", tagline: "Responde anónimo y adivina quién fue", emoji: "🕯️", color: "#b9a7f5", abre: "Fase 3" },
      { id: "roast", title: "Roast Battle", tagline: "Solo voluntarios. El grupo vota", emoji: "🎤", color: "#f6b93b", abre: "Fase 3" },
      { id: "memes", title: "Batalla de memes", tagline: "Plantillas propias, gana el grupo", emoji: "😂", color: "#9fe3cf", abre: "Fase 4" },
    ],
  },
  {
    id: "arena",
    scene: "callejon",
    icon: "⚔️",
    short: "Arena",
    category: "Nosotros contra ellos",
    title: "La Arena",
    description: "Duelos, trivia absurda por equipos y guerras de nieve. Gana el equipo con mejor promedio, no el que más juega.",
    bg: "#ece7ff",
    bg2: "#d4caff",
    cards: [
      { id: "trivia", title: "Juicio del Polo Norte", tagline: "Trivia absurda por equipos", npc: "rudolf", color: "#8fd3ff", abre: "Fase 3", featured: true, ribbon: "Equipos" },
      { id: "nieve", title: "Guerra de nieve", tagline: "Por rondas: defiende tu base", art: "snowman", color: "#dff3ff", abre: "Fase 5" },
      { id: "saboteador", title: "Caza al saboteador", tagline: "Alguien tiene una misión secreta", emoji: "🕵️", color: "#ffb3c7", abre: "Fase 5" },
    ],
  },
  {
    id: "mercado",
    scene: "boveda",
    icon: "🕶️",
    short: "Mercado",
    category: "Cosméticos sin ventaja",
    title: "Mercado Negro Navideño",
    description: "Gasta tus monedas en gorros, marcos y objetos absurdos. Lo que gastes te baja en el ranking.",
    bg: "#2a2342",
    bg2: "#1b1730",
    dark: true,
    cards: [
      { id: "tienda", title: "La tienda del Muñeco", tagline: "Calcetín sospechoso, carta de renuncia…", sprite: "tienda", color: "#f6b93b", abre: "Fase 5", featured: true, ribbon: "Monedas" },
      { id: "inventario", title: "Tu inventario", tagline: "Equipa lo que compraste", sprite: "cofre", color: "#b9a7f5", abre: "Fase 5" },
    ],
  },
  {
    id: "trofeos",
    scene: "salon",
    icon: "🏆",
    short: "Trofeos",
    category: "Recuerdos de temporada",
    title: "Salón de Trofeos",
    description: "Logros, el ranking de la vergüenza, la cápsula del tiempo y la ceremonia del juicio final.",
    bg: "#fbe9c9",
    bg2: "#f4d6a8",
    cards: [
      { id: "ranking", title: "Ranking en vivo", tagline: "Individual y por equipos", href: "/ranking", sprite: "tablero-plaza", color: "#8fd3ff", featured: true, ribbon: "En vivo" },
      { id: "verguenza", title: "Ranking de la vergüenza", tagline: "Premios absurdos y también bonitos", emoji: "🥴", color: "#ffb3c7", abre: "Fase 3" },
      { id: "amigo", title: "Amigo secreto", tagline: "Sorteo, wishlist y pistas diarias", sprite: "buzon", color: "#f6b93b", abre: "Fase 3" },
    ],
  },
];

export function zoneNumber(id: ZonaId) {
  return MODULES.findIndex((m) => m.id === id) + 1;
}
