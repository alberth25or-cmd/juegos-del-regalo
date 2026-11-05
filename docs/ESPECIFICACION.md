# CHRISTMAS CHAOS

## Documento maestro de producto, diseño y especificación técnica

**Versión:** 1.0\
**Tipo de producto:** juego social web multijugador, temporada navideña
de 30 días\
**Grupo inicial:** 20 participantes\
**Stack objetivo:** Next.js + TypeScript + Tailwind CSS + Supabase +
Vercel\
**Documento para:** Claude Code

------------------------------------------------------------------------

# 1. Instrucción principal para Claude Code

Construye **CHRISTMAS CHAOS**, un juego social web multijugador para un
grupo cerrado de aproximadamente 20 amigos que participarán en una
temporada navideña de 30 días.

No construyas una simple página de amigo secreto ni una colección
aislada de minijuegos. El producto debe sentirse como un **mundo RPG
navideño compartido**, con exploración, personajes, progresión, humor
negro, bromas consensuadas, minijuegos individuales, cooperativos,
competitivos y eventos sociales.

La experiencia debe combinar:

-   Exploración y progresión inspiradas en los RPG clásicos y los mundos
    sociales pixel art.
-   Minijuegos rápidos y caóticos inspirados en juegos de fiesta como
    Mario Party y Fall Guys.
-   Cooperación, comunicación e información asimétrica.
-   Votaciones, sospechas, sabotajes controlados y rivalidades
    amistosas.
-   Humor negro, sátira laboral, ironía y situaciones absurdas, tomando
    como referencia general el tono irreverente de juegos de fiesta como
    los de Palomo Games, **sin copiar nombres, cartas, textos,
    ilustraciones, diseños ni reglas protegidas**.
-   Contenido que produzca momentos compartibles: memes, tarjetas de
    resultados, reconocimientos y resúmenes.
-   Un sistema de puntos y recompensas equilibrado, transparente y
    resistente a trampas básicas.

**Prioridad absoluta:** entregar primero un MVP jugable, estable y
visualmente convincente. No sobreingenierizar. Evitar microservicios,
sistemas innecesariamente complejos y dependencias que no aporten al
grupo inicial.

Antes de programar: 1. Inspecciona el repositorio y detecta qué existe.
2. Resume la arquitectura actual y cualquier decisión que entre en
conflicto con este documento. 3. Crea o actualiza `CLAUDE.md` con las
reglas de trabajo del proyecto. 4. Propón un plan por fases con
entregables verificables. 5. Implementa en incrementos pequeños y
ejecutables. No intentes construir todas las funciones en un solo
cambio. 6. Si falta una decisión menor, elige una opción razonable,
documenta el supuesto y continúa. Pregunta solo si el bloqueo es
realmente importante. 7. No afirmes que una función está terminada si no
está implementada y probada.

------------------------------------------------------------------------

# 2. Visión del producto

## 2.1 Concepto

**CHRISTMAS CHAOS: 30 días para sobrevivir a la Navidad.**

El Polo Norte está en crisis: - Santa está endeudado, es incompetente y
administra la fábrica como una empresa quebrada. - Los duendes están
organizando una huelga. - Los renos tienen problemas laborales y
conflictos internos. - La fábrica produce regalos defectuosos. - El
bosque está lleno de misterios y personajes sospechosos. - La Navidad
corre peligro por una mezcla de mala gestión, sabotajes, incompetencia y
decisiones absurdas.

Los participantes entran en este mundo como personajes. Durante 30 días
deben completar misiones, jugar, cooperar, competir, votar, hacer
bromas, ganar recompensas y tratar de salvar ---o arruinar--- la
Navidad.

La historia es el marco narrativo. El centro del producto es la
interacción real entre los participantes.

## 2.2 Objetivos de experiencia

El jugador debe poder: - Entrar desde el celular sin instalar una
aplicación. - Personalizar un avatar sencillo. - Ver el mundo, su
equipo, sus misiones y su progreso. - Jugar una actividad rápida de 3 a
10 minutos. - Participar en desafíos cooperativos incluso si los demás
no están conectados al mismo tiempo. - Interactuar con sus amigos
mediante votaciones, respuestas, memes y duelos. - Ver resultados y
rankings que provoquen conversación. - Compartir una tarjeta o un
momento del juego por WhatsApp, Instagram o TikTok.

## 2.3 Principios de diseño

1.  **Social primero:** los jugadores y sus interacciones importan más
    que la cantidad de minijuegos.
2.  **Diversión antes que complejidad:** reglas que se entiendan en
    segundos.
3.  **Cooperación real:** las acciones de cada integrante deben aportar
    al resultado del equipo.
4.  **Competencia justa:** no permitir que pagar, comprar cosméticos o
    jugar cientos de veces dé ventaja competitiva.
5.  **Humor consensuado:** bromas ácidas sí; acoso, exposición de
    secretos y ataques personales no.
6.  **Mobile-first:** la mayoría debe poder jugar desde Android o
    iPhone.
7.  **Asincronía:** no exigir que los 20 participantes estén conectados
    al mismo tiempo.
8.  **Sesiones cortas:** actividades breves y posibilidad de volver más
    tarde.
9.  **Sin presión tóxica:** no castigar al jugador por faltar un día ni
    hacer que pierda recompensas permanentes.
10. **Identidad propia:** inspirarse en géneros y dinámicas conocidas,
    no clonar productos existentes.

------------------------------------------------------------------------

# 3. Público, escala y formato

-   Grupo inicial: 20 participantes.
-   Organización recomendada: 4 equipos de 5 personas.
-   Temporada: 30 días.
-   Idioma inicial: español peruano neutro, cercano y coloquial.
-   País/convenciones iniciales: Perú; usar `America/Lima` como zona
    horaria de temporada, configurable.
-   Dispositivo prioritario: móvil.
-   Acceso: invitación privada mediante código o enlace.
-   La arquitectura debe tolerar crecimiento moderado, pero no diseñar
    prematuramente para miles de usuarios concurrentes.

