/**
 * Contenido del modo prueba: agentes bot, temas de misiones, preguntas y
 * calendario de la temporada (sigue JUEGOS.md).
 */

export interface Bot {
  id: string;
  codename: string;
  avatar: string;
  /** probabilidad de cumplir la misión del día */
  actividad: number;
  color: string;
  /** 3 datos; `mentira` es el índice del falso */
  datos: [string, string, string];
  mentira: number;
  emojis: [string, string, string];
  frase: string;
  pistas: string[];
  wishlist: string;
}

export const BOTS: Bot[] = [
  {
    id: "b1", codename: "Agente Chocotón", avatar: "🐻", actividad: 0.92, color: "#e2445c",
    datos: ["Me comí 3 panetones en una semana", "Sé tocar el cajón peruano", "Nunca he visto nieve"], mentira: 1,
    emojis: ["🍫", "😴", "🎄"], frase: "De niño pensaba que Papá Noel vivía en Huancayo",
    pistas: ["Le encanta el chocolate caliente", "Siempre llega tarde a los planes", "Su color favorito es el rojo"],
    wishlist: "Una taza gigante, medias navideñas · hasta S/ 40",
  },
  {
    id: "b2", codename: "Agente Pisco Sour", avatar: "🦊", actividad: 0.85, color: "#f6b93b",
    datos: ["Fui a Machu Picchu caminando", "Tengo 4 gatos", "Odio el ceviche"], mentira: 2,
    emojis: ["🍋", "🏔️", "📸"], frase: "Una vez me quedé dormido en un concierto",
    pistas: ["Le gusta viajar y la fotografía", "Usa lentes", "Tiene más plantas que muebles"],
    wishlist: "Un libro de viajes, una planta suculenta · hasta S/ 40",
  },
  {
    id: "b3", codename: "La Infiltrada", avatar: "🦉", actividad: 0.95, color: "#b9a7f5",
    datos: ["Gané un concurso de baile", "Leo un libro por semana", "Sé hablar japonés"], mentira: 2,
    emojis: ["📚", "🕵️", "☕"], frase: "Me sé todos los diálogos de una novela turca",
    pistas: ["Siempre tiene un libro en la mochila", "Es la primera en responder en el chat", "Ama el café"],
    wishlist: "Separadores de libros, café de Chanchamayo · hasta S/ 40",
  },
  {
    id: "b4", codename: "Doble Ají", avatar: "🐸", actividad: 0.7, color: "#2e9e78",
    datos: ["Como ají con todo", "Corrí una maratón", "Me da miedo la oscuridad"], mentira: 1,
    emojis: ["🌶️", "🔥", "😂"], frase: "Lloré viendo una película de dibujos animados",
    pistas: ["Le pone ají hasta al desayuno", "Manda memes a las 3 a. m.", "Su risa se escucha desde lejos"],
    wishlist: "Salsas picantes, un polo gracioso · hasta S/ 40",
  },
  {
    id: "b5", codename: "Cuy Clasificado", avatar: "🐹", actividad: 0.8, color: "#ff8fb0",
    datos: ["Tuve un cuy de mascota", "Nací en Arequipa", "Nunca me he subido a un avión"], mentira: 0,
    emojis: ["🎮", "🍕", "🌙"], frase: "Me sé el abecedario al revés",
    pistas: ["Es fan de los videojuegos", "Siempre pide pizza", "Es búho: duerme tardísimo"],
    wishlist: "Un juego de mesa, audífonos baratos · hasta S/ 40",
  },
  {
    id: "b6", codename: "Agente Panetón", avatar: "🐼", actividad: 0.75, color: "#57b9f0",
    datos: ["Cocino el mejor arroz con pollo", "Tengo una colección de stickers", "Sé hacer malabares"], mentira: 2,
    emojis: ["🍗", "🎨", "🎶"], frase: "Una vez saludé a alguien que no me saludaba a mí",
    pistas: ["Le encanta cocinar", "Siempre trae algo de comer a los planes", "Canta en la ducha (muy fuerte)"],
    wishlist: "Un delantal divertido, especias · hasta S/ 40",
  },
  {
    id: "b7", codename: "Agente Lúcuma", avatar: "🐰", actividad: 0.88, color: "#9fe3cf",
    datos: ["Soy alérgico a los gatos", "Me sé todas las capitales", "Tengo un tatuaje secreto"], mentira: 0,
    emojis: ["🍦", "🌍", "✈️"], frase: "Me perdí en un centro comercial a los 20 años",
    pistas: ["Su helado favorito es de lúcuma", "Siempre gana en las trivias", "Sueña con conocer Japón"],
    wishlist: "Un mapa para raspar, chocolates · hasta S/ 40",
  },
  {
    id: "b8", codename: "Agente Rocoto", avatar: "🐱", actividad: 0.65, color: "#c48a5a",
    datos: ["Duermo 10 horas diarias", "Fui scout", "Tengo miedo a las palomas"], mentira: 0,
    emojis: ["⚽", "🍺", "📺"], frase: "Me dormí en mi propia fiesta de cumpleaños",
    pistas: ["No se pierde un partido de fútbol", "Siempre dice 'ya voy' y no llega", "Es muy fan de las series"],
    wishlist: "Una camiseta de fútbol, canchita · hasta S/ 40",
  },
];

