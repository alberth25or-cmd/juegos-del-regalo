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

/** La manada: adivina lo que eligió la mayoría (1 por día). Versión atrevida (2026-11-10, aprobada por Luis). */
export const PREGUNTAS_MANADA: PreguntaManada[] = [
  { id: "m31", texto: "¿Qué es lo peor que se puede hacer en una primera cita?", opciones: ["Llegar tarde", "Hablar del ex", "Revisar el celular", "Pedir pagar a medias"] },
  { id: "m32", texto: "¿Cuántas veces al mes revisa la mayoría el perfil de su ex?", opciones: ["Nunca", "1 o 2", "Cada semana", "Ya ni cuento"] },
  { id: "m33", texto: "¿Qué es más imperdonable?", opciones: ["Que te dejen en visto", "Que te ghosteen", "Que te cancelen 10 min antes", "Que lleguen con otra persona"] },
  { id: "m34", texto: "¿Dónde se conocen hoy la mayoría de parejas?", opciones: ["Apps", "Trabajo o estudios", "Fiestas", "Amigos en común"] },
  { id: "m35", texto: "Tu ex te escribe el 24 a medianoche. ¿Qué hace la mayoría?", opciones: ["Responde al toque", "Lo deja en visto", "Manda captura al grupo", "Bloquea"] },
  { id: "m36", texto: "¿Qué red flag perdona más la gente?", opciones: ["Celos", "Impuntualidad", "Que no conteste", "Que sea tacaño"] },
  { id: "m37", texto: "¿Qué se miente más en una app de citas?", opciones: ["La edad", "La estatura", "Las fotos", "\"Busco algo serio\""] },
  { id: "m38", texto: "¿Qué pasa más en la fiesta de fin de año de la oficina?", opciones: ["Alguien se le declara a alguien", "Alguien llora", "Alguien baila sobre la mesa", "Alguien renuncia"] },
  { id: "m39", texto: "¿Con quién es peor equivocarse de chat?", opciones: ["El jefe", "La mamá", "El ex", "El grupo de la familia"] },
  { id: "m40", texto: "¿Qué haría la mayoría por S/ 1 000?", opciones: ["Besar a un desconocido", "Raparse", "Mostrar su historial de búsqueda", "Llamar a su ex en altavoz"] },
  { id: "m41", texto: "¿Qué hace la mayoría justo después de una ruptura?", opciones: ["Llora con canciones", "Sale de fiesta", "Se baja apps", "Le escribe al ex"] },
  { id: "m42", texto: "¿Qué es lo más atrevido que haría el grupo en Nochebuena?", opciones: ["Escaparse a una fiesta", "Besar a su crush", "Confesar un secreto", "Nada, todos santos"] },
  { id: "m43", texto: "¿Cuánto tarda la mayoría en contestarle a alguien que le gusta?", opciones: ["Al toque", "10 minutos", "1 hora", "Al día siguiente, para hacerse el difícil"] },
  { id: "m44", texto: "¿Qué delata más que alguien está enamorado?", opciones: ["Le sonríe al celular", "Se arregla más", "Desaparece del grupo", "Habla de esa persona todo el rato"] },
  { id: "m45", texto: "¿Qué es peor que tu pareja vea?", opciones: ["Tu historial", "Tus chats", "Tus fotos ocultas", "Tus audios"] },
  { id: "m46", texto: "¿Qué haría la mayoría si su amigo secreto resulta ser su crush?", opciones: ["Regalarle algo carísimo", "Declararse en el intercambio", "Hacerse el loco", "Pedir cambio"] },
  { id: "m47", texto: "¿Cuál es la peor forma de terminar?", opciones: ["Por mensaje", "Por audio", "En público", "Desapareciendo"] },
  { id: "m48", texto: "¿Qué es más común en el grupo?", opciones: ["Stalkear al ex", "Stalkear al crush", "Stalkear al ex del crush", "Todas las anteriores"] },
  { id: "m49", texto: "¿Qué preferiría la mayoría?", opciones: ["Leer los chats de su crush", "Saber quién lo stalkea", "Borrar un mensaje ya leído", "Saber quién es su amigo secreto"] },
  { id: "m50", texto: "¿Qué es lo más vergonzoso que te pueden encontrar en el celular?", opciones: ["Las búsquedas", "Las fotos", "Los audios", "Las conversaciones archivadas"] },
  { id: "m51", texto: "¿Qué hace la mayoría para impresionar en una primera cita?", opciones: ["Exagera su trabajo", "Finge gustos", "Paga todo", "Saca su mejor outfit"] },
  { id: "m52", texto: "¿Qué celos son los más comunes?", opciones: ["Del ex", "Del mejor amigo", "Del compañero de trabajo", "De las redes"] },
  { id: "m53", texto: "¿Cuántas veces ha vuelto la mayoría con un ex?", opciones: ["Nunca", "1 vez", "2 o 3", "Mejor no hablemos de eso"] },
  { id: "m54", texto: "Si dos del grupo se besan en la fiesta de Navidad, ¿qué hace el resto?", opciones: ["Lo graba", "Aplaude", "Se hace el loco", "Lo cuenta en el grupo al día siguiente"] },
  { id: "m55", texto: "¿Cómo tiene guardado la mayoría a su ex en el celular?", opciones: ["\"No contestar\"", "Con un emoji", "Con su nombre normal", "Ya lo borró"] },
  { id: "m56", texto: "¿Qué es lo que más se finge en una relación?", opciones: ["Que te gusta su música", "Que no estás celoso", "Que no te importa", "Que ya estás llegando"] },
  { id: "m57", texto: "¿Qué pregunta incomoda más en la cena familiar?", opciones: ["¿Y el novio o la novia?", "¿Cuándo te casas?", "¿Para cuándo los hijos?", "¿Y el trabajo?"] },
  { id: "m58", texto: "¿A quién le escribe la mayoría con unos tragos de más?", opciones: ["Al ex", "Al crush", "Al grupo", "A la mamá"] },
  { id: "m59", texto: "¿Cuánto tarda el grupo en olvidar un crush?", opciones: ["1 semana", "1 mes", "Nunca", "Hasta el siguiente crush"] },
  { id: "m60", texto: "¿Qué es lo más atrevido que ha hecho la mayoría en una app de citas?", opciones: ["Mandar el primer mensaje", "Hacer match con un conocido", "Mentir en el perfil", "Salir con dos a la vez"] },
  { id: "m61", texto: "Tu crush te deja en visto. ¿Qué hace la mayoría?", opciones: ["Espera", "Manda otro mensaje", "Sube una historia \"casual\"", "Bloquea"] },
  { id: "m62", texto: "Según la mayoría, ¿qué delata más a un infiel?", opciones: ["El celular boca abajo", "Contraseñas nuevas", "\"Estoy en el gimnasio\"", "Se baña apenas llega"] },
  { id: "m63", texto: "¿Qué es más difícil de perdonar?", opciones: ["Una mentira", "Olvidar el aniversario", "Hablar a escondidas con el ex", "Que lea tus chats"] },
  { id: "m64", texto: "¿Qué hace la mayoría en una cita a ciegas aburrida?", opciones: ["Inventa una emergencia", "Aguanta hasta el final", "Pide la cuenta", "Llama a un amigo para que la rescate"] },
  { id: "m65", texto: "En verdad o reto, ¿qué confiesa primero el grupo?", opciones: ["Un crush", "Un beso secreto", "Una mentira a un amigo", "Un stalkeo"] },
  { id: "m66", texto: "¿Qué se vuelve chisme al día siguiente de una fiesta?", opciones: ["Quién se fue con quién", "Quién lloró", "Quién bailó", "Quién se quedó dormido"] },
  { id: "m67", texto: "¿Qué mentira se dice más en Navidad?", opciones: ["\"Me encanta el regalo\"", "\"Ya estoy llegando\"", "\"Comí poco\"", "\"No tomo más\""] },
  { id: "m68", texto: "¿Qué le da más miedo a la mayoría que vea su amigo secreto?", opciones: ["Sus respuestas de Picante", "Su ficha", "Lo que fisgoneó", "Su mensaje de la cápsula"] },
  { id: "m69", texto: "Con una noche libre y sin consecuencias, ¿qué haría la mayoría?", opciones: ["Fiesta hasta el amanecer", "Escribirle al crush", "Viajar de improviso", "Dormir 12 horas"] },
  { id: "m70", texto: "¿Qué es más tentador?", opciones: ["El ex que vuelve", "El crush prohibido", "El compañero de trabajo", "El desconocido de la fiesta"] },
  { id: "m71", texto: "¿Cuántos crushes tuvo la mayoría este año?", opciones: ["Ninguno", "1", "2 o 3", "Perdí la cuenta"] },
  { id: "m72", texto: "¿Qué es lo que más pasa en un after?", opciones: ["Confesiones", "Llamadas al ex", "Karaoke", "Planes que nadie cumple"] },
  { id: "m73", texto: "¿Quién preferiría la mayoría que vea sus historias?", opciones: ["Su ex", "Su crush", "Nadie", "Su mamá"] },
  { id: "m74", texto: "¿Qué hace la mayoría si su pareja le pide la contraseña del celular?", opciones: ["Se la da", "Le da una falsa", "Pregunta \"¿para qué?\"", "Termina la relación"] },
  { id: "m75", texto: "¿Cuál es el plan más peligroso de diciembre?", opciones: ["La fiesta de la oficina", "La reunión de exalumnos", "El after del amigo secreto", "La cena con la familia de la pareja"] },
];