La temporada debe poder configurarse: fechas, número de equipos, tamaño
de equipos, actividades activas, límites de puntuación y premios.

------------------------------------------------------------------------

# 4. Identidad creativa y dirección de arte

## 4.1 Personalidad

La Navidad parece bonita desde fuera, pero por dentro es una empresa
desastrosa. La estética debe mezclar encanto navideño con caos, ironía y
personajes cuestionables.

Tono: - Humor negro moderado a ácido. - Sarcasmo. - Humor absurdo y
surrealista. - Sátira de oficina, burocracia y trabajo precario. -
Frases cortas, memorables y compartibles. - Bromas sobre situaciones
ficticias del universo del juego.

Evitar: - Insultos discriminatorios. - Ataques a raza, nacionalidad,
religión, orientación sexual, identidad, discapacidad u otras
características protegidas. - Bromas sobre enfermedades, traumas,
violencia sexual, autolesiones o tragedias reales. - Burlas sobre
apariencia física, pobreza, situación familiar o secretos personales. -
Publicar contenido de un participante fuera del grupo sin su permiso.

## 4.2 Dirección visual

Estética recomendada: **Navidad bonita por fuera, mundo disfuncional por
dentro**.

Características: - Pixel art 2D. - Pueblo nevado con luces cálidas. -
Contraste entre decoración navideña y elementos de fábrica decadente. -
Colores base: azul noche, verde pino, rojo navideño, crema, dorado y
acentos neón. - Interfaz inspirada en RPG de 16/32 bits, pero con
legibilidad y navegación modernas. - Tipografía de títulos pixelada solo
si es legible; tipografía sans-serif para textos funcionales. -
Animaciones breves: nieve, luces, personajes, cofres, notificaciones y
transiciones. - Evitar saturar la pantalla con efectos.

La interfaz no debe parecer una plantilla administrativa. Debe sentirse
como un videojuego.

## 4.3 Mundo y zonas

Crear un mapa principal llamado **Snowville**, dividido en zonas:

1.  **Plaza central:** punto de entrada, avatar, noticias, NPCs, misión
    destacada, estado de temporada.
2.  **Arcade:** catálogo de minijuegos individuales y cooperativos.
3.  **Fábrica de regalos:** misiones de producción cooperativa.
4.  **Bosque congelado:** exploración, pistas, acertijos y escape rooms.
5.  **Mercado negro navideño:** tienda de cosméticos y objetos
    humorísticos sin ventaja competitiva.
6.  **Tablón del caos:** votaciones, confesionario, roast battles, memes
    y eventos sociales.
7.  **Arena:** duelos, desafíos competitivos y guerras de nieve.
8.  **Salón de trofeos:** premios, logros, estadísticas y recuerdos de
    temporada.

En móvil, el mapa puede convertirse en una navegación por tarjetas o
botones grandes. No obligar a mover un personaje por un mapa complejo
para acceder a funciones esenciales.

## 4.4 NPCs

Crear personajes originales con diálogos breves y contextuales:

-   **Santa:** jefe incompetente, sarcástico, endeudado y dramático.
-   **Rudolf:** reno arrogante que cree que todo el proyecto depende de
    él.
-   **Duende sindicalista:** protesta por las condiciones laborales.
-   **Muñeco de nieve:** personaje sospechoso que aparece en lugares
    extraños.
-   **Auditor del Polo Norte:** revisa resultados y emite comentarios
    crueles sobre el desempeño ficticio.

Los diálogos pueden variar según eventos, resultados y progreso. Evitar
generar texto ofensivo dinámico sin controles. Priorizar un catálogo de
frases revisadas.

------------------------------------------------------------------------

# 5. Estructura de temporada de 30 días

La temporada tiene una historia general, pero las actividades no deben
depender exclusivamente de una secuencia lineal.

## 5.1 Arcos narrativos

-   **Días 1--5: El inicio del desastre.** Presentación del mundo,
    avatares, equipos y primeras misiones.
-   **Días 6--10: Se rompe la amistad.** Confesionario, votaciones,
    cartas y primeras batallas de roast.
-   **Días 11--15: La guerra del Polo Norte.** Cooperación por equipos,
    retos secretos y desafíos competitivos.
-   **Días 16--20: Nadie es inocente.** Misiones globales, memes y
    eventos de sabotaje controlado.
-   **Días 21--25: Caos absoluto.** Eventos especiales, desafíos de
    tiempo y remontadas.
-   **Días 26--30: El juicio final.** Últimos retos, cierre de rankings,
    ceremonia y premios.

## 5.2 Calendario de eventos

Configurar eventos destacados en los días 1, 5, 10, 15, 20, 25 y 30. El
administrador debe poder cambiar el calendario sin editar código.

## 5.3 Participación asincrónica

-   Los minijuegos individuales están disponibles a cualquier hora.
-   Los retos cooperativos pueden aceptar contribuciones durante una
    ventana de horas o días.
-   Los retos en tiempo real deben ser opcionales y tener alternativa
    asincrónica cuando sea posible.
-   Mostrar claramente hora de inicio y cierre usando `America/Lima`.
-   No penalizar a quien no pueda conectarse a una hora concreta.

------------------------------------------------------------------------

# 6. Modos de juego

El producto debe ofrecer cinco grandes modalidades.

## 6.1 Individual: «Yo contra todos»

El jugador compite contra su propio récord y contra el ranking general.

Ejemplos: - Arcade de reflejos. - Trivia absurda. - Memoria. - Juego de
palabras. - Desafíos diarios.

## 6.2 Cooperativo: «Nosotros contra el juego»

De 2 a 5 jugadores colaboran para completar un objetivo común.

Cada jugador debe tener una contribución identificable. No diseñar retos
donde una persona pueda resolverlo todo mientras las demás miran.

## 6.3 Equipos: «Nosotros contra ellos»

