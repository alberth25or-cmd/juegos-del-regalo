/**
 * Convierte el estado real del servidor (EstadoCasas) al formato que dibujan la aldea, la barra
 * y el riel (los mismos tipos que la vista de ejemplo).
 */
import type { EstadoCasas } from "@/lib/server/casas";
import type { Agente, EstadoCasa, Stage } from "./datosEjemplo";

const est = (porDia: number, hechas: number): EstadoCasa => (hechas >= porDia ? "aldia" : "nuevas");

export function agentesReales(e: EstadoCasas): Agente[] {
  return e.ranking.map((r) => ({
    alias: r.alias,
    avatar: r.avatar as Agente["avatar"],
    monedas: r.monedas,
    yo: r.yo,
    hoy: [2, 3, 4].filter((c) => e.alDia[c]?.includes(r.alias)).concat(r.yo && e.calentamiento.hechos.length >= 3 ? [1] : []),
  }));
}

export function casasReales(e: EstadoCasas): Stage[] {
  const manadaHecha = e.manada?.estado ? 1 : 0;
  const amorHechas = e.amor.filter((p) => p.estado).length;
  const picHechas = e.picante.filter((p) => p.estado).length;
  const juegos = e.calentamiento.hechos;
  const picante: Stage =
    e.yo.juegaPicante === false
      ? { n: 4, nombre: "Picante", corto: "Picante", icono: "chili", papel: "rojo", descripcion: "Elegiste no jugar Picante: aquí no ganas ni pierdes monedas.", estado: "aldia", porDia: 0, hechasHoy: 0, unidad: "pregunta" }
      : {
          n: 4, nombre: "Picante", corto: "Picante", icono: "chili", papel: "rojo",
          descripcion: e.yo.juegaPicante === null ? "Preguntas de solo sí o no, para mayores de edad. Al entrar decides si juegas." : "Preguntas nuevas cada día, solo sí o no.",
          estado: e.yo.juegaPicante === null ? "nuevas" : est(2, picHechas), porDia: 2, hechasHoy: picHechas, unidad: "pregunta", pasesUsados: e.pases[4],
          accion: { texto: e.yo.juegaPicante === null ? "Entrar a Picante" : "Responder las de hoy", href: "/diseno/picante" },
        };
  return [
    {
      n: 1, nombre: "Calentamiento", corto: "Calentar", icono: "mission", papel: "verde",
      descripcion: "Minijuegos para entrar en calor: tu mejor partida del día da monedas.",
      estado: est(3, juegos.length), porDia: 3, hechasHoy: juegos.length, unidad: "reto",
      juegos: [
        { nombre: "Gift Catcher", href: "/arcade/gift-catcher", icono: "chest", disponible: true, hechoHoy: juegos.includes("gift-catcher") },
        { nombre: "Memory Gifts", href: "/arcade/memory", icono: "sparkle", disponible: true, hechoHoy: juegos.includes("memory") },
        { nombre: "Trivia del día", href: "/arena/trivia", icono: "ranking", disponible: true, hechoHoy: juegos.includes("trivia") },
      ],
    },
    {
      n: 2, nombre: "La manada", corto: "Manada", icono: "sheep", papel: "rojo",
      descripcion: "Adivina lo que piensa la mayoría. Si coincides, mañana te llegan +15.",
      estado: est(1, manadaHecha), porDia: 1, hechasHoy: manadaHecha, unidad: "pregunta",
      accion: { texto: "Responder la de hoy", href: "/diseno/manada" },
    },
    {
      n: 3, nombre: "Amor y relaciones", corto: "Amor", icono: "heart", papel: "morado",
      descripcion: "Preguntas de respuesta corta. Puedes pasar, pero cuesta monedas y los pases son pocos.",
      estado: est(2, amorHechas), porDia: 2, hechasHoy: amorHechas, unidad: "pregunta", pasesUsados: e.pases[3],
      accion: { texto: "Responder las de hoy", href: "/diseno/amor" },
    },
    picante,
    {
      n: 5, nombre: "Juicio final", corto: "Juicio", icono: "star", papel: "azul",
      descripcion: e.fichaAbierta ? "¡Veredicto final! Mira los premios de la temporada." : "Un caso absurdo por día: ¿culpable o inocente? Si coincides con el jurado, mañana te llegan +15.",
      estado: est(1, e.juicio?.estado ? 1 : 0), porDia: 1, hechasHoy: e.juicio?.estado ? 1 : 0, unidad: "reto",
      accion: { texto: "Dar mi veredicto", href: "/diseno/juicio" },
    },
    e.yo.tieneAmigo
      ? {
          n: 6, nombre: "Tu amigo secreto", corto: "Ficha", icono: "chest", papel: "verde",
          descripcion: e.fichaAbierta ? "¡La ficha final está abierta! Mira lo más picante de tu amigo secreto." : "Su ficha se llena a medida que responde. 1 sobre gratis por día; los demás cuestan monedas.",
          estado: "aldia", porDia: 0, hechasHoy: 0, unidad: "pregunta",
          accion: { texto: "Ver su ficha", href: "/diseno/amigo-secreto" },
        }
      : { n: 6, nombre: "Tu amigo secreto", corto: "Ficha", icono: "chest", papel: "verde", descripcion: "No entraste al sorteo (tu ficha no estaba lista al empezar).", estado: "cerrada", porDia: 0, hechasHoy: 0, unidad: "pregunta", abre: "Sin sorteo" },
  ];
}
