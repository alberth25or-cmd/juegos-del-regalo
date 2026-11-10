/**
 * Bancos de preguntas de las casas (revisados a mano; nada se genera al vuelo).
 * - Cada pregunta tiene un id fijo: NO cambies ids de preguntas ya publicadas (las respuestas
 *   guardadas apuntan a ellos). Para corregir una, edita el texto; para quitarla, déjala y
 *   agrega otra al final.
 * - `picor` (1 suave · 2 medio · 3 picante) decide "lo más picante" de la ficha final.
 * - Regla del proyecto: nada sobre características protegidas, salud, tragedias, apariencia,
 *   pobreza o secretos ajenos. Las preguntas son sobre uno mismo y todas tienen "Paso"
 *   (Amor y Picante) o son de opinión (La manada). Picante se puede rechazar al entrar.
 */

export interface PreguntaManada {
  id: string;
  texto: string;
  opciones: [string, string, string, string];
}

export interface PreguntaAbierta {
  id: string;
  texto: string;
  picor: 1 | 2 | 3;
}

/** La manada: adivina lo que eligió la mayoría (1 por día). */
export const PREGUNTAS_MANADA: PreguntaManada[] = [
  { id: "m01", texto: "¿Qué es lo primero que se acaba en una fiesta navideña?", opciones: ["El panetón", "El chocolate caliente", "La paciencia", "El hielo"] },
  { id: "m02", texto: "¿Cuál es el peor regalo de todos?", opciones: ["Medias", "Un perfume barato", "Una taza con frase", "Nada"] },
  { id: "m03", texto: "¿Quién se duerme primero en Navidad?", opciones: ["El abuelo", "El tío que tomó", "Los niños", "Nadie: todos aguantan"] },
  { id: "m04", texto: "¿Qué panetón gana?", opciones: ["D'Onofrio", "Todinno", "Gloria", "El de la panadería del barrio"] },
  { id: "m05", texto: "¿A qué hora se abre de verdad el regalo?", opciones: ["A las 12 en punto", "A las 12:30", "Al día siguiente", "Apenas llega"] },
  { id: "m06", texto: "¿Qué no puede faltar en la cena navideña?", opciones: ["Pavo", "Lechón", "Puré de manzana", "Arroz árabe"] },
  { id: "m07", texto: "¿Qué hace el grupo cuando alguien llega tarde?", opciones: ["Lo espera", "Empieza sin él", "Le cobra una ronda", "Ni se da cuenta"] },
  { id: "m08", texto: "¿Cuál es la peor canción navideña?", opciones: ["Mi burrito sabanero", "Feliz Navidad", "Los peces en el río", "Jingle Bells"] },
  { id: "m09", texto: "¿Qué excusa usa más el grupo para no salir?", opciones: ["Estoy cansado", "No tengo plata", "Mañana trabajo", "Ya estoy en pijama"] },
  { id: "m10", texto: "¿Qué es lo más difícil de regalar?", opciones: ["Ropa", "Perfume", "Libros", "Algo tecnológico"] },
  { id: "m11", texto: "¿Dónde termina siempre la reunión?", opciones: ["En la cocina", "En la puerta despidiéndose", "En el sofá", "En otra casa"] },
  { id: "m12", texto: "¿Qué hace la mayoría con un regalo que no le gusta?", opciones: ["Lo guarda", "Lo vuelve a regalar", "Lo cambia", "Lo usa por compromiso"] },
  { id: "m13", texto: "¿Qué bebida manda en diciembre?", opciones: ["Chocolate caliente", "Cerveza", "Champán", "Gaseosa"] },
  { id: "m14", texto: "¿Quién organiza siempre todo en el grupo?", opciones: ["El de siempre", "Nadie, sale solo", "El que tiene casa grande", "El más ansioso"] },
  { id: "m15", texto: "¿Qué decoración es imprescindible?", opciones: ["El árbol", "El nacimiento", "Las luces", "Ninguna"] },
  { id: "m16", texto: "¿Qué se le olvida a todo el mundo en Navidad?", opciones: ["Envolver el regalo", "Comprar hielo", "Las pilas", "El presupuesto"] },
  { id: "m17", texto: "¿Qué mensaje llega más en Nochebuena?", opciones: ["Un sticker", "Una cadena", "Un audio largo", "Un \"Feliz Navidad\" seco"] },
  { id: "m18", texto: "¿Qué tradición sobra?", opciones: ["Los fuegos artificiales", "El amigo secreto", "La foto grupal", "Ninguna"] },
  { id: "m19", texto: "¿Cuál es el mejor momento de la fiesta?", opciones: ["La comida", "Los regalos", "El chisme", "El after"] },
  { id: "m20", texto: "¿Cuánto debería costar un buen regalo de amigo secreto?", opciones: ["S/ 20", "S/ 40", "S/ 80", "Lo que sea, es la intención"] },
  { id: "m21", texto: "¿Qué preferiría el grupo: viajar o regalar?", opciones: ["Viajar juntos", "Regalos", "Una buena cena", "Quedarse en casa"] },
  { id: "m22", texto: "¿Cuál es el peor momento del amigo secreto?", opciones: ["Adivinar", "Recibir algo feo", "Tener que hablar", "Que alguien no traiga regalo"] },
  { id: "m23", texto: "¿Qué hace el grupo en una foto grupal?", opciones: ["Sale bien a la tercera", "Alguien sale con ojos cerrados", "Nadie quiere salir", "Se toman 50"] },
  { id: "m24", texto: "¿Qué comida sobra siempre?", opciones: ["Ensalada", "Pavo", "Panetón", "Nada sobra"] },
  { id: "m25", texto: "¿A qué le tiene más miedo el grupo en diciembre?", opciones: ["A la tarjeta de crédito", "A la balanza", "A las reuniones familiares", "Al tráfico"] },
  { id: "m26", texto: "¿Qué superpoder elegiría la mayoría?", opciones: ["Volar", "Ser invisible", "Leer mentes", "Teletransportarse"] },
  { id: "m27", texto: "¿Qué emoji usa más el grupo?", opciones: ["😂", "❤️", "🙄", "👍"] },
  { id: "m28", texto: "¿Qué es lo primero que se hace el 1 de enero?", opciones: ["Dormir", "Comer recalentado", "Prometer cosas", "Revisar el celular"] },
  { id: "m29", texto: "¿Qué propósito de año nuevo dura menos?", opciones: ["Ir al gimnasio", "Ahorrar", "Dejar el celular", "Comer sano"] },
  { id: "m30", texto: "¿Qué haría el grupo con S/ 1 000 extra?", opciones: ["Viajar", "Pagar deudas", "Una fiesta", "Ahorrar"] },
];