Cuatro equipos de cinco integrantes compiten en retos con puntuación
agregada.

El ranking por equipos debe usar promedio o puntuación normalizada por
participante elegible, no solo suma bruta, para que un equipo no gane
únicamente porque algunos jugadores juegan mucho más.

## 6.4 Comunidad: «Los 20 contra el desastre»

Misiones globales donde cada participante contribuye al progreso de
todos.

Ejemplo: reunir 10 000 puntos de energía navideña para encender el árbol
de Snowville.

## 6.5 Social: «Nosotros contra nosotros mismos»

-   Votaciones.
-   Confesionario anónimo.
-   Adivinar autores de confesiones.
-   Roast battles.
-   Batallas de memes.
-   Cartas de situaciones absurdas.
-   Premios y reconocimientos.

------------------------------------------------------------------------

# 7. Catálogo inicial de minijuegos

Implementar primero tres o cuatro actividades muy bien terminadas.
Añadir más después de validar diversión y estabilidad.

## 7.1 Gift Catcher --- Santa en bancarrota

**Tipo:** individual arcade.\
**Duración objetivo:** 45--90 segundos.\
**Mecánica:** mover al personaje para atrapar regalos que caen y evitar
carbón, facturas, cajas defectuosas y otros obstáculos.

Requisitos: - Controles táctiles y teclado. - Dificultad progresiva. -
Puntuación basada en objetos y tiempo. - Pantalla de inicio, pausa, fin
y resultado. - El servidor debe validar límites razonables de puntuación
y duración. - No confiar en una puntuación enviada por el navegador sin
validación.

## 7.2 Trivia absurda --- Juicio del Polo Norte

**Tipo:** individual o por equipos.\
**Mecánica:** preguntas de cultura general ligera y situaciones
ficticias absurdas.

Ejemplos de tono: - ¿Cuál sería el peor departamento para contratar a
Rudolf? - ¿Qué haría Santa si descubre que la fábrica está en números
rojos? - ¿Qué objeto sería más sospechoso encontrar en el trineo?

Separar: - Preguntas de conocimiento/habilidad que pueden puntuar. -
Preguntas de personalidad o humor que solo sirven para diversión y
votación.

## 7.3 Memory Gifts --- Memoria del desastre

**Tipo:** individual o cooperativo.\
**Mecánica:** encontrar pares de regalos, personajes u objetos en una
cuadrícula.

Variantes: - Individual: minimizar movimientos y tiempo. - Cooperativa:
los jugadores alternan turnos y comparten el objetivo. - Añadir
dificultad configurable.

Evitar nombres que puedan trivializar problemas reales de salud o
consumo.

## 7.4 La fábrica de los inútiles

**Tipo:** cooperativo de 3--5 jugadores.\
**Mecánica:** cadena de producción con tareas distintas: seleccionar,
envolver, etiquetar y transportar regalos.

Requisitos: - Cada jugador recibe una función. - Los regalos pasan por
estaciones. - Errores reducen la calidad del producto. - El equipo debe
alcanzar una meta antes de terminar el tiempo. - Debe existir un modo
asincrónico simplificado o contribuciones por turnos si no coinciden
conectados.

## 7.5 El regalo imposible

**Tipo:** cooperativo de 2--5 jugadores.\
**Mecánica:** transportar un regalo grande controlado por varios
jugadores. Cada integrante influye en una parte del movimiento. Deben
coordinarse para llegar a la meta.

## 7.6 Escape del Polo Norte

**Tipo:** cooperativo de 2--5 jugadores.\
**Mecánica:** cada jugador recibe pistas diferentes. El equipo debe
compartir información para resolver acertijos.

Implementar primero como experiencia por turnos/asíncrona si el tiempo
real añade demasiada complejidad.

## 7.7 Desactivación de la máquina navideña

**Tipo:** cooperativo de información asimétrica.\
**Mecánica:** un jugador ve el dispositivo; otros reciben manual,
códigos o pistas. Deben comunicarse para desactivarlo antes del tiempo
límite.

Debe tener tutorial claro y diseño accesible. Es una función posterior
al MVP.

## 7.8 Guerra de bolas de nieve

**Tipo:** equipos, 4--10 jugadores.\
**Mecánica:** defender una base, coordinar ataques y capturar objetivos.
Puede implementarse como juego por rondas antes de intentar tiempo real.

------------------------------------------------------------------------

# 8. Cooperación y eventos colectivos

## 8.1 Reglas de cooperación

-   Las tareas deben repartir responsabilidades.
-   Mostrar qué aportó cada integrante.
-   Dar recompensa individual por contribución y recompensa de equipo
    por éxito.
-   No permitir que un solo jugador acapare toda la recompensa.
-   Permitir reingresar a una misión si la ventana sigue abierta.
-   Definir claramente qué ocurre cuando un jugador abandona una
    partida.
-   Guardar progreso de misión de manera segura.

## 8.2 Misiones globales

Ejemplos: - Salvar la Navidad: reunir energía para encender el árbol. -
Huelga de duendes: completar tareas para negociar un acuerdo. -
Operación panetón: encontrar ingredientes dispersos. - Auditoría del
Polo Norte: revisar documentos y detectar errores. - El reno
desaparecido: reunir pistas entre todos.

## 8.3 Cooperación con traición

Crear eventos especiales de sabotaje controlado: - Un participante
recibe un objetivo secreto. - Debe dificultar discretamente una misión
sin bloquearla por completo. - Al final, el equipo vota quién cree que
fue el saboteador. - Se premia la deducción y la participación, no el
daño extremo.

Límites: - El sabotaje no debe borrar progreso ya ganado. - No debe
poder expulsar o bloquear permanentemente a un jugador. - No debe
permitir que alguien arruine la temporada de los demás. - No debe
exponer información privada.

------------------------------------------------------------------------

# 9. Sistemas sociales y humor

## 9.1 Votaciones: «¿Quién es más probable que...?»

