/**
 * Catálogo revisado de «¿Quién es más probable que…?».
 * Reglas del humor (CLAUDE.md §7): situaciones absurdas de Snowville y costumbres
 * inofensivas. Nada sobre apariencia, salud, dinero real, tragedias, características
 * protegidas ni secretos. Cada pregunta tiene un id estable (los votos guardan el id).
 */
export interface PreguntaVoto {
  id: string;
  texto: string;
}

export const PREGUNTAS_VOTO: PreguntaVoto[] = [
  { id: "v01", texto: "¿Quién sería despedido primero de la fábrica de Santa?" },
  { id: "v02", texto: "¿Quién dice «ya estoy llegando» cuando todavía está en su casa?" },
  { id: "v03", texto: "¿Quién traicionaría a su equipo por un panetón?" },
  { id: "v04", texto: "¿Quién se perdería en Snowville aunque tenga el mapa en la mano?" },
  { id: "v05", texto: "¿Quién abriría sus regalos antes de Navidad «solo para ver»?" },
  { id: "v06", texto: "¿Quién convencería a los duendes de hacer huelga?" },
  { id: "v07", texto: "¿Quién terminaría liderando la huelga… y pidiendo vacaciones?" },
  { id: "v08", texto: "¿Quién sobreviviría menos en un apocalipsis zombi de muñecos de nieve?" },
  { id: "v09", texto: "¿Quién le pondría nombre a cada reno y les hablaría a diario?" },
  { id: "v10", texto: "¿Quién mandaría un audio de 7 minutos para decir «ok»?" },
  { id: "v11", texto: "¿Quién se quedaría dormido el día de la entrega de regalos?" },
  { id: "v12", texto: "¿Quién decoraría la casa en octubre y la desarmaría en marzo?" },
  { id: "v13", texto: "¿Quién sería el Auditor más estricto del Polo Norte?" },
  { id: "v14", texto: "¿Quién regalaría algo que le regalaron a él el año pasado?" },
  { id: "v15", texto: "¿Quién ganaría una guerra de bolas de nieve haciendo trampa?" },
  { id: "v16", texto: "¿Quién se comería las galletas que eran para Santa?" },
  { id: "v17", texto: "¿Quién llegaría al amigo secreto sin regalo pero con una excusa épica?" },
  { id: "v18", texto: "¿Quién sería el primero en desaparecer en una película de terror navideña?" },
  { id: "v19", texto: "¿Quién vendería hielo en el Polo Norte y lo lograría?" },
  { id: "v20", texto: "¿Quién se uniría al Muñeco de Nieve sospechoso sin hacer preguntas?" },
  { id: "v21", texto: "¿Quién cantaría villancicos a todo volumen sin saberse la letra?" },
  { id: "v22", texto: "¿Quién envolvería un regalo con 3 metros de cinta adhesiva?" },
  { id: "v23", texto: "¿Quién pediría un aumento a Santa el 24 de diciembre?" },
  { id: "v24", texto: "¿Quién respondería el chat del grupo tres días después?" },
  { id: "v25", texto: "¿Quién organizaría una reunión y sería el último en llegar?" },
  { id: "v26", texto: "¿Quién sería capaz de discutir con Rudolf y ganar?" },
  { id: "v27", texto: "¿Quién escondería el control remoto para elegir la película navideña?" },
  { id: "v28", texto: "¿Quién terminaría atrapado en la chimenea por querer ayudar?" },
  { id: "v29", texto: "¿Quién convertiría el trineo en un negocio de delivery?" },
  { id: "v30", texto: "¿Quién se tomaría una selfie con cada adorno del árbol?" },
  { id: "v31", texto: "¿Quién diría «yo no fui» incluso con las pruebas en la mano?" },
  { id: "v32", texto: "¿Quién sería el mejor espía infiltrado en la fábrica?" },
  { id: "v33", texto: "¿Quién compraría todos los regalos el 24 a las 11 de la noche?" },
  { id: "v34", texto: "¿Quién se haría amigo del Auditor en cinco minutos?" },
  { id: "v35", texto: "¿Quién convertiría cualquier juego de mesa en un drama?" },
  { id: "v36", texto: "¿Quién se ofrecería a cocinar la cena navideña… y pediría delivery?" },
  { id: "v37", texto: "¿Quién sería nombrado Duende del Mes por accidente?" },
  { id: "v38", texto: "¿Quién encontraría la forma de dormir en el taller sin que lo vean?" },
];

/**
 * Comentarios del Auditor al revelar resultados. `{n}` = nombre del más votado,
 * `{v}` = sus votos. Tono burocrático y absurdo; nunca sobre la persona en sí.
 */
export const COMENTARIOS_AUDITOR = [
  "Con {v} votos, {n} queda oficialmente bajo observación. Lo anoto en el formulario 27-B.",
  "{n}: {v} votos. No es una acusación, es una estadística. Bueno, es las dos cosas.",
  "El pueblo ha hablado: {n}. Abriré un expediente, aunque ya tenía uno.",
  "{v} votos para {n}. Santa pidió que no lo tomes personal. Yo sí lo tomaré personal.",
  "Resultado auditado y certificado: {n}. Las quejas se reciben en horario de oficina (nunca).",
  "{n} gana con {v} votos. Felicitaciones, supongo. Esto irá a tu evaluación anual.",
  "Según mis cálculos, {n} era el favorito desde el principio. Mis cálculos nunca fallan.",
  "{n}: {v} votos. Los duendes ya están imprimiendo los carteles.",
];

export const COMENTARIOS_EMPATE = [
  "Empate técnico. Tendré que auditar a todos los involucrados. Qué alegría.",
  "Empate. El grupo no se decide, igual que en cualquier plan de fin de semana.",
  "Varios empatados. Santa dice que es un trabajo en equipo. Yo digo que es sospechoso.",
];