/** Amor y relaciones: respuesta corta (2 por día). */
export const PREGUNTAS_AMOR: PreguntaAbierta[] = [
  { id: "a01", texto: "¿Cuántas parejas has tenido?", picor: 2 },
  { id: "a02", texto: "¿Cuántas veces viste esta semana al amor de tu vida?", picor: 2 },
  { id: "a03", texto: "¿Cuántos años tenías en tu primer beso?", picor: 2 },
  { id: "a04", texto: "¿Dónde fue tu primera cita?", picor: 1 },
  { id: "a05", texto: "¿Cuánto duró tu relación más larga?", picor: 1 },
  { id: "a06", texto: "¿Cuánto duró tu relación más corta?", picor: 2 },
  { id: "a07", texto: "¿Qué es lo primero que te fijas en alguien?", picor: 1 },
  { id: "a08", texto: "¿Cuál fue la peor excusa que te dieron para terminar?", picor: 2 },
  { id: "a09", texto: "¿Cuál es tu red flag favorita (la que igual ignoras)?", picor: 2 },
  { id: "a10", texto: "¿En qué app o lugar conociste a tu último crush?", picor: 2 },
  { id: "a11", texto: "¿Cuántas veces te enamoraste de verdad?", picor: 2 },
  { id: "a12", texto: "¿Qué canción te recuerda a alguien que no deberías extrañar?", picor: 2 },
  { id: "a13", texto: "¿Cuál es tu plan ideal para una primera cita?", picor: 1 },
  { id: "a14", texto: "¿Cuánto tiempo esperas para contestar un mensaje de alguien que te gusta?", picor: 1 },
  { id: "a15", texto: "¿Con cuántos ex sigues hablando?", picor: 2 },
  { id: "a16", texto: "¿Qué es lo más cursi que has hecho por amor?", picor: 2 },
  { id: "a17", texto: "¿Cuántas citas son demasiadas antes de ser algo?", picor: 1 },
  { id: "a18", texto: "¿Cuál fue tu primer amor platónico?", picor: 1 },
  { id: "a19", texto: "¿Qué apodo cariñoso odias?", picor: 1 },
  { id: "a20", texto: "¿Cuántos mensajes seguidos has mandado sin respuesta?", picor: 2 },
  { id: "a21", texto: "¿Cuál es la cita más rara que has tenido (en 3 palabras)?", picor: 2 },
  { id: "a22", texto: "¿Qué harías si tu ex aparece en el amigo secreto?", picor: 2 },
  { id: "a23", texto: "¿A qué edad te gustaría casarte (o no)?", picor: 1 },
  { id: "a24", texto: "¿Cuántas veces te han dejado en visto esta semana?", picor: 1 },
  { id: "a25", texto: "¿Qué es lo más lejos que has viajado por alguien?", picor: 2 },
  { id: "a26", texto: "¿Cuál es tu tipo en 3 palabras?", picor: 2 },
  { id: "a27", texto: "¿Qué detalle te enamora más?", picor: 1 },
  { id: "a28", texto: "¿Cuántas veces has vuelto con la misma persona?", picor: 3 },
  { id: "a29", texto: "¿Qué es lo que más extrañas de tu última relación?", picor: 3 },
  { id: "a30", texto: "¿Cuántas personas te gustaron este año?", picor: 3 },
  { id: "a31", texto: "¿Qué celebridad es tu pase libre?", picor: 2 },
  { id: "a32", texto: "¿Cuál fue tu peor beso (dónde o cuándo)?", picor: 3 },
  { id: "a33", texto: "¿Cuántas veces revisas las historias de tu crush al día?", picor: 3 },
  { id: "a34", texto: "¿Qué mentira piadosa dijiste en una cita?", picor: 3 },
  { id: "a35", texto: "¿Qué serie o película te hizo llorar por amor?", picor: 1 },
  { id: "a36", texto: "¿Cuál es tu idea de una relación perfecta en 3 palabras?", picor: 1 },
  { id: "a37", texto: "¿Cuántos días tardaste en superar tu última ruptura?", picor: 3 },
  { id: "a38", texto: "¿Qué es lo más atrevido que has hecho para conquistar a alguien?", picor: 3 },
  { id: "a39", texto: "¿Con qué personaje de ficción saldrías?", picor: 1 },
  { id: "a40", texto: "¿Qué le dirías hoy a tu primer amor (en pocas palabras)?", picor: 3 },
  { id: "a41", texto: "¿Cuántas veces dijiste \"te amo\" sin sentirlo?", picor: 3 },
  { id: "a42", texto: "¿Qué hábito de una pareja no soportarías?", picor: 1 },
  { id: "a43", texto: "¿Cuántas declaraciones de amor has hecho?", picor: 2 },
  { id: "a44", texto: "¿Cuántas has recibido?", picor: 2 },
  { id: "a45", texto: "¿Cuál fue el regalo más romántico que te hicieron?", picor: 1 },
  { id: "a46", texto: "¿Qué emoji mandas cuando alguien te gusta?", picor: 1 },
  { id: "a47", texto: "¿Cuánto tiempo stalkeaste a alguien antes de hablarle?", picor: 3 },
  { id: "a48", texto: "¿Qué es lo primero que haces después de una ruptura?", picor: 2 },
  { id: "a49", texto: "¿En qué lugar del mundo te gustaría que te propongan algo?", picor: 1 },
  { id: "a50", texto: "¿Cuál es tu frase para coquetear (si tienes)?", picor: 2 },
];