El sistema presenta una pregunta y cada participante vota por una
persona del grupo.

Ejemplos: - ¿Quién vendería los regalos para pagar sus deudas? - ¿Quién
sobreviviría menos tiempo en un apocalipsis zombi ficticio? - ¿Quién
sería despedido primero de la fábrica? - ¿Quién dice «ya estoy llegando»
cuando aún está en casa? - ¿Quién traicionaría al equipo por un panetón?

Flujo: 1. Mostrar pregunta y reglas. 2. Permitir un voto por
participante. 3. No permitir votar por uno mismo, salvo que la pregunta
lo permita expresamente. 4. Ocultar resultados hasta el cierre. 5.
Mostrar resultado animado y comentario sarcástico preaprobado. 6. Crear
tarjeta compartible si el jugador permite compartir su nombre/resultado.

Las votaciones no deben usarse para acosar repetidamente a una persona.
Limitar frecuencia, rotar categorías y permitir reportar o excluir
preguntas.

## 9.2 Confesionario

Los jugadores responden preguntas humorísticas de forma anónima.

Ejemplos: - ¿Cuál es la mentira más absurda que dijiste para evitar un
plan? - ¿Qué defecto ficticio te haría despedir Santa? - ¿Qué harías si
fueras invisible durante una hora?

Opcionalmente, los demás intentan adivinar quién escribió cada
respuesta.

Requisitos: - No pedir confesiones de delitos, datos íntimos, secretos o
información sensible. - Permitir omitir preguntas. -
Moderación/reportes. - El anonimato debe explicarse con honestidad: no
prometer anonimato absoluto frente al administrador o registros
técnicos. - No publicar respuestas fuera del grupo sin consentimiento.

## 9.3 Roast Battle

Duelo de humor entre dos participantes.

Flujo: 1. Elegir dos participantes voluntarios. 2. Presentar una
situación ficticia. 3. Cada jugador escribe una respuesta breve. 4.
Mostrar ambas respuestas sin alterar el texto. 5. El grupo vota. 6.
Mostrar ganador y tarjeta de resultado.

Ejemplo de situación: «Santa necesita despedir a alguien de su fábrica».

Reglas: - Ambos participantes deben aceptar el duelo. - Permitir salir
antes de enviar la respuesta. - Límite de caracteres. - Reportar
contenido. - No usar ataques sobre apariencia, salud, traumas, situación
económica, origen, religión, orientación o secretos. - Moderar insultos
discriminatorios, amenazas y acoso. - No permitir campañas de votación
automatizada.

## 9.4 Cartas del desastre

Crear un sistema original de cartas combinables: - Carta de situación. -
Carta de respuesta. - Carta de giro inesperado.

Ejemplos de cartas originales: - «Despido navideño: has sido despedido
por incompetencia emocional». - «Carbón premium: no mereces regalos,
pero tampoco mereces tanto». - «Auditoría sorpresa: explica por qué
desaparecieron 40 regalos». - «Reunión obligatoria: nadie sabe para qué,
pero todos perderán una hora».

Las cartas deben ser editables por el administrador y revisables antes
de publicarse. No copiar textos ni ilustraciones de juegos existentes.

## 9.5 Batallas de memes

-   Presentar una situación o plantilla.
-   Cada participante crea una frase o meme.
-   Los demás votan.
-   Mostrar ganador y finalistas.
-   Empezar con plantillas propias o de uso permitido.
-   Limitar tamaño y tipo de archivos.
-   Revisar imágenes subidas y permitir reportes.
-   No permitir imágenes íntimas, datos personales ni contenido de
    terceros sin autorización.

## 9.6 Ranking de la vergüenza

Crear reconocimientos semanales y finales, por ejemplo: - El problema
del grupo. - Decepción navideña. - Judas del Polo Norte. - Desaparecido
en combate. - Lengua de acero. - Hijo favorito de Santa. - Resurrección
navideña. - Mejor compañero. - Cerebro de la operación. - Coleccionista
de fracasos.

Los títulos deben ser configurables y no humillar de forma persistente a
la misma persona. Mezclar reconocimientos negativos ficticios con
premios positivos y de participación.

------------------------------------------------------------------------

# 10. Viralidad y contenido compartible

## 10.1 Chaos Moments

Generar tarjetas visuales automáticamente para: - Victoria inesperada. -
Derrota graciosa. - Récord personal. - Premio semanal. - Resultado de
votación. - Mejor roast. - Remontada. - Logro desbloqueado.

Cada tarjeta: - Identidad visual pixel art. - Nombre o alias solo si el
usuario lo permite. - Resultado. - Frase breve. - Marca CHRISTMAS
CHAOS. - QR o enlace público opcional. - Formato vertical 9:16 para
historias y TikTok; también cuadrado 1:1.

No publicar automáticamente. El jugador debe elegir compartir.

## 10.2 Generador de memes

-   Iniciar con 15--20 plantillas originales.
-   Campo superior/inferior o texto configurable.
-   Vista previa.
-   Exportación como imagen.
-   Compartir mediante Web Share API cuando esté disponible y permitir
    descarga normal como alternativa.

## 10.3 Resumen semanal

Generar una página/tarjeta con: - Jugador competitivo. - Mejor
colaborador. - Mayor remontada. - Roast ganador. - Meme de la semana. -
Equipo destacado. - Evento colectivo completado.

No mostrar datos privados ni contenido reportado.

## 10.4 Retos públicos

Crear enlaces para que alguien externo pruebe una demo o desafío
limitado sin registrarse. Para guardar récord o participar en temporada
debe iniciar sesión y tener invitación válida.

------------------------------------------------------------------------

# 11. Progresión, puntos y recompensas

Separar estrictamente tres monedas/progresos:

## 11.1 XP

-   Sirve para subir de nivel.
-   Se obtiene por jugar y completar actividades.
-   No determina por sí solo el ranking competitivo.
-   No se pierde por inactividad.