/**
 * Primera versión de La manada (retirada el 2026-11-10: Luis las vio demasiado inocentes).
 * Ya NO salen en el juego; quedan solo para leer respuestas guardadas con estos ids.
 */
const PREGUNTAS_MANADA_RETIRADAS: PreguntaManada[] = [
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
  // Del banco de Luis (2026-11-12) para llegar a 30 días: más fuertes, sin sexo (Amor no pide confirmar edad).
  { id: "a51", texto: "¿Cuál ha sido la excusa más absurda que usaste para terminar una relación?", picor: 2 },
  { id: "a52", texto: "¿Cuál ha sido tu mayor humillación amorosa?", picor: 3 },
  { id: "a53", texto: "¿Qué es lo peor que has hecho por celos?", picor: 3 },
  { id: "a54", texto: "¿Qué es lo más cruel que has hecho durante una ruptura?", picor: 3 },
  { id: "a55", texto: "¿Cuál es la mayor mentira que dijiste para conquistar a alguien?", picor: 3 },
  { id: "a56", texto: "¿Qué secreto de tu vida sentimental podría arruinar tu reputación?", picor: 3 },
  { id: "a57", texto: "Si pudieras cambiar una sola decisión sentimental, ¿cuál sería?", picor: 2 },
  { id: "a58", texto: "¿Qué rechazo todavía te duele recordar (sin decir nombres)?", picor: 3 },
  { id: "a59", texto: "¿Qué es lo más bajo que has hecho para llamar la atención de alguien?", picor: 3 },
  { id: "a60", texto: "¿Qué persona de tu pasado podría arruinarte una reunión si apareciera (sin decir su nombre)?", picor: 3 },
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
  // Del banco de Luis (2026-11-12) para llegar a 30 días. Picante es solo para quien confirmó ser mayor de edad.
  { id: "p51", texto: "¿Has sido infiel alguna vez?", picor: 3 },
  { id: "p52", texto: "¿Has sido la tercera persona en una relación?", picor: 3 },
  { id: "p53", texto: "¿Has besado a dos personas diferentes en una misma noche?", picor: 3 },
  { id: "p54", texto: "¿Has enviado una foto subida de tono y luego te arrepentiste?", picor: 3 },
  { id: "p55", texto: "¿Alguna vez has fingido un orgasmo?", picor: 3 },
  { id: "p56", texto: "¿Has tenido intimidad con alguien que tenía pareja?", picor: 3 },
  { id: "p57", texto: "¿Has tenido una relación exclusivamente sexual?", picor: 3 },
  { id: "p58", texto: "¿Alguna vez has sido infiel emocionalmente?", picor: 3 },
  { id: "p59", texto: "¿Has usado a alguien para olvidar a otra persona?", picor: 3 },
  { id: "p60", texto: "¿Has mentido sobre la cantidad de personas con las que has tenido intimidad?", picor: 3 },
];