/** Picante: solo sí o no (2 por día). Para mayores de edad; se puede rechazar la casa. */
export const PREGUNTAS_PICANTE: PreguntaAbierta[] = [
  { id: "p01", texto: "¿Le has escrito a tu ex este año?", picor: 3 },
  { id: "p02", texto: "¿Tuviste una cita esta semana?", picor: 2 },
  { id: "p03", texto: "¿Has stalkeado a alguien de este grupo?", picor: 3 },
  { id: "p04", texto: "¿Has besado a alguien que conociste esa misma noche?", picor: 3 },
  { id: "p05", texto: "¿Te ha gustado alguien de este grupo?", picor: 3 },
  { id: "p06", texto: "¿Has terminado con alguien por mensaje?", picor: 2 },
  { id: "p07", texto: "¿Has tenido una relación a escondidas?", picor: 3 },
  { id: "p08", texto: "¿Has ido a una cita a ciegas?", picor: 1 },
  { id: "p09", texto: "¿Has dado like a una foto vieja de alguien por accidente?", picor: 2 },
  { id: "p10", texto: "¿Has fingido estar ocupado para no ver a alguien que te escribía?", picor: 2 },
  { id: "p11", texto: "¿Tienes una conversación archivada que no te atreves a borrar?", picor: 3 },
  { id: "p12", texto: "¿Has vuelto con un ex?", picor: 2 },
  { id: "p13", texto: "¿Te has enamorado de alguien que tenía pareja?", picor: 3 },
  { id: "p14", texto: "¿Has usado una app de citas este año?", picor: 2 },
  { id: "p15", texto: "¿Has mandado un mensaje a la persona equivocada?", picor: 2 },
  { id: "p16", texto: "¿Has besado a alguien en una fiesta de fin de año?", picor: 2 },
  { id: "p17", texto: "¿Has tenido un crush en el trabajo o en clases?", picor: 2 },
  { id: "p18", texto: "¿Has mentido sobre tu edad para gustarle a alguien?", picor: 2 },
  { id: "p19", texto: "¿Has borrado fotos con un ex de tus redes?", picor: 1 },
  { id: "p20", texto: "¿Te gustaría que tu amigo secreto fuera tu crush?", picor: 3 },
  { id: "p21", texto: "¿Has ghosteado a alguien?", picor: 2 },
  { id: "p22", texto: "¿Te han ghosteado?", picor: 1 },
  { id: "p23", texto: "¿Has tenido dos crushes al mismo tiempo?", picor: 3 },
  { id: "p24", texto: "¿Has llorado por alguien este año?", picor: 2 },
  { id: "p25", texto: "¿Has revisado el celular de una pareja?", picor: 3 },
  { id: "p26", texto: "¿Has coqueteado para conseguir algo (un descuento, un favor)?", picor: 2 },
  { id: "p27", texto: "¿Le has escrito a alguien a las 3 a. m. y te arrepentiste?", picor: 3 },
  { id: "p28", texto: "¿Has tenido un amor de verano?", picor: 1 },
  { id: "p29", texto: "¿Has dicho \"ya llegué\" estando todavía en camino a una cita?", picor: 1 },
  { id: "p30", texto: "¿Has inventado una excusa para salir antes de una cita?", picor: 2 },
  { id: "p31", texto: "¿Te ha gustado el ex de un amigo o amiga?", picor: 3 },
  { id: "p32", texto: "¿Has dormido en casa de alguien en la primera cita?", picor: 3 },
  { id: "p33", texto: "¿Has tenido una relación a distancia?", picor: 1 },
  { id: "p34", texto: "¿Has pedido consejos de amor a alguien de este grupo?", picor: 1 },
  { id: "p35", texto: "¿Te has puesto celoso o celosa de alguien de este grupo?", picor: 3 },
  { id: "p36", texto: "¿Has hecho match con alguien conocido en una app?", picor: 2 },
  { id: "p37", texto: "¿Has escrito un poema o carta de amor?", picor: 1 },
  { id: "p38", texto: "¿Has besado a alguien en un lugar público y te descubrieron?", picor: 3 },
  { id: "p39", texto: "¿Has tenido un \"casi algo\" que te dolió más que una relación?", picor: 3 },
  { id: "p40", texto: "¿Has fingido que no viste un mensaje para no responder?", picor: 1 },
  { id: "p41", texto: "¿Volverías con tu último ex si te escribe hoy?", picor: 3 },
  { id: "p42", texto: "¿Has tenido una cita con dos personas en el mismo día?", picor: 3 },
  { id: "p43", texto: "¿Has mentido en este juego?", picor: 2 },
  { id: "p44", texto: "¿Te has declarado y te dijeron que no?", picor: 2 },
  { id: "p45", texto: "¿Has tenido un crush con alguien mucho mayor o menor que tú?", picor: 2 },
  { id: "p46", texto: "¿Has hecho algo atrevido en una fiesta que nadie del grupo sabe?", picor: 3 },
  { id: "p47", texto: "¿Has guardado un regalo de un ex?", picor: 1 },
  { id: "p48", texto: "¿Has tenido que esconderte de alguien en la calle?", picor: 2 },
  { id: "p49", texto: "¿Has besado a alguien de este grupo?", picor: 3 },
  { id: "p50", texto: "¿Le confesarías a tu amigo secreto un secreto el 24?", picor: 2 },
];