## 11.2 Monedas

-   Sirven para cosméticos y objetos visuales.
-   Se obtienen mediante actividades, misiones y logros.
-   No se compran con dinero real en esta versión.
-   No dan ventaja en minijuegos ni ranking.

## 11.3 Puntos competitivos

-   Alimentan el ranking individual y por equipos.
-   Se otorgan por resultados validados.
-   Tienen límites diarios y por actividad.
-   No se obtienen por votar repetidamente ni por comprar objetos.
-   Deben evitar el incentivo de repetir una actividad ilimitadamente
    para farmear puntos.

## 11.4 Reglas de puntuación

-   Definir una tabla de puntuación centralizada en servidor.
-   Establecer máximo diario por actividad.
-   Considerar solo el mejor resultado válido del día o un número
    limitado de intentos.
-   Recompensar participación y resultado con componentes separados.
-   No premiar de forma desproporcionada la disponibilidad horaria.
-   Registrar cada cambio de puntuación en un ledger inmutable.
-   No permitir que el cliente escriba directamente su saldo o
    puntuación.

## 11.5 Ranking

Vistas: - Individual. - Equipos. - Cooperación. - Social/creatividad. -
Logros.

El ranking por equipos debe usar promedio normalizado de los puntos de
sus integrantes activos/elegibles, con reglas visibles y definidas desde
el inicio.

## 11.6 Tienda

Objetos cosméticos: - Sombreros. - Trajes. - Efectos visuales. -
Mascotas. - Emotes. - Marcos de perfil. - Decoraciones de avatar.

Objetos humorísticos: - Calcetín sospechoso. - Carta de renuncia. -
Regalo vacío. - Certificado de incompetencia. - Diploma de empleado del
mes. - Bigote de Rudolf.

Ningún objeto comprado con monedas debe dar ventaja competitiva.

------------------------------------------------------------------------

# 12. Economía y recompensas finales

La temporada debe cerrar con una ceremonia. Premios posibles: - Campeón
individual. - Equipo campeón. - Mejor colaborador. - Mejor estratega. -
Mejor roast. - Mejor meme. - Mayor remontada. - Mejor espíritu
navideño. - Coleccionista. - Récord arcade.

Los premios materiales o de intercambio de regalos se definen por el
organizador. La aplicación debe permitir configurar categorías,
ganadores y descripciones, sin asumir que todos los premios son dinero.

------------------------------------------------------------------------

# 13. UX y pantallas

## 13.1 Pantallas públicas

-   Landing con identidad del juego.
-   Invitación/código de acceso.
-   Inicio de sesión.
-   Registro o acceso por enlace mágico, según configuración.
-   Página de reglas y privacidad.

## 13.2 Pantallas autenticadas

1.  Onboarding y creación de avatar.
2.  Plaza central.
3.  Perfil del jugador.
4.  Mapa/zonas.
5.  Arcade.
6.  Detalle de minijuego.
7.  Resultado de partida.
8.  Misiones individuales.
9.  Misiones cooperativas.
10. Detalle de equipo.
11. Ranking.
12. Tablón del caos.
13. Votaciones.
14. Confesionario.
15. Roast Battle.
16. Batallas de memes.
17. Mercado negro/tienda.
18. Inventario.
19. Logros.
20. Resumen semanal.
21. Salón de trofeos.
22. Ajustes de privacidad y humor.

## 13.3 Panel de administrador

-   Crear/editar temporada.
-   Invitar participantes.
-   Asignar o reasignar equipos antes de iniciar.
-   Activar/desactivar juegos.
-   Crear preguntas, cartas y plantillas.
-   Programar eventos y misiones.
-   Revisar reportes.
-   Moderar contenido.
-   Ajustar puntos mediante operaciones auditadas.
-   Ver actividad y métricas.
-   Cerrar temporada y publicar ganadores.

El panel admin debe estar protegido por rol y nunca confiar en ocultar
botones en el frontend como única seguridad.

## 13.4 Diseño mobile-first

-   Navegación inferior con 4--5 accesos principales.
-   Botones grandes y cómodos.
-   Texto legible.
-   Evitar tablas densas en móvil.
-   Juegos adaptados a pantalla táctil.
-   No depender de hover.
-   Estados claros de carga, error, vacío y éxito.
-   Accesibilidad básica: contraste, foco, etiquetas y navegación por
    teclado cuando corresponda.

------------------------------------------------------------------------

# 14. Arquitectura técnica

## 14.1 Stack

-   Next.js App Router.
-   React.
-   TypeScript en modo estricto.
-   Tailwind CSS.
-   Componentes accesibles; shadcn/ui si ya está integrado o aporta
    valor.
-   Supabase Auth.
-   Supabase PostgreSQL.
-   Supabase Storage para assets subidos que realmente se necesiten.
-   Supabase Realtime solo para funciones que requieran actualizaciones
    en vivo.
-   Vercel para despliegue.
-   Phaser 3 únicamente para minijuegos arcade que necesiten
    canvas/física.
-   React para trivia, votaciones, memoria, cartas, formularios y la
    mayoría de pantallas.

No introducir: - Microservicios. - Kubernetes. - Redis salvo necesidad
demostrada. - n8n. - Sistemas de IA generativa obligatorios. -
Dependencias grandes para funciones que se resuelven con React y SQL.

## 14.2 Estructura de carpetas sugerida

Adaptar a lo que ya exista; no duplicar estructuras innecesariamente.

``` text
src/
  app/
    (public)/
      page.tsx
      invite/
      login/
    (game)/
      layout.tsx
      plaza/
      arcade/
      missions/
      teams/
      rankings/
      chaos/
      shop/
      profile/
      trophies/
    admin/
    api/
  components/
    layout/
    rpg/
    ui/
    social/
    games/
  features/
    auth/
    season/
    profiles/
    teams/
    scoring/
    missions/
    games/
    voting/
    confessions/
    roast/
    memes/
    moderation/
    rewards/
  lib/
    supabase/
    auth/
    validations/
    scoring/
    permissions/
    rate-limit/
    utils/
  types/
supabase/
  migrations/
  seed.sql
public/
  sprites/
  maps/
  backgrounds/
  items/
  audio/
```

