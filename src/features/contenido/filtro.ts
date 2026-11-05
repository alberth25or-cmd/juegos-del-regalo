/**
 * Chat corto del mundo: filtro simple y transparente (el documento pide humor sí,
 * ataques no). Bloquea insultos discriminatorios y datos personales; enmascara
 * groserías comunes. No es perfecto: por eso además hay botón de reportar.
 */

export const MAX_CHAT = 60;

/** Emotes rápidos (globito sobre el personaje). */
export const EMOTES = ["👋", "😂", "😱", "😡", "🥳", "🎁", "❤️", "💀", "🤔", "🫡"] as const;

/** Frases rápidas del juego (seguras, sin escribir). */
export const FRASES_RAPIDAS = [
  "¡Hola, Snowville!",
  "¿Alguien para jugar?",
  "Ya estoy llegando (mentira)",
  "Santa nos debe el sueldo",
  "¡Vamos, equipo!",
  "Sospecho del Muñeco",
  "Te reto en la Arena",
  "Buena esa 👏",
  "Me voy a la fábrica",
  "¡Feliz Navidad, aunque estemos en quiebra!",
] as const;

// Raíces discriminatorias o de odio: el mensaje se bloquea entero.
const BLOQUEADAS = [
  "maricon",
  "marica",
  "cabro",
  "rosquete",
  "serrano",
  "cholo de",
  "indio de",
  "negro de",
  "mongol",
  "retrasad",
  "subnormal",
  "sidoso",
  "puta madre que te",
  "te voy a matar",
  "matate",
  "suicid",
  "violar",
  "nazi",
];

// Groserías comunes: se enmascaran (el mensaje pasa).
const ENMASCARAR = ["mierda", "carajo", "cojudo", "cojuda", "huevon", "huevona", "webon", "webona", "conchatumare", "ctm", "puta", "pendejo", "pendeja", "joder", "chucha"];

function normalizar(t: string) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[0@]/g, "o")
    .replace(/[1!]/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/\$/g, "s");
}

export type ResultadoFiltro = { ok: true; texto: string } | { ok: false; motivo: string };

export function filtrarChat(entrada: string): ResultadoFiltro {
  const texto = entrada
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CHAT);
  if (!texto) return { ok: false, motivo: "Escribe algo." };
  const n = normalizar(texto);
  if (BLOQUEADAS.some((b) => n.includes(b))) return { ok: false, motivo: "Ese mensaje no va: humor sí, ataques no." };
  // Datos personales: teléfonos, correos, enlaces.
  if (/\d[\d\s-]{7,}\d/.test(texto) || /\S+@\S+\.\S+/.test(texto) || /(https?:\/\/|www\.)/i.test(texto))
    return { ok: false, motivo: "Nada de teléfonos, correos ni enlaces en el chat del pueblo." };
  let limpio = texto;
  for (const g of ENMASCARAR) {
    const re = new RegExp(g.split("").join("[\\W_]*"), "gi");
    limpio = limpio.replace(re, (m) => m[0] + "*".repeat(Math.max(1, m.length - 1)));
  }
  return { ok: true, texto: limpio };
}