/** Juicio final: un caso absurdo por día. ¿Culpable o inocente? Gana quien coincide con el jurado. */
export const CASOS_JUICIO: { id: string; texto: string }[] = [
  { id: "j01", texto: "Alguien se comió el último panetón y le echó la culpa al perro." },
  { id: "j02", texto: "El tío regaló el mismo perfume que le regalaron el año pasado." },
  { id: "j03", texto: "Un invitado llegó a la cena justo cuando ya habían servido." },
  { id: "j04", texto: "Alguien abrió su regalo antes de las 12 \"para ver si era el suyo\"." },
  { id: "j05", texto: "El organizador del amigo secreto se puso el presupuesto más alto para él." },
  { id: "j06", texto: "Alguien desconectó las luces del árbol para cargar su celular." },
  { id: "j07", texto: "Un primo se llevó táper con comida de la cena sin preguntar." },
  { id: "j08", texto: "Alguien respondió \"feliz Navidad\" con un sticker a un audio de 3 minutos." },
  { id: "j09", texto: "El que puso la música solo puso reguetón en Nochebuena." },
  { id: "j10", texto: "Alguien dijo que no comería pavo y repitió dos veces." },
  { id: "j11", texto: "Un invitado se quedó dormido en el sofá antes de los regalos." },
  { id: "j12", texto: "Alguien envolvió el regalo con papel de periódico \"por el planeta\"." },
  { id: "j13", texto: "El encargado del hielo llegó sin hielo y con excusa." },
  { id: "j14", texto: "Alguien sacó fotos de todos comiendo y las subió sin filtro." },
  { id: "j15", texto: "Un amigo regaló una tarjeta de regalo de S/ 10 \"con mucho cariño\"." },
  { id: "j16", texto: "Alguien se fue del grupo de WhatsApp el 23 de diciembre." },
  { id: "j17", texto: "El que cocinó dijo \"está simple\" y estaba buenísimo, buscando halagos." },
  { id: "j18", texto: "Alguien cantó villancicos a las 3 de la mañana." },
  { id: "j19", texto: "Un invitado trajo a un amigo que nadie conocía." },
  { id: "j20", texto: "Alguien adivinó a su amigo secreto y lo dijo en voz alta." },
  { id: "j21", texto: "El que tenía que traer el postre trajo galletas de la bodega." },
  { id: "j22", texto: "Alguien usó el mismo suéter navideño cinco años seguidos." },
  { id: "j23", texto: "Un amigo apostó que el regalo era para él y no lo era." },
  { id: "j24", texto: "Alguien se sirvió el último trozo de lechón sin ofrecer." },
  { id: "j25", texto: "El anfitrión escondió el chocolate bueno para después." },
  { id: "j26", texto: "Alguien reenvió una cadena navideña a todo el grupo." },
  { id: "j27", texto: "Un invitado criticó la decoración y no ayudó a armarla." },
  { id: "j28", texto: "Alguien dijo \"es una tontería\" al recibir un regalo carísimo." },
  { id: "j29", texto: "El que llegó tarde se llevó la mejor silla." },
  { id: "j30", texto: "Alguien prometió \"este año sí ahorro\" y compró todo en oferta." },
];

