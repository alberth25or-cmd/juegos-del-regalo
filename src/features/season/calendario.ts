/**
 * Calendario de la temporada (30 días, hora de Lima). Puro: recibe fechas, no lee el reloj.
 */

export const ZONA_HORARIA = "America/Lima";
/** Lima no tiene horario de verano: siempre UTC−5. */
const OFFSET_LIMA_MIN = -5 * 60;

/** Fecha local de Lima ("YYYY-MM-DD") para un instante. */
export function diaLocal(instante: Date) {
  const lima = new Date(instante.getTime() + OFFSET_LIMA_MIN * 60_000);
  return lima.toISOString().slice(0, 10);
}

/** Instante UTC de las 00:00 de Lima de una fecha "YYYY-MM-DD". */
export function inicioDelDia(fecha: string) {
  return new Date(Date.parse(`${fecha}T00:00:00Z`) - OFFSET_LIMA_MIN * 60_000);
}

export type EstadoTemporada =
  | { fase: "pretemporada"; faltanDias: number; dia: 0 }
  | { fase: "en-curso"; dia: number; totalDias: number }
  | { fase: "terminada"; dia: number; totalDias: number };

/** Día de temporada (1..N) según la fecha local de Lima. */
export function estadoTemporada(ahora: Date, inicio: Date, fin: Date): EstadoTemporada {
  const hoy = Date.parse(`${diaLocal(ahora)}T00:00:00Z`);
  const d0 = Date.parse(`${diaLocal(inicio)}T00:00:00Z`);
  const d1 = Date.parse(`${diaLocal(fin)}T00:00:00Z`);
  const totalDias = Math.round((d1 - d0) / 86_400_000) + 1;
  const dia = Math.round((hoy - d0) / 86_400_000) + 1;
  if (dia < 1) return { fase: "pretemporada", faltanDias: 1 - dia, dia: 0 };
  if (dia > totalDias || ahora >= fin) return { fase: "terminada", dia: totalDias, totalDias };
  return { fase: "en-curso", dia, totalDias };
}

/**
 * Estado con TEMPORADA DE PRUEBA: el organizador puede simular cualquier día para
 * probar los 30 días en una tarde. En prueba nunca hay pretemporada (todo cuenta ya).
 */
export function estadoConPrueba(ahora: Date, inicio: Date, fin: Date, prueba: boolean, diaSimulado: number | null): EstadoTemporada {
  const real = estadoTemporada(ahora, inicio, fin);
  if (!prueba) return real;
  const totalDias = Math.round((Date.parse(`${diaLocal(fin)}T00:00:00Z`) - Date.parse(`${diaLocal(inicio)}T00:00:00Z`)) / 86_400_000) + 1;
  const dia = diaSimulado ?? (real.fase === "en-curso" ? real.dia : 1);
  return { fase: "en-curso", dia: Math.max(1, Math.min(totalDias, Math.round(dia))), totalDias };
}

export interface Arco {
  desde: number;
  hasta: number;
  titulo: string;
  resumen: string;
}

export const ARCOS: Arco[] = [
  { desde: 1, hasta: 5, titulo: "El inicio del desastre", resumen: "Avatares, equipos y las primeras misiones de una fábrica en quiebra." },
  { desde: 6, hasta: 10, titulo: "Se rompe la amistad", resumen: "Votaciones, confesiones y las primeras batallas de roast." },
  { desde: 11, hasta: 15, titulo: "La guerra del Polo Norte", resumen: "Los equipos cooperan… y compiten sin piedad." },
  { desde: 16, hasta: 20, titulo: "Nadie es inocente", resumen: "Misiones globales, memes y sabotajes controlados." },
  { desde: 21, hasta: 25, titulo: "Caos absoluto", resumen: "Eventos especiales, desafíos contra el reloj y remontadas." },
  { desde: 26, hasta: 30, titulo: "El juicio final", resumen: "Últimos retos, cierre de rankings, ceremonia y premios." },
];

export function arcoDelDia(dia: number): Arco {
  return ARCOS.find((a) => dia >= a.desde && dia <= a.hasta) ?? (dia < 1 ? ARCOS[0] : ARCOS[ARCOS.length - 1]);
}

/** Eventos destacados por defecto (editables desde el panel). */
export const EVENTOS_POR_DEFECTO: { day: number; title: string; description: string; kind: string }[] = [
  { day: 1, title: "Apertura de Snowville", description: "Santa inaugura la temporada con un discurso que nadie pidió. Se abren los equipos y Gift Catcher.", kind: "evento" },
  { day: 5, title: "Primera auditoría", description: "El Auditor del Polo Norte revisa el desempeño de cada equipo. Spoiler: nadie sale bien.", kind: "evento" },
  { day: 10, title: "Noche de roast", description: "Primera batalla de roast voluntaria y votación del grupo.", kind: "social" },
  { day: 15, title: "Guerra de equipos", description: "Reto por equipos con puntaje promedio. Gana el equipo, no el que más juega.", kind: "equipos" },
  { day: 20, title: "Caza al saboteador", description: "Alguien recibió una misión secreta. Descubran quién fue.", kind: "traicion" },
  { day: 25, title: "Día de doble caos", description: "Todos los puntos del día valen doble. Última oportunidad de remontar.", kind: "evento" },
  { day: 30, title: "El juicio final", description: "Ceremonia de premios y revelación del amigo secreto.", kind: "final" },
];