/**
 * Juicio final: un dilema por día. ¿Culpable o inocente? Gana quien coincide con el jurado.
 * Versión controversial (2026-11-12, aprobada por Luis): dilemas que dividen al grupo. Los primeros
 * 30 casos (j01–j30) nunca llegaron a publicarse, por eso no se conservan.
 */
export const CASOS_JUICIO: { id: string; texto: string }[] = [
  { id: "j31", texto: "Alguien descubrió que la pareja de su mejor amigo le es infiel y decidió no decirle nada \"para no meterse\"." },
  { id: "j32", texto: "Alguien empezó a salir con el ex de su mejor amiga dos meses después de que terminaron." },
  { id: "j33", texto: "Alguien besó a otra persona estando \"en una pausa\" con su pareja." },
  { id: "j34", texto: "Alguien le revisó el celular a su pareja y encontró algo. ¿Culpable por revisar?" },
  { id: "j35", texto: "Alguien sigue hablando todos los días con su ex, y su pareja actual no lo sabe." },
  { id: "j36", texto: "Alguien se acostó con alguien la misma semana en que terminó una relación de 5 años." },
  { id: "j37", texto: "Alguien le confesó a su mejor amigo que está enamorado de su pareja." },
  { id: "j38", texto: "Alguien perdonó una infidelidad y volvió como si nada." },
  { id: "j39", texto: "Alguien tiene una cuenta de citas activa \"solo para ver\" mientras está en una relación." },
  { id: "j40", texto: "Alguien le contó a su pareja un secreto de su mejor amigo." },
  { id: "j41", texto: "Alguien se casó con el ex de una amiga del grupo y no la invitó a la boda." },
  { id: "j42", texto: "Alguien dejó de hablarle a un amigo porque ese amigo empezó a salir con su ex." },
  { id: "j43", texto: "Alguien le mintió a su pareja sobre cuántas parejas tuvo antes." },
  { id: "j44", texto: "Alguien tuvo un \"casi algo\" con el hermano de su mejor amigo, a escondidas." },
  { id: "j45", texto: "Alguien le pidió a su pareja la contraseña del celular \"como prueba de amor\"." },
  { id: "j46", texto: "Alguien terminó una relación porque su pareja ganaba menos dinero." },
  { id: "j47", texto: "Alguien se enteró de que su amigo era infiel y se lo contó a la pareja engañada." },
  { id: "j48", texto: "Alguien le dio like a todas las fotos de su crush, que tiene pareja." },
  { id: "j49", texto: "Alguien sigue guardando los regalos de su ex y se pone su chompa en diciembre." },
  { id: "j50", texto: "Alguien besó a alguien en una fiesta mientras su pareja estaba de viaje y dice que \"no cuenta\"." },
  { id: "j51", texto: "Alguien invitó a su ex a su cumpleaños sin avisarle a su pareja." },
  { id: "j52", texto: "Alguien dijo \"te amo\" a los dos meses solo para no perder a la otra persona." },
  { id: "j53", texto: "Alguien tiene un mejor amigo del sexo que le gusta y su pareja tiene celos. ¿Culpable el que tiene el amigo?" },
  { id: "j54", texto: "Alguien leyó los chats de su pareja dormida y descubrió que le estaban organizando una sorpresa." },
  { id: "j55", texto: "Alguien le prestó plata a un amigo para un regalo y luego lo cobró delante de todos." },
  { id: "j56", texto: "Alguien se fue de viaje con amigos y no le contestó a su pareja en 3 días." },
  { id: "j57", texto: "Alguien terminó con su pareja una semana antes de Navidad para no comprarle regalo." },
  { id: "j58", texto: "Alguien coqueteó con su jefe y consiguió un ascenso." },
  { id: "j59", texto: "Alguien le ocultó a su grupo que estaba saliendo con alguien de ese mismo grupo." },
  { id: "j60", texto: "Alguien volvió con su ex después de jurarle a todos sus amigos que \"nunca más\"." },
  { id: "j61", texto: "Alguien stalkea a la nueva pareja de su ex con una cuenta falsa." },
  { id: "j62", texto: "Alguien besó a su mejor amigo \"para probar\" y ahora ninguno habla del tema." },
  { id: "j63", texto: "Alguien rechazó a alguien del grupo y después contó todos los detalles." },
  { id: "j64", texto: "Alguien no le dijo a su pareja que su ex estará en la misma fiesta." },
  { id: "j65", texto: "Alguien borró los mensajes de un chat con otra persona antes de prestarle el celular a su pareja." },
  { id: "j66", texto: "Alguien se fijó en la pareja de un amigo y se lo confesó al propio amigo \"por honestidad\"." },
  { id: "j67", texto: "Alguien sale con dos personas a la vez sin exclusividad y ninguna de las dos lo sabe." },
  { id: "j68", texto: "Alguien dejó plantado a un amigo en su cumpleaños por una cita." },
  { id: "j69", texto: "Alguien le escribió a su ex para felicitarlo por su nueva relación… con un \"ojalá dure\"." },
  { id: "j70", texto: "Alguien eligió quedarse con su pareja en vez de ir al viaje del grupo que habían planeado por meses." },
  { id: "j71", texto: "Alguien le contó a su nueva pareja todos los defectos de su ex en la primera cita." },
  { id: "j72", texto: "Alguien aceptó un regalo carísimo de alguien que sabía que estaba enamorado de él, sin intención de corresponder." },
  { id: "j73", texto: "Alguien mantuvo una relación a distancia y en una fiesta \"solo bailó pegado\" con otra persona." },
  { id: "j74", texto: "Alguien usó el amigo secreto para regalarle algo a su crush con una indirecta muy obvia." },
  { id: "j75", texto: "Alguien le dijo a su mejor amigo que su pareja no le cae bien, justo antes de que se comprometan." },
];