export const VEREDICTOS = ["Culpable", "Inocente"] as const;

/** Platos peruanos para los alias "Agente <plato>" (más que la capacidad máxima de 40). */
export const PLATOS = [
  "Picarón", "Mazamorra", "Cau Cau", "Rocoto", "Anticucho", "Causa", "Lúcuma", "Chicha", "Tamal", "Papa Rellena",
  "Suspiro", "Ají de Gallina", "Cebiche", "Turrón", "Chaufa", "Seco", "Pachamanca", "Humita", "Alfajor", "Chicharrón",
  "Lomo Saltado", "Tacu Tacu", "Juane", "Arroz con Pato", "Carapulcra", "Sopa Seca", "Rocoto Relleno", "Ocopa", "Huancaína", "Tiradito",
  "Choclo", "Camote", "Chapana", "King Kong", "Champús", "Ranfañote", "Frejol Colado", "Inchicapi", "Patarashca", "Cuy",
  "Adobo", "Olluquito", "Sanguito", "Leche de Tigre", "Butifarra", "Pan con Chicharrón", "Mote", "Cancha", "Queso Helado", "Tejas",
];

export const pregunta = {
  manada: (id: string) => PREGUNTAS_MANADA.find((p) => p.id === id),
  amor: (id: string) => PREGUNTAS_AMOR.find((p) => p.id === id),
  picante: (id: string) => PREGUNTAS_PICANTE.find((p) => p.id === id),
  juicio: (id: string) => CASOS_JUICIO.find((p) => p.id === id),
};

/** Texto y picor de cualquier pregunta por id (el prefijo dice la casa). */
export function datosPregunta(id: string): { casa: 2 | 3 | 4 | 5; texto: string; picor: 1 | 2 | 3; opciones?: string[] } | null {
  if (id.startsWith("j")) {
    const p = pregunta.juicio(id);
    return p ? { casa: 5, texto: p.texto, picor: 1, opciones: [...VEREDICTOS] } : null;
  }
  if (id.startsWith("m")) {
    const p = pregunta.manada(id);
    return p ? { casa: 2, texto: p.texto, picor: 1, opciones: p.opciones } : null;
  }
  if (id.startsWith("a")) {
    const p = pregunta.amor(id);
    return p ? { casa: 3, texto: p.texto, picor: p.picor } : null;
  }
  if (id.startsWith("p")) {
    const p = pregunta.picante(id);
    return p ? { casa: 4, texto: p.texto, picor: p.picor } : null;
  }
  return null;
}