## 14.3 Separación de responsabilidades

-   Componentes React: presentación e interacción.
-   Server Actions o Route Handlers: operaciones de negocio.
-   Módulos de dominio: validación, scoring, reglas de juego.
-   PostgreSQL: persistencia, constraints y transacciones.
-   RLS: autorización de acceso a datos.
-   Supabase Realtime: actualizaciones puntuales.
-   No colocar reglas de puntuación únicamente en el navegador.

## 14.4 Variables de entorno

Crear `.env.example` con nombres, nunca secretos reales:

``` env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

La `SERVICE_ROLE_KEY` solo puede utilizarse en servidor. Nunca exponerla
en componentes cliente, logs públicos o variables `NEXT_PUBLIC_*`.

------------------------------------------------------------------------

# 15. Modelo de datos inicial

Diseñar migraciones SQL versionadas. Usar UUID, timestamps, claves
foráneas, índices, constraints y políticas RLS. Los nombres pueden
ajustarse, pero mantener las relaciones y reglas.

## 15.1 Tablas base

### `seasons`

-   `id`
-   `name`
-   `slug`
-   `description`
-   `starts_at`
-   `ends_at`
-   `timezone`
-   `status` (`draft`, `active`, `completed`)
-   `settings` JSONB
-   `created_at`

### `profiles`

-   `id` FK a `auth.users`
-   `username` único
-   `display_name`
-   `avatar_config` JSONB
-   `bio` opcional
-   `humor_level`
-   `allow_roast`
-   `allow_public_sharing`
-   `avatar_visibility`
-   `created_at`
-   `updated_at`

### `season_members`

-   `id`
-   `season_id`
-   `user_id`
-   `team_id` nullable
-   `role` (`player`, `admin`)
-   `status` (`invited`, `active`, `inactive`)
-   `joined_at`

### `teams`

-   `id`
-   `season_id`
-   `name`
-   `slug`
-   `color`
-   `emblem`
-   `created_at`

### `games`

-   `id`
-   `slug`
-   `name`
-   `description`
-   `game_type`
-   `is_active`
-   `config` JSONB

### `game_attempts`

-   `id`
-   `season_id`
-   `game_id`
-   `user_id`
-   `team_id` nullable
-   `score`
-   `duration_ms`
-   `result` JSONB
-   `status`
-   `played_at`
-   `validated_at`

### `score_ledger`

-   `id`
-   `season_id`
-   `user_id`
-   `team_id` nullable
-   `source_type`
-   `source_id`
-   `points`
-   `xp`
-   `coins`
-   `reason`
-   `created_at`

El ledger debe ser append-only para usuarios normales. Correcciones
administrativas mediante registros compensatorios auditables.

### `items`

-   `id`
-   `slug`
-   `name`
-   `description`
-   `item_type`
-   `rarity`
-   `price_coins`
-   `asset_path`
-   `is_active`

### `player_items`

-   `id`
-   `user_id`
-   `item_id`
-   `equipped`
-   `acquired_at`

## 15.2 Tablas de misiones y cooperación

### `missions`

-   `id`
-   `season_id`
-   `title`
-   `description`
-   `mission_type` (`individual`, `team`, `global`, `cooperative`,
    `traitor`)
-   `starts_at`
-   `ends_at`
-   `target_value`
-   `reward_config` JSONB
-   `rules` JSONB
-   `is_active`

### `mission_participants`

-   `id`
-   `mission_id`
-   `user_id`
-   `team_id` nullable
-   `role`
-   `contribution`
-   `status`
-   `joined_at`

### `mission_events`

-   `id`
-   `mission_id`
-   `user_id`
-   `event_type`
-   `value`
-   `payload` JSONB
-   `created_at`

### `collective_goals`

-   `id`
-   `season_id`
-   `title`
-   `description`
-   `target_value`
-   `current_value`
-   `starts_at`
-   `ends_at`
-   `status`
-   `reward_config` JSONB

## 15.3 Tablas sociales

### `polls`

-   `id`
-   `season_id`
-   `question`
-   `description`
-   `starts_at`
-   `ends_at`
-   `status`
-   `config` JSONB

### `poll_options`

-   `id`
-   `poll_id`
-   `target_user_id` nullable
-   `label`

### `poll_votes`

-   `id`
-   `poll_id`
-   `voter_user_id`
-   `option_id`
-   `created_at`
-   Constraint única para un voto por usuario y encuesta.

### `confessions`

-   `id`
-   `season_id`
-   `author_user_id` privado
-   `question_id` nullable
-   `content`
-   `status`
-   `created_at`

### `roast_battles`

-   `id`
-   `season_id`
-   `prompt`
-   `player_a`
-   `player_b`
-   `response_a`
-   `response_b`
-   `status`
-   `starts_at`
-   `ends_at`
-   `winner_user_id` nullable

### `roast_votes`

-   `id`
-   `battle_id`
-   `voter_user_id`
-   `voted_for_user_id`
-   `created_at`
-   Constraint única por votante y duelo.

### `meme_entries`

-   `id`
-   `season_id`
-   `author_user_id`
-   `template_id`
-   `text_top`
-   `text_bottom`
-   `image_path` nullable
-   `status`
-   `created_at`

### `meme_votes`

-   `id`
-   `meme_entry_id`
-   `voter_user_id`
-   `created_at`
-   Constraint única por votante y entrada.

### `chaos_events`

-   `id`
-   `season_id`
-   `user_id` nullable
-   `event_type`
-   `payload` JSONB
-   `is_public`
-   `created_at`

### `moderation_reports`

-   `id`
-   `reporter_user_id`
-   `target_type`
-   `target_id`
-   `reason`
-   `details`
-   `status`
-   `reviewed_by`
-   `created_at`

## 15.4 Tablas adicionales según necesidad

-   `achievements`
-   `player_achievements`
-   `notifications`
-   `meme_templates`
-   `questions`
-   `cards`
-   `weekly_summaries`
-   `public_challenges`
-   `admin_audit_log`

No crear todas las tablas antes de que exista una función que las use.
El esquema puede crecer por migraciones pequeñas.

------------------------------------------------------------------------

# 16. Seguridad, integridad y anti-trampas

Esta sección es obligatoria.

1.  Activar RLS en todas las tablas expuestas al cliente.
2.  Los usuarios solo pueden modificar su perfil permitido; no pueden
    cambiar roles, puntos, XP, monedas o pertenencia a equipos por su
    cuenta.
3.  Las escrituras de scoring se hacen desde servidor y se validan.
4.  Usar constraints para evitar votos duplicados, intentos duplicados y
    recompensas duplicadas.
5.  Aplicar rate limiting en login, votaciones, envíos de texto,
    resultados y endpoints sensibles.
6.  Validar longitud, formato y contenido de entradas.
7.  No aceptar un `user_id` arbitrario del navegador como prueba de
    identidad; derivarlo de la sesión autenticada.
8.  Para partidas arcade, validar duración, rangos, límites y coherencia
    del resultado. Firmar sesiones si aporta valor.
9.  Usar transacciones SQL o funciones RPC para actualizar ledger y
    progreso de misión de forma atómica.
10. Nunca confiar en la puntuación calculada únicamente por JavaScript
    del cliente.
11. Guardar auditoría de acciones administrativas.
12. No registrar secretos ni contenido privado innecesario en logs.
13. No publicar confesiones o contenido privado sin consentimiento.
14. Moderación y reportes disponibles en funciones sociales.
15. Proteger endpoints administrativos por rol comprobado en servidor y
    RLS.

El nivel anti-cheat debe ser proporcional a un grupo de 20 personas:
validación robusta y prevención de abuso básico, sin desarrollar un
sistema antitrampas empresarial.

------------------------------------------------------------------------

# 17. Reglas de moderación y consentimiento

Configurar controles de usuario: - `humor_level`: `light`, `friends`,
`chaos`. - `allow_roast`: boolean. - `allow_public_sharing`: boolean. -
`avatar_visibility`: `group`, `public`, `private`.

Reglas: - Participar en roast es voluntario. - Una persona puede
desactivar invitaciones a roast. - Evitar que el sistema seleccione
repetidamente al mismo participante como blanco. - No permitir contenido
discriminatorio, amenazas, doxxing o exposición de información
personal. - Permitir reportar contenido y bloquear interacciones
abusivas. - Los administradores pueden retirar contenido, pero las
acciones deben quedar auditadas. - No prometer anonimato absoluto en el
confesionario. - Compartir externamente requiere confirmación
explícita. - Los resultados sociales deben tener frases predefinidas y
revisadas, no insultos generados libremente por IA.

------------------------------------------------------------------------

# 18. Realtime y asincronía

Usar Supabase Realtime solo donde mejore claramente la experiencia: -
Actualización de progreso de una misión colectiva. - Estado de una sala
cooperativa. - Votación en curso si se necesita mostrar conteos al
cierre. - Notificaciones relevantes.

No usar Realtime para cada movimiento de avatar ni para todo el estado
del juego si no es necesario.

Para salas: - Crear un estado de sala: `waiting`, `active`, `completed`,
`cancelled`. - Guardar participantes y roles. - Validar que un jugador
no esté en dos salas incompatibles. - Gestionar desconexión y
reconexión. - Definir timeout. - Evitar que una desconexión destruya el
progreso.

Para actividades asincrónicas: - Guardar contribuciones parciales. -
Mostrar quién participó. - Definir fecha límite. - Permitir reanudar.

------------------------------------------------------------------------

# 19. Administración y contenido editable

Los siguientes elementos deben poder modificarse desde el panel admin o
desde datos seed/configurados, sin cambiar componentes:

-   Preguntas de trivia.
-   Preguntas de votación.
-   Prompts de roast.
-   Cartas de situación y respuesta.
-   Plantillas de memes.
-   Misiones.
-   Eventos.
-   Frases de NPC.
-   Recompensas.
-   Límites diarios de puntuación.
-   Fechas de temporada.

Crear datos iniciales suficientes para probar la experiencia: - Al menos
30 preguntas de votación. - Al menos 30 preguntas de trivia. - Al menos
20 prompts de roast. - Al menos 20 cartas originales. - Al menos 15
plantillas de meme. - Al menos 6 misiones cooperativas. - Al menos 3
misiones globales.

Todo contenido debe ser original y revisable.

------------------------------------------------------------------------

# 20. Analítica del producto

Registrar métricas útiles y no invasivas: - Usuarios activos por día. -
Participación por modalidad. - Juegos iniciados y completados. - Tasa de
abandono por juego. - Participación cooperativa. - Misiones
completadas. - Votaciones respondidas. - Compartidos voluntarios. -
Tiempo aproximado de sesión. - Reportes de moderación.

No recolectar información que no sea necesaria para el juego. Mostrar al
administrador métricas agregadas.

------------------------------------------------------------------------

# 21. Pruebas y calidad

## 21.1 Pruebas mínimas

-   Autenticación y permisos.
-   Acceso a temporada mediante invitación.
-   Asignación a equipo.
-   Registro de partida.
-   Validación de puntuación.
-   Prevención de votos duplicados.
-   Recompensas sin duplicación.
-   Actualización de misión colectiva.
-   Protección de confesiones.
-   Flujo de reporte y moderación.
-   Vista móvil de las pantallas principales.

## 21.2 Pruebas de aceptación

El MVP no se considera listo hasta que se pueda:

1.  Crear una temporada.
2.  Invitar a 20 participantes.
3.  Registrar e iniciar sesión.
4.  Crear avatar.
5.  Asignar cuatro equipos de cinco.
6.  Entrar a la plaza central.
7.  Jugar un minijuego individual.
8.  Registrar un resultado validado en servidor.
9.  Recibir XP, monedas y puntos según reglas.
10. Ver ranking individual y de equipos.
11. Participar en una misión cooperativa.
12. Ver progreso de una misión global.
13. Responder una votación.
14. Ver resultados al cierre.
15. Reportar contenido.
16. Compartir voluntariamente una tarjeta.
17. Usar la aplicación desde móvil sin errores críticos.

------------------------------------------------------------------------

# 22. Plan de implementación por fases

No construir todo a la vez. Cada fase debe terminar en una versión
ejecutable.

## Fase 0 --- Inspección y cimientos

-   Inspeccionar repositorio.
-   Crear `CLAUDE.md`.
-   Configurar Next.js/TypeScript/Tailwind si falta.
-   Configurar Supabase.
-   Crear `.env.example`.
-   Crear layout responsive.
-   Configurar autenticación.
-   Crear migraciones iniciales.
-   Preparar seed de desarrollo.

**Entregable:** aplicación desplegable con login y sesión.

## Fase 1 --- MVP jugable

Implementar: - Temporada. - Perfiles y avatares simples. - Equipos. -
Plaza central. - NPCs básicos. - Un minijuego individual (Gift Catcher o
trivia). - Registro de intentos. - XP, monedas y puntos. - Ranking
individual y por equipos. - Panel admin básico.

**Entregable:** circuito completo login → plaza → juego → resultado →
recompensa → ranking.

## Fase 2 --- Cooperación

Implementar: - Misiones cooperativas. - Fábrica de regalos. -
Participación por turnos o asincrónica. - Progreso por jugador y
equipo. - Misión global. - Recompensas individuales y colectivas. -
Realtime solo donde sea necesario.

**Entregable:** al menos una misión cooperativa y una misión global
funcionales.

## Fase 3 --- Interacción social y humor

Implementar: - Votaciones «¿Quién es más probable que...?». -
Confesionario. - Roast Battle voluntario. - Reportes y moderación. -
Ranking de la vergüenza. - Frases de NPC contextuales.

**Entregable:** circuito social con controles de consentimiento.

## Fase 4 --- Viralidad

Implementar: - Chaos Moments. - Tarjetas de resultados. - Generador de
memes. - Resumen semanal. - Enlaces compartibles. - Página pública de
reto/demo.

**Entregable:** contenido visual exportable y compartible.

## Fase 5 --- Expansión y cierre de temporada

Implementar: - Más minijuegos. - Escape del Polo Norte. - Información
asimétrica. - Sabotaje controlado. - Eventos especiales. - Tienda
cosmética. - Salón de trofeos. - Ceremonia final.

**Entregable:** experiencia completa de temporada de 30 días.

------------------------------------------------------------------------

# 23. Criterios de desarrollo para Claude Code

-   Mantén TypeScript estricto.
-   Evita `any` salvo justificación documentada.
-   Componentes pequeños y reutilizables.
-   Lógica de negocio fuera de componentes visuales.
-   Validación compartida con Zod o una solución equivalente si ya
    existe.
-   No duplicar reglas de puntuación.
-   No hacer consultas N+1.
-   Crear índices para filtros y joins frecuentes.
-   Manejar estados loading, error, empty y success.
-   Usar transacciones cuando varias escrituras deban ser atómicas.
-   No exponer `service_role`.
-   No dejar botones decorativos que aparenten funcionar.
-   No usar datos falsos en producción. Los mocks deben identificarse
    claramente y vivir en desarrollo/seed.
-   No inventar resultados de minijuegos ni modificar puntuaciones desde
    cliente.
-   Añadir tests a las reglas críticas.
-   Mantener documentación de instalación, desarrollo, migraciones y
    despliegue.
-   Al terminar cada fase, informar: archivos creados/modificados,
    funciones implementadas, pruebas ejecutadas, problemas pendientes y
    cómo probarlo manualmente.
-   No borrar código existente sin explicar por qué.
-   No instalar una dependencia si se puede resolver razonablemente con
    el stack actual.
-   No implementar todas las funciones sociales antes de tener un
    circuito jugable.

------------------------------------------------------------------------

# 24. Definition of Done

Una función se considera terminada únicamente cuando: - Está
implementada y conectada a datos reales. - Tiene validación en servidor
cuando corresponde. - Respeta RLS y permisos. - Tiene estados de carga,
error y éxito. - Funciona en móvil. - Tiene pruebas razonables. - No
tiene controles falsos o decorativos. - Está documentada. - Se ha
probado con al menos dos usuarios cuando la función es multijugador. -
No rompe funciones ya implementadas.

------------------------------------------------------------------------

# 25. Primera tarea concreta para Claude Code

Empieza por **Fase 0 y Fase 1**, no intentes construir todo el documento
de una vez.

Primero: 1. Inspecciona el repositorio y entrega un resumen. 2.
Crea/actualiza `CLAUDE.md` con la visión, stack, reglas de seguridad,
convenciones y fases. 3. Propón la estructura real de carpetas basada en
el repositorio existente. 4. Implementa autenticación, temporada,
perfiles, equipos y plaza central. 5. Construye el primer circuito
jugable completo con un minijuego sencillo. 6. Añade ranking y
puntuación validados en servidor. 7. Deja la base preparada para añadir
cooperación y funciones sociales sin reescribir el núcleo.

**No sacrifiques la calidad visual del primer prototipo.** La plaza
central debe transmitir desde el primer momento que estamos entrando a
un videojuego navideño pixel art, no a un dashboard genérico.

El objetivo final es que 20 amigos quieran entrar todos los días porque
el juego les da algo que hacer juntos, historias que recordar, bromas
internas y momentos que compartir.