export const VEREDICTOS = ["Culpable", "Inocente"] as const;

/**
 * Corazón: una pregunta bonita por día (de los bancos "Conocernos de verdad" y "Conocerte de verdad"
 * que pasó Luis, 2026-11-12). Sobre uno mismo, de respuesta corta, sin temas tristes. Van a la ficha
 * del amigo secreto: dicen qué regalarle y cómo describirlo.
 */
export const PREGUNTAS_CORAZON: { id: string; texto: string }[] = [
  { id: "c01", texto: "¿Qué tres palabras te representan mejor?" },
  { id: "c02", texto: "¿Qué cosa pequeña puede cambiarte completamente el día?" },
  { id: "c03", texto: "¿Qué es algo que la gente suele malinterpretar de ti?" },
  { id: "c04", texto: "¿Qué tipo de personas sacan tu mejor versión?" },
  { id: "c05", texto: "¿Qué personaje de una película, libro o serie tiene algo de ti?" },
  { id: "c06", texto: "¿Qué soñabas ser cuando eras pequeño?" },
  { id: "c07", texto: "¿Qué olor, canción o lugar te transporta a tu infancia?" },
  { id: "c08", texto: "¿Qué travesura de pequeño todavía recuerdas con una sonrisa?" },
  { id: "c09", texto: "¿Qué costumbre de tu familia te gustaría conservar toda la vida?" },
  { id: "c10", texto: "¿Qué experiencia te gustaría vivir al menos una vez en la vida?" },
  { id: "c11", texto: "¿Qué harías si supieras que no puedes fracasar?" },
  { id: "c12", texto: "¿Qué lugar del mundo sueñas con conocer?" },
  { id: "c13", texto: "¿Qué te gustaría aprender antes de que termine este año?" },
  { id: "c14", texto: "¿Qué actividad podrías hacer durante horas sin darte cuenta del tiempo?" },
  { id: "c15", texto: "¿Qué habilidad te gustaría dominar por completo?" },
  { id: "c16", texto: "¿Qué gesto pequeño te hace sentir profundamente querido?" },
  { id: "c17", texto: "¿Cuál es el gesto más bonito que alguien ha tenido contigo?" },
  { id: "c18", texto: "¿Qué es lo que más valoras en una amistad?" },
  { id: "c19", texto: "¿Cuál ha sido el riesgo más grande que has tomado?" },
  { id: "c20", texto: "¿Qué viaje te cambió la forma de ver el mundo?" },
  { id: "c21", texto: "¿Qué es algo que hiciste por primera vez y nunca olvidaste?" },
  { id: "c22", texto: "¿Qué canción te devuelve inmediatamente a un momento feliz?" },
  { id: "c23", texto: "¿Qué comida te recuerda a alguien especial?" },
  { id: "c24", texto: "¿Qué plan sencillo te hace inmensamente feliz?" },
  { id: "c25", texto: "¿Qué pequeño lujo disfrutas sin sentir culpa?" },
  { id: "c26", texto: "¿Qué harías un domingo perfecto sin ninguna obligación?" },
  { id: "c27", texto: "¿Qué recuerdo te hace sonreír incluso en un mal día?" },
  { id: "c28", texto: "¿Cuál es tu manera favorita de celebrar un logro?" },
  { id: "c29", texto: "¿Qué es lo que más disfrutas de estar con tus amigos?" },
  { id: "c30", texto: "¿Qué te gustaría que tus amigos nunca olvidaran de ti?" },
];

