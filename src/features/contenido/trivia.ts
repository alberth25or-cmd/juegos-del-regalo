/**
 * Catálogo revisado de la trivia «Juicio del Polo Norte».
 * Solo preguntas con UNA respuesta correcta verificable (cultura navideña, cultura
 * general ligera y datos de Snowville). Las de humor/personalidad van a votaciones.
 * `ok` = índice de la opción correcta. Ids estables.
 */
export interface PreguntaTrivia {
  id: string;
  texto: string;
  opciones: [string, string, string, string];
  ok: 0 | 1 | 2 | 3;
}

export const PREGUNTAS_TRIVIA: PreguntaTrivia[] = [
  { id: "t01", texto: "¿Cuántos renos tiene Santa en el poema clásico, sin contar a Rudolf?", opciones: ["6", "8", "10", "12"], ok: 1 },
  { id: "t02", texto: "¿De qué ciudad italiana es originario el panetón?", opciones: ["Roma", "Nápoles", "Milán", "Venecia"], ok: 2 },
  { id: "t03", texto: "¿En qué océano está el Polo Norte?", opciones: ["Antártico", "Ártico", "Pacífico", "Índico"], ok: 1 },
  { id: "t04", texto: "¿Cuál de estos animales vive en el Ártico?", opciones: ["Pingüino", "Canguro", "Oso polar", "Koala"], ok: 2 },
  { id: "t05", texto: "¿Cuántas puntas tiene un copo de nieve típico?", opciones: ["4", "5", "6", "8"], ok: 2 },
  { id: "t06", texto: "¿Qué santo inspiró la figura de Santa Claus?", opciones: ["San Nicolás", "San Martín", "San Jorge", "San Valentín"], ok: 0 },
  { id: "t07", texto: "¿En qué idioma se escribió originalmente «Noche de paz»?", opciones: ["Inglés", "Latín", "Italiano", "Alemán"], ok: 3 },
  { id: "t08", texto: "La flor de Pascua (poinsettia) es originaria de…", opciones: ["México", "España", "China", "Egipto"], ok: 0 },
  { id: "t09", texto: "¿Bajo qué planta es tradición darse un beso en Navidad?", opciones: ["Laurel", "Muérdago", "Romero", "Hiedra"], ok: 1 },
  { id: "t10", texto: "¿Qué se celebra el 28 de diciembre con bromas en los países hispanos?", opciones: ["Año Nuevo", "Reyes", "Santos Inocentes", "Nochebuena"], ok: 2 },
  { id: "t11", texto: "¿Cuántas uvas se comen con las campanadas de Año Nuevo en España?", opciones: ["7", "10", "12", "15"], ok: 2 },
  { id: "t12", texto: "¿Quién compuso «El Cascanueces»?", opciones: ["Mozart", "Chaikovski", "Beethoven", "Vivaldi"], ok: 1 },
  { id: "t13", texto: "¿Qué personaje de cuento «se robó la Navidad»?", opciones: ["El Grinch", "Scrooge", "Krampus", "El Coco"], ok: 0 },
  { id: "t14", texto: "¿En qué región de Finlandia se dice que vive Papá Noel?", opciones: ["Laponia", "Carelia", "Helsinki", "Åland"], ok: 0 },
  { id: "t15", texto: "¿Qué día se celebra la Bajada de Reyes?", opciones: ["24 de diciembre", "31 de diciembre", "1 de enero", "6 de enero"], ok: 3 },
  { id: "t16", texto: "En el hemisferio sur, la Navidad cae en…", opciones: ["Verano", "Otoño", "Invierno", "Primavera"], ok: 0 },
  { id: "t17", texto: "¿Con qué bebida se acompaña el panetón en la chocolatada peruana?", opciones: ["Café", "Chocolate caliente", "Té verde", "Chicha morada"], ok: 1 },
  { id: "t18", texto: "¿A cuántos grados Celsius se congela el agua?", opciones: ["-10", "0", "4", "10"], ok: 1 },
  { id: "t19", texto: "¿Qué se pone tradicionalmente en la punta del árbol?", opciones: ["Una estrella", "Un calcetín", "Una campana", "Un reno"], ok: 0 },
  { id: "t20", texto: "¿Qué instrumento suena en «Jingle Bells»?", opciones: ["Tambores", "Cascabeles", "Violines", "Gaitas"], ok: 1 },
  { id: "t21", texto: "¿Cuál es el planeta más grande del sistema solar?", opciones: ["Saturno", "Neptuno", "Júpiter", "Tierra"], ok: 2 },
  { id: "t22", texto: "¿Cuántos minutos tiene un día?", opciones: ["1240", "1440", "1600", "2400"], ok: 1 },
  { id: "t23", texto: "¿Qué fruta seca es típica del panetón?", opciones: ["Pasas", "Nueces de Brasil", "Dátiles", "Ciruelas"], ok: 0 },
  { id: "t24", texto: "¿Cuál es la capital de Finlandia?", opciones: ["Oslo", "Estocolmo", "Helsinki", "Copenhague"], ok: 2 },
  { id: "t25", texto: "¿En qué año llegó el ser humano a la Luna?", opciones: ["1959", "1969", "1979", "1989"], ok: 1 },
  { id: "t26", texto: "¿De qué color es la nariz de Rudolf?", opciones: ["Azul", "Dorada", "Roja", "Verde"], ok: 2 },
  { id: "t27", texto: "¿En qué país empezó la tradición del árbol de Navidad decorado?", opciones: ["Alemania", "Francia", "Inglaterra", "Perú"], ok: 0 },
  { id: "t28", texto: "¿Cuántos días son «los doce días de Navidad»?", opciones: ["7", "10", "12", "24"], ok: 2 },
  { id: "t29", texto: "En Snowville, ¿quién es el Secretario General del Sindicato de duendes?", opciones: ["Rudolf", "Pepe", "El Auditor", "Santa"], ok: 1 },
  { id: "t30", texto: "En Snowville, ¿quién revisa las cuentas del Polo Norte?", opciones: ["El Muñeco", "Pepe", "El Auditor", "Rudolf"], ok: 2 },
  { id: "t31", texto: "En Snowville, ¿en qué situación está la fábrica de Santa?", opciones: ["Récord de ventas", "En bancarrota", "Recién inaugurada", "Cerrada por vacaciones"], ok: 1 },
  { id: "t32", texto: "En Snowville, ¿qué cargo dice tener Rudolf?", opciones: ["Gerente General", "Líder de Proyecto Autoproclamado", "Auditor", "Jefe de cocina"], ok: 1 },
  { id: "t33", texto: "En Gift Catcher, ¿qué conviene ESQUIVAR?", opciones: ["Regalos", "Regalos dorados", "Facturas", "Todo lo que brilla"], ok: 2 },
  { id: "t34", texto: "En Snowville, ¿cuál es el cargo del Muñeco de Nieve?", opciones: ["Desconocido", "Tesorero", "Cartero", "Guardia"], ok: 0 },
  { id: "t35", texto: "¿Cuántas patas tiene un reno?", opciones: ["2", "4", "6", "Depende del presupuesto"], ok: 1 },
  { id: "t36", texto: "¿Qué hacen los osos polares en invierno, a diferencia de otros osos?", opciones: ["Siguen cazando (solo las madres hibernan)", "Migran al sur", "Duermen 6 meses todos", "Viven en cuevas de hielo con Santa"], ok: 0 },
  { id: "t37", texto: "¿Qué país regala cada año un gran árbol de Navidad a Londres (Trafalgar Square)?", opciones: ["Suecia", "Noruega", "Canadá", "Islandia"], ok: 1 },
  { id: "t38", texto: "¿Cuál de estos NO es un reno de Santa en el poema?", opciones: ["Cometa", "Bailarín", "Relámpago", "Pancho"], ok: 3 },
];

/** Comentario del Auditor según aciertos sobre el total. */
export function veredicto(aciertos: number, total: number) {
  const r = total ? aciertos / total : 0;
  if (r === 1) return "Perfecto. Sospechosamente perfecto. Abriré una investigación por excelencia.";
  if (r >= 0.75) return "Aprobado con honores. Santa podría ascenderte… si tuviera presupuesto.";
  if (r >= 0.5) return "Aprobado. Raspando, como la contabilidad de la fábrica.";
  if (r >= 0.25) return "El tribunal te declara culpable de no saber. Puedes apelar mañana.";
  return "Te salvó que nadie revisa estos formularios. Excepto yo.";
}