export const YO = "yo";

/** Calendario de la temporada: tipo de misión de cada día. */
export const CALENDARIO: Record<number, string> = {
  0: "pretemporada",
  1: "foto",
  2: "verdad",
  3: "emoji",
  4: "palabra",
  5: "trivia",
  6: "foto",
  7: "adivina",
  8: "traidor",
  9: "foto",
  10: "verdad",
  11: "meme",
  12: "emoji",
  13: "trivia",
  14: "final",
};

export const ULTIMO_DIA = 14;

export const TEMAS_FOTO: Record<number, string> = {
  1: "Algo rojo que tengas cerca",
  6: "Tu desayuno más peruano",
  9: "Tu mejor cara de espía",
};

export const PALABRAS = ["chirimoya", "cachivache", "pituco", "chancay", "huachafo", "jatear", "chamba", "taita", "yapa", "misio"];

export interface PreguntaTrivia {
  pregunta: string;
  respuesta: string; // id de bot
}

export const TRIVIA: Record<number, PreguntaTrivia[]> = {
  5: [
    { pregunta: "¿Quién siempre llega tarde a los planes?", respuesta: "b1" },
    { pregunta: "¿Quién le pone ají a todo?", respuesta: "b4" },
    { pregunta: "¿Quién siempre gana en las trivias?", respuesta: "b7" },
  ],
  13: [
    { pregunta: "¿Quién duerme más que nadie?", respuesta: "b8" },
    { pregunta: "¿Quién siempre trae comida a los planes?", respuesta: "b6" },
    { pregunta: "¿Quién responde primero en el chat?", respuesta: "b3" },
  ],
};

export const ACERTIJOS = [
  { q: "Tengo agujas pero no coso, tengo números pero no soy teléfono. ¿Qué soy?", ops: ["Un reloj", "Un pino", "Un cactus"], ok: 0 },
  { q: "Cuanto más le quitas, más grande se hace. ¿Qué es?", ops: ["Un panetón", "Un hoyo", "Un globo"], ok: 1 },
  { q: "Blanca por dentro, verde por fuera. Si quieres que te lo diga, espera.", ops: ["La pera", "La palta", "El pepino"], ok: 0 },
  { q: "Vuelo sin alas, lloro sin ojos. ¿Qué soy?", ops: ["El viento", "La nube", "El humo"], ok: 1 },
  { q: "Todos me pisan pero yo no piso a nadie. ¿Qué soy?", ops: ["La sombra", "El camino", "La alfombra"], ok: 1 },
  { q: "Tiene dientes y no come, tiene barba y no es hombre.", ops: ["El ajo", "El peine", "El choclo"], ok: 0 },
  { q: "Soy alta cuando soy joven y baja cuando soy vieja. ¿Qué soy?", ops: ["Una vela", "Una escalera", "Una montaña"], ok: 0 },
];

export const EMOJIS_PALETA = ["😴", "😂", "🥳", "😎", "🤯", "😭", "🍫", "☕", "🍕", "🎄", "🎁", "⚽", "📚", "🎮", "🚌", "💼", "🌧️", "🔥", "❤️", "🐹"];

export const MISION_DOBLE = "Logra que alguien del grupo mande un sticker de gato en WhatsApp antes del día 6.";

export const RETO_DUELO = "El mejor muñeco de nieve hecho con lo que tengas en casa (papel, medias, lo que sea).";

export const ZONA_ESCONDITE = "taller"; // donde el ogro escondió el regalo (Rescata el regalo)

/** Pistas sobre quien te regala: primero las suyas, luego pistas generadas cada vez más claras. */
export function pistaDelDia(bot: Bot, dia: number): string {
  if (dia <= 0) return "";
  if (dia <= bot.pistas.length) return bot.pistas[dia - 1];
  const nombre = bot.codename.replace(/^Agente\s+/i, "").replace(/^La\s+/i, "");
  const extra = [
    `Su avatar es ${bot.avatar}… o eso dicen.`,
    `Su nombre de agente tiene ${nombre.length} letras.`,
    `Su nombre de agente empieza con "${nombre[0]}".`,
    `Su emoji del día fue ${bot.emojis[0]}.`,
    `Dato confirmado: "${bot.datos[(bot.mentira + 1) % 3]}"`,
    `Su wishlist incluye: ${bot.wishlist.split(",")[0]}.`,
  ];
  return extra[(dia - bot.pistas.length - 1) % extra.length];
}

/** Puntos por adivinar a tu amigo secreto según el día (más temprano, más puntos). */
export function puntosSospecha(dia: number) {
  return Math.max(5, Math.round(50 - (dia - 1) * 3.75));
}

/** Pozo del grupo de prueba: S/ 10 × 15 agentes, podio 60 % · 27 % · 13 % = S/ 90 · 40 · 20. */
export const POZO = { total: 150, reparto: [60, 27, 13], montos: [90, 40, 20] };