/** Platos peruanos para los alias "Agente <plato>" (más que la capacidad máxima de 40). */
export const PLATOS = [
  "Picarón", "Mazamorra", "Cau Cau", "Rocoto", "Anticucho", "Causa", "Lúcuma", "Chicha", "Tamal", "Papa Rellena",
  "Suspiro", "Ají de Gallina", "Cebiche", "Turrón", "Chaufa", "Seco", "Pachamanca", "Humita", "Alfajor", "Chicharrón",
  "Lomo Saltado", "Tacu Tacu", "Juane", "Arroz con Pato", "Carapulcra", "Sopa Seca", "Rocoto Relleno", "Ocopa", "Huancaína", "Tiradito",
  "Choclo", "Camote", "Chapana", "King Kong", "Champús", "Ranfañote", "Frejol Colado", "Inchicapi", "Patarashca", "Cuy",
  "Adobo", "Olluquito", "Sanguito", "Leche de Tigre", "Butifarra", "Pan con Chicharrón", "Mote", "Cancha", "Queso Helado", "Tejas",
];

export const pregunta = {
  manada: (id: string) => PREGUNTAS_MANADA.find((p) => p.id === id) ?? PREGUNTAS_MANADA_RETIRADAS.find((p) => p.id === id),
  amor: (id: string) => PREGUNTAS_AMOR.find((p) => p.id === id),
  picante: (id: string) => PREGUNTAS_PICANTE.find((p) => p.id === id),
  juicio: (id: string) => CASOS_JUICIO.find((p) => p.id === id),
  corazon: (id: string) => PREGUNTAS_CORAZON.find((p) => p.id === id),
};

/** Texto y picor de cualquier pregunta por id (el prefijo dice la casa). */
export function datosPregunta(id: string): { casa: 2 | 3 | 4 | 5 | 6; texto: string; picor: 1 | 2 | 3; opciones?: string[] } | null {
  if (id.startsWith("c")) {
    const p = pregunta.corazon(id);
    return p ? { casa: 6, texto: p.texto, picor: 1 } : null;
  }
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
