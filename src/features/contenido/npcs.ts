/**
 * NPCs de Snowville y su catálogo de frases REVISADAS. Nada se genera al vuelo.
 * Tono: sátira de oficina, burocracia y Navidad en quiebra. Las bromas son
 * sobre el universo del juego, nunca sobre los participantes reales.
 */
import { crearAzar } from "../azar.ts";

export type NpcId = "santa" | "rudolf" | "duende" | "muneco" | "auditor";

export interface Npc {
  id: NpcId;
  nombre: string;
  cargo: string;
  color: string;
}

export const NPCS: Record<NpcId, Npc> = {
  santa: { id: "santa", nombre: "Santa", cargo: "Gerente General (en reestructuración)", color: "#c0392b" },
  rudolf: { id: "rudolf", nombre: "Rudolf", cargo: "Líder de Proyecto Autoproclamado", color: "#8a5a3b" },
  duende: { id: "duende", nombre: "Pepe, el duende", cargo: "Secretario General del Sindicato", color: "#2e9e78" },
  muneco: { id: "muneco", nombre: "El Muñeco", cargo: "Cargo: desconocido", color: "#9fb8d6" },
  auditor: { id: "auditor", nombre: "El Auditor", cargo: "Auditoría Externa del Polo Norte", color: "#3b3f5c" },
};

export type Contexto =
  | "general"
  | "pretemporada"
  | "arco1"
  | "arco2"
  | "arco3"
  | "arco4"
  | "arco5"
  | "arco6"
  | "partidaBuena"
  | "partidaMala"
  | "sinEquipo"
  | "pendiente";

type Catalogo = Partial<Record<Contexto, string[]>>;

export const FRASES: Record<NpcId, Catalogo> = {
  santa: {
    general: [
      "Bienvenido a Snowville. No toques nada que tenga una etiqueta de embargo.",
      "Este año la Navidad viene con descuento. Para mí, no para ustedes.",
      "Mi médico dice que reduzca el estrés. Mi contador dice que me fugue.",
      "La fábrica no está en quiebra. Está en una etapa de iliquidez emocional.",
      "Si alguien pregunta por los aguinaldos: me fui a repartir regalos.",
    ],
    pretemporada: [
      "La temporada empieza pronto. Aprovechen para practicar; yo aprovecho para esconderme del banco.",
      "Todavía no abrimos. Estamos esperando que llegue el préstamo… o un milagro.",
    ],
    arco1: ["Día uno y ya hay tres reclamos. Récord histórico."],
    arco3: ["Que se peleen los equipos. Mientras discuten, nadie revisa mis cuentas."],
    arco6: ["Si salvan la Navidad, prometo pagar las horas extra. Prometer es gratis."],
    partidaBuena: ["¡Eso es productividad! La voy a reportar como mía.", "Con empleados así, casi parezco un buen gerente."],
    partidaMala: ["Tranquilo, peores resultados he presentado yo al directorio.", "No te preocupes: el carbón también es un regalo. Más o menos."],
    pendiente: ["Tu contrato está en revisión. El organizador tiene que aprobarte primero."],
  },
  rudolf: {
    general: [
      "Sin mi nariz, este trineo no sale ni del garaje. Que conste en actas.",
      "Yo no trabajo en equipo. El equipo trabaja alrededor mío.",
      "Pedí un aumento. Me dieron una bufanda. Estamos negociando.",
      "Soy el reno más importante del Polo Norte y mi LinkedIn lo demuestra.",
    ],
    arco2: ["La amistad se rompe, pero mi reputación sigue intacta."],
    arco4: ["Si hay un saboteador, obviamente no soy yo. Soy demasiado brillante."],
    partidaBuena: ["Buen trabajo. Casi tan bueno como yo en un mal día."],
    partidaMala: ["Te faltó liderazgo. Te recomiendo mi curso de 12 cuotas."],
    sinEquipo: ["¿Sin equipo? Tranquilo, yo tampoco tengo uno a mi altura."],
  },
  duende: {
    general: [
      "¡Huelga general! Bueno, después del almuerzo.",
      "Exigimos tres cosas: sueldo justo, calefacción y que Santa deje de llamarnos 'mis pequeños'.",
      "Llevo 300 años envolviendo regalos y todavía estoy a prueba.",
      "Si ves un regalo mal envuelto, es una protesta. Si está bien envuelto, también.",
    ],
    arco1: ["Primer día y ya convocamos asamblea. Vamos bien."],
    arco3: ["La fábrica necesita manos. Las nuestras están ocupadas sosteniendo pancartas."],
    arco5: ["Caos absoluto. Por fin un ambiente laboral honesto."],
    partidaBuena: ["Esa productividad merece un bono. Que no lo pague Santa, porque no llega."],
    partidaMala: ["Tranqui, el sindicato no evalúa resultados. Evalúa actitud. Y llegaste."],
    sinEquipo: ["Aún no tienes equipo. El organizador los arma pronto: afíliate al nuestro en espíritu."],
    pendiente: ["Tu ficha de afiliación está pendiente. El organizador te aprueba y ya eres de los nuestros."],
  },
  muneco: {
    general: [
      "…",
      "Yo no estaba aquí. Tú tampoco.",
      "Alguien movió los regalos de lugar. No miren al que no tiene brazos.",
      "Me derrito por dentro. Literal y emocionalmente.",
      "Vi cosas en el bosque que no puedo contar. Bueno, puedo, pero cobro.",
    ],
    arco4: ["Nadie es inocente. Algunos son de nieve."],
    arco5: ["El caos me sienta bien. Es lo más cálido que he sentido."],
    partidaBuena: ["Impresionante. Lo voy a olvidar en cuanto salga el sol."],
    partidaMala: ["Tranquilo. Yo pierdo partes del cuerpo todos los días y sigo aquí."],
  },
  auditor: {
    general: [
      "Revisé tu desempeño. Mi informe tiene 40 páginas y todas dicen 'mejorable'.",
      "Encontré 40 regalos sin justificar. Y una factura de Rudolf por 'masajes de nariz'.",
      "La puntualidad del trineo es de 12%. Y eso porque redondeé hacia arriba.",
      "No vengo a juzgar. Vengo a documentar para que otros juzguen.",
    ],
    arco1: ["Primera observación: nadie leyó el reglamento. Segunda observación: yo tampoco lo firmaría."],
    arco6: ["Se acerca el juicio final. Traigan sus recibos."],
    partidaBuena: ["Resultado aceptable. Queda registrado como 'sospechosamente competente'."],
    partidaMala: ["Puntaje registrado. Lo pondré en el anexo B, el de los casos perdidos."],
  },
};

/** Elige una frase del contexto (o una general) de forma estable para un día dado. */
export function fraseDe(npc: NpcId, contexto: Contexto, semilla: number): string {
  const cat = FRASES[npc];
  const lista = cat[contexto]?.length ? cat[contexto]! : cat.general ?? ["…"];
  const azar = crearAzar(semilla);
  return lista[Math.floor(azar() * lista.length)];
}

/** Contexto por día de temporada (1..30); 0 = pretemporada. */
export function contextoDelDia(dia: number): Contexto {
  if (dia < 1) return "pretemporada";
  return (["arco1", "arco2", "arco3", "arco4", "arco5", "arco6"] as const)[Math.min(5, Math.floor((dia - 1) / 5))];
}
