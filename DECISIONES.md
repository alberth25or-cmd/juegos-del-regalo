# Decisiones del proyecto

## Casa Corazón (2026-11-12, pedido de Luis)

- **Una pregunta bonita por día** (`PREGUNTAS_CORAZON`, 30 elegidas de los bancos "Conocernos de verdad" y
  "Conocerte de verdad" que pasó Luis): sobre uno mismo, de respuesta corta (hasta 120 caracteres), sin
  temas tristes (muerte, despedidas, heridas familiares, dinero). Se dejaron fuera las de "¿quién del
  grupo…?" y "la persona a tu derecha", que son para jugar en persona.
- Va quinta en la aldea (entre Picante y el Juicio); internamente es la casa 6 (respuestas) y la casa n = 7
  de la aldea, porque n = 6 ya era la ficha del amigo secreto.
- Economía: +20 por responder, sin "Paso", vencer cuesta 15, fisgonear un sobre de Corazón 80. Entra al
  bono de estar al día. El equilibrio sigue (tests de economía).
- **Ficha del amigo secreto:** sección Corazón con sus sobres, y en la ficha final **"Lo más bonito"**: sus
  3 respuestas de Corazón más completas (las más largas), abiertas gratis, junto a "Lo más picante".
- Migración `010_corazon.sql` (casa 6 permitida, respuestas hasta 160 caracteres).

---

## Todos juegan todo · confirmación única al inicio (2026-11-12, pedido de Luis)

- **Se quitó la opción de no jugar Picante** (y cualquier "no participo" por casa). La idea de Luis: que
  todos participen en todas las casas.
- **Pantalla de inicio, una sola vez:** antes de llenar la ficha o jugar, cada agente confirma que es
  mayor de edad (18+) y acepta las reglas (hay preguntas de contenido sexual de sí o no, todos juegan
  todo, pasar cuesta monedas, quien te regala puede leer tus respuestas). Sin eso no puede jugar.
  Migración `009_terminos.sql` (`acepta_terminos_at`).
- **Se mantiene "Paso"** (Amor y Picante, con costo y 6 por casa) porque es parte de la economía que
  pidió Luis; no es una forma de no participar.
- Temporadas en curso: a quien antes había elegido no jugar Picante se le cuentan sus preguntas desde el
  día en que acepta las reglas (`picante_desde`), sin cobrarle días anteriores.

---

## Presupuesto, premio y capacidad configurables · Amor y Picante para 30 días (2026-11-12, pedido de Luis)

- **Panel del organizador** (`/diseno/organizador`): presupuesto del regalo, premio final y capacidad
  máxima. Presupuesto y premio pueden quedar en **"lo decide el grupo fuera del juego"** (se guardan como
  null). Se muestran en la ficha de inscripción, la sala de espera, la aldea y la ficha del amigo secreto.
  La capacidad se aplica al inscribirse (tope duro: 50) y no puede bajar de los ya inscritos.
- **Amor y Picante: 60 preguntas cada uno** (30 días con 2 por día). Las 20 nuevas salen del banco de
  300 que pasó Luis. Criterios al elegir: preguntas sobre uno mismo (no "¿quién de aquí…?" ni "señala a…",
  que exponen a terceros y que Cesar ya había descartado), nada de delitos, apariencia, plata o salud, y
  **lo sexual solo en Picante** (que pide confirmar mayoría de edad; Amor no).
- **Orden por lotes** (`LOTES` en `features/casas/reglas.ts`): las preguntas agregadas al final se mezclan
  aparte y van después, así una temporada en curso conserva las preguntas de los días ya jugados.

---

## La manada más atrevida (2026-11-10, pedido de Luis)

Luis vio las 30 preguntas de La manada "demasiado inocentes". Se reemplazaron por 45 nuevas (citas,
ex, crushes, apps, fiestas, celos), aprobadas por él, con ids `m31`–`m75` (alcanzan para 45 días). Las
viejas (`m01`–`m30`) ya no salen, pero se conservan para leer respuestas guardadas. Si una temporada ya
había empezado, la respuesta de La manada de cada día cuenta aunque sea de una pregunta vieja (no se
cobra como vencida ni se puede responder dos veces el mismo día).

---

## Juicio final, Ranking de la vergüenza y Cápsula del tiempo (2026-11-10, pedido de Luis)

- **Juicio final (casa 5):** un dilema por día (`CASOS_JUICIO`). El 2026-11-12 Luis cambió los 30 casos
  navideños "inocentes" por 45 dilemas controversiales (infidelidad, ex, lealtad, código de amigos) que
  dividen al grupo; ids `j31`–`j75`, alcanzan para 45 días.
  ¿Culpable o inocente? Votar da 15 monedas y coincidir con la mayoría del jurado, 15 más (se paga al
  día siguiente, como La manada). Sin "Paso"; dejarlo vencer cuesta 15. Se muestra el veredicto de ayer.
  No va en la ficha del amigo secreto (es opinión, no dato personal).
- **Ranking de la vergüenza:** en la misma casa, premios por alias (más chismoso, más fisgoneado, el que
  más pasó, el más olvidadizo, valiente del Picante, siempre al día, pensamiento de manada, rebelde del
  jurado). Se ve durante la temporada y desde el día de la ficha se titula "Veredicto final".
- **Cápsula del tiempo:** cada agente le deja un mensaje (hasta 400 caracteres, filtrado) a su amigo
  secreto; se puede cambiar hasta el último día de la temporada, que es cuando se abre (el día del
  intercambio, 24 dic). Solo lo lee quien lo recibe (migración `007_capsula.sql`).
- **Arreglo:** si la temporada dura más que el banco de preguntas, se repiten; cada respuesta ahora
  queda atada a su día (`008_respuestas_por_dia.sql`). Antes una pregunta repetida no se podía responder.

---

## El juego de las casas ya es real (2026-11-09, pedido de Luis: "que ya sea para poder jugar")

Conectado a la base de datos (migración `006_casas.sql`, servidor en `src/lib/server/casas.ts`,
reglas puras en `src/features/casas/reglas.ts`, preguntas en `src/features/contenido/casas.ts`):
- **Ficha → árbol → "Empezar"** (en `/diseno/organizador`, solo el organizador): alias para todos,
  sorteo secreto entre quienes tienen ficha, se cierra la puerta y se abren las casas. Si la temporada
  aún no empezaba, **empieza ese día** (así también cuentan las monedas de los minijuegos).
- **Preguntas del día** por casa, en orden propio de cada temporada: La manada 30 días, Amor y Picante
  25 días con 2 por día; después se repiten (hay que agregar más al banco si la temporada es más larga).
- **Cobro perezoso:** vencidas y el +15 de La manada se liquidan la próxima vez que el jugador entra,
  con claves de idempotencia (nunca se cobra dos veces). El saldo puede quedar negativo.
- **Juicio final**: "Próximamente" (falta definir su contenido).
- **Anonimato** (llamadas mías): la cabeza del agente sale del alias, no del personaje de Snowville
  (si no, cualquiera lo reconocería). Las monedas solo se muestran junto a alias: el ranking de
  Snowville pasó a alias, y se quitaron las monedas del perfil público y del panel /admin. El ranking
  que llega al navegador no trae id, usuario, nombre, avatar ni equipo.
- Sin sesión, `/` muestra la vista de ejemplo con un aviso para entrar.

---

## La aldea de casas es la pantalla principal (2026-11-09, pedido de Luis)

- `https://juegos-del-regalo.vercel.app/` muestra la aldea de casas (antes en `/diseno`). Las demás
  pantallas del juego nuevo siguen en `/diseno/*`; `/diseno` redirige a `/`.
- Snowville sigue en `/mundo` y la entrada con usuario o creación de temporada en `/inicio` (enlaces
  "Snowville" y "Entrar" en la barra de arriba). Después de entrar, se vuelve a `/`.
- Ojo: la aldea todavía muestra **datos de ejemplo** (Agente Rocoto, 452 monedas): no está conectada a
  las cuentas hasta construir los frentes 2–5.

---

## Sistema de precios, pases con costo y monedas en todo el juego (2026-11-09, pedido de Luis)

Decisiones de Luis:
- **Pasar una pregunta cuesta monedas y hay un límite de pases.**
- **Aviso al fisgoneado: sí.** "👀 Alguien fisgoneó 2 de tus respuestas hoy", sin decir quién ni cuáles.
- **Un sistema de precios** equilibrado: fisgonear ni regalado ni imposible.
- **Todo el sistema de recompensas con monedas, también en el juego en línea (Snowville).** Se
  acabaron XP y puntos.

Cómo quedó (llamadas mías, todas en `src/features/scoring/economia.ts` con tests de equilibrio en
`tests/economia.test.ts`; la tabla se ve en `/diseno/organizador`):
- **Se gana:** minijuegos hasta 100 por juego y día (20 por jugar + 80 por resultado, mejor partida
  del día) · votar 10 · La manada 10 + 15 si coincides · Amor 20 por pregunta · Picante 30 · Juicio 30
  · bono por estar al día en todas las casas 30. Un día típico ≈ 390 monedas.
- **Cuesta:** fisgonear Manada 50 · Amor 100 · Picante 150. Abrir todo lo de un día (≈ 400) no
  alcanza con un día típico: se puede fisgonear 2 o 3 al día, nunca todo.
- **Pasar:** solo en Amor (40) y Picante (60), siempre más de lo que da responder. **6 pases por casa**
  en toda la temporada.
- **Dejar vencer no es un pase gratis:** en Amor y Picante cuesta lo mismo que pasar y gasta un pase;
  sin pases cuesta el doble. En Manada y Juicio (sin "Paso") vencer cuesta 15.
- **Picante es opcional:** al entrar por primera vez confirmas que eres mayor de edad o eliges "No juego
  Picante" (no ganas ni pagas ahí; tu amigo secreto ve "No juega Picante"). Con pases caros y
  limitados, esta salida protege el consentimiento.
- **Aviso al fisgoneado:** cuántas respuestas tuyas se abrieron hoy, nada más. Como solo quien te
  regala puede fisgonearte, no revela identidades.
- **Snowville:** el servidor escribe solo en `coins`. La migración `005_una_sola_moneda.sql` agrega
  `monedas = points + coins` a `cc.v_totals` (el ledger es append-only: lo que antes eran puntos de
  ranking cuenta como monedas; la XP queda como historia). Ranking, equipos (promedio), energía del
  árbol, votar, perfil y pantallas muestran monedas. En pretemporada se practica sin ganar monedas.

---

## Una sola moneda, ficha progresiva y fisgonear (2026-11-09, pedido de Luis)

Decisiones de Luis:
- **Un solo sistema de recompensa: las MONEDAS.** Se ganan jugando y respondiendo, y se gastan
  fisgoneando. El ranking es tu saldo y quien tiene más monedas al final gana el premio. No hay
  puntos ni XP aparte. Reemplaza "solo puntos" de la reorientación del 6 nov.
- **La ficha del amigo secreto se llena de a poco**, a medida que tu amigo responde.
- **Fisgonear cuesta monedas:** quien quiera ver más respuestas de su amigo secreto paga por cada una.
  El curioso tiene que ganar más monedas, y lo que gasta le baja en el ranking.
- **La ficha final destaca lo más controversial o picante** que respondió.

Llamadas mías (se pueden cambiar; reglas en `src/features/stages/ficha.ts`, con tests):
- **Gratis desde el sorteo:** las opciones de regalo y los datos breves (resuelve §12.1: da tiempo de
  comprar el regalo).
- **Cada respuesta nueva llega como un sobre cerrado** (se ve la pregunta, no la respuesta). Un "Pasó"
  se ve gratis porque no hay nada que mostrar.
- **1 sobre gratis por día**, que tú eliges cuál abrir.
- **Precio por sobre según la casa:** La manada 20 · Amor 40 · Picante 60 monedas. Antes de pagar se
  avisa cuánto bajas ("de 452 a 412") porque las monedas también son tu puntaje.
- **Lo más picante (ficha final, 20 dic):** se abren gratis las 3 respuestas con más puntaje =
  picor de la pregunta × 2 + rareza × 2. El picor (1 a 3) se marca al escribir cada pregunta del banco;
  la rareza sale de qué parte del grupo respondió lo mismo. Lo demás sigue cerrado y se puede seguir
  comprando hasta el intercambio, para que pagar antes valga la pena.
- **Seguridad:** el servidor nunca manda una respuesta cerrada al navegador; cada compra es una fila
  negativa en el ledger, dentro de una transacción y sin cobrar dos veces el mismo sobre.
- **Consentimiento:** en Amor y Picante hay que avisar que tu amigo secreto puede comprar tus
  respuestas durante la temporada (antes solo las veía al final). "Paso" sigue existiendo.
- Pendiente de decidir: aviso al fisgoneado ("👀 alguien fisgoneó 2 de tus respuestas hoy", sin decir
  quién) · cuántas monedas da cada actividad, para equilibrar con los precios.

El juego en línea de hoy (Snowville) todavía usa XP, monedas y puntos por separado; esto aplica al
juego nuevo de las casas. Hecho en `/diseno` con datos de ejemplo.

---

## Todas las casas abiertas + preguntas nuevas cada día (2026-11-09, pedido de Luis)

Luis no quiere niveles bloqueados. **Esta sección manda sobre la reorientación del 6 nov donde choquen**
("stages lineales con fecha + superado").

Decisiones de Luis:
- **Todo desbloqueado desde el "Empezar".** Las 5 casas (Calentamiento, La manada, Amor, Picante,
  Juicio final) se abren el mismo día para todos. No hay candados ni "superar el anterior".
- **Cada día salen preguntas nuevas del tema de cada casa.** La dinámica es diaria: entras, ves qué
  casas tienen preguntas nuevas hoy y las respondes.

Llamadas mías (se pueden cambiar):
- **Cuántas por día** (configurable): Calentamiento = una partida de cada minijuego + trivia del día;
  La manada 1; Amor 2; Picante 2; Juicio final 1 reto.
- **Las de hoy vencen a las 23:59** (hora de Lima) y a medianoche salen las siguientes. Faltar sigue
  restando (la propuesta de −5 por pregunta no respondida se extiende a todas las casas) y nunca
  bloquea nada.
- **La ficha del amigo secreto sí tiene fecha** (20 dic por defecto, la elige el organizador): es el
  final del juego, no un nivel. Se arma con todo lo respondido en las casas durante la temporada.
- **Cada casa muestra su estado del día:** con preguntas nuevas (globo rojo con cuántas faltan,
  humo y corona) o al día (bandera dorada). El riel de la barra ya no dice "hasta dónde llegó cada
  uno": muestra, por casa, quiénes ya están al día hoy.
- **Panel del organizador:** desaparece "días entre stages"; queda la fecha de Empezar y la de la
  ficha. El avance por alias pasa a "Hoy al día: 3/5".
- Picante mantiene la confirmación de mayoría de edad, ahora la primera vez que se entra.
- Hace falta un **banco de preguntas por casa** con al menos una por día de temporada (≈30 para La
  manada, ≈60 para Amor y Picante con 2 por día). Sigue abierto quién las escribe (§12.4 del diseño).

Hecho en `/diseno` con datos de ejemplo (no hay motor con base de datos todavía).

---

## Rediseño festivo "Navidad de juguete" (2026-11-06, pedido de Cesar)

La primera versión del tema (noche sobria) "se veía pobre y sosa". Decisiones de Cesar:
- **Estilo navideño, alegre y que venda.** Se volvió a correr `ui-ux-pro-max`: estilo
  Claymorphism + fuentes Fredoka/Nunito; paleta navideña propia (la base no tenía una).
  Detalle en `design-system/los-juegos-del-regalo/MASTER.md`.
- **Alias sin barra baja:** "Agente Picarón", "Agente Cau Cau". Reemplaza `Agente_<plato>`.
- **Acceso a los juegos en local:** desde el stage 1 se abren Gift Catcher y Memory (modo demo,
  sin base de datos). La Trivia necesita la base de datos y queda marcada así.

Mías: cada stage se dibuja como un regalo (envuelto con etiqueta de fecha si está bloqueado); la
interfaz pasa a clay pero los sprites siguen en pixel art; se agregó una vista previa jugable de
"La manada" en `/diseno/manada` con votos de ejemplo.

---

## Diseño de interfaz — Frente 1 (2026-11-06)

Hecho con la skill `ui-ux-pro-max` (sistema de diseño + guías de UX) y aplicando `ponytail`
(reusar `px-box`, `PixelIcon` y los sprites; sin dependencias nuevas). Detalle y tabla de contrastes:
`design-system/los-juegos-del-regalo/MASTER.md`. Vista con datos de ejemplo en **`/diseno`**.

- **Tema noche** para las pantallas de juego: azul noche, dorado, rojo y crema (la paleta aprobada,
  no la que propuso la herramienta).
- **Rojo de botón `--cta` (#c8304a)** en vez de `--cherry`: con texto crema llega a 4.9:1; `--cherry` no
  pasa 4.5:1 y queda solo como decoración.
- **Tipografía:** Pixelify Sans solo en títulos y cifras; DM Sans en texto (se descartó VT323 por lectura).
- **Riel de avance:** se agrupan las cabezas por stage (1 en celular, 3 en computadora, más "+N"),
  porque con 20–40 agentes no caben una por una.
- **Árbol:** los huecos se reparten al azar con semilla fija y las cabezas se ordenan por alias, para
  no revelar el orden de inscripción.
- **Panel del organizador:** "Avance · por alias" y "Contraseñas · por usuario" en pestañas distintas;
  nunca en la misma vista. "Empezar" pide confirmación porque no se puede deshacer.
- **Íconos nuevos** `heart` (Amor) y `chili` (Picante), en pixel art y sin emojis.

Pendiente para los frentes 2–5: conectar estas pantallas a datos reales. `/diseno` se puede borrar
cuando todas estén conectadas.

---

## Reorientación: amigo secreto con agentes y stages en orden (2026-11-06)

Sesión de brainstorming con Cesar (skill `brainstorming` de Superpowers). Diseño completo:
`docs/superpowers/specs/2026-11-06-reorientacion-design.md`. Bocetos aprobados:
`docs/superpowers/bocetos/`. **Esta sección manda sobre las anteriores donde choquen.**

Decisiones de Cesar:
- **Amigo secreto = la persona a la que TÚ le regalas** (no quien te regala).
- **Alias anónimo, al azar y fijo:** `Agente <comida peruana>` (Agente Picarón, Agente Rocoto,
  Agente Mazamorra…; sin barra baja, ver rediseño festivo). Nadie escribe su nombre. El usuario de acceso y la contraseña sí son personales.
- **La ficha de inscripción es el pase al árbol:** 3 o 4 opciones de regalo dentro del presupuesto
  (S/40 por defecto, configurable) y 4 datos breves para describirte + 1 opcional.
- **Árbol navideño como sala de espera.** Nadie juega antes del "Empezar" del organizador. El
  "Empezar" hace el sorteo y cierra la puerta.
- **Stages lineales y temáticos.** Cada uno se abre en su fecha y solo si superaste el anterior.
  Los siguientes se ven difuminados pero no se pueden abrir. El intervalo entre stages lo
  configura el organizador, contando desde el "Empezar".
- **Superar un stage = hacer cada actividad al menos una vez.** Faltar resta puntos, pero no te
  saca de la historia.
- **Stages:** 1 Calentamiento (minijuegos existentes) · 2 **La manada** (adivinar lo que piensa la
  mayoría; se descartó votar por alias porque no era justo) · 3 **Amor y relaciones** (respuestas
  cortas) · 4 **Picante** (solo sí o no) · 5 Juicio final · Ficha del amigo secreto · Intercambio.
- **"Paso" existe y resta puntos**, con la penalidad explicada en pantalla.
- **Las respuestas íntimas las ve solo quien regala**, al final, en la "Ficha de tu amigo secreto
  — privada y confidencial".
- **Sin equipos.** Un solo ranking individual, siempre visible. Quien suma más puntos gana el
  premio final. **La app no maneja dinero:** solo muestra el texto del premio.
- **El organizador juega como uno más.** Su panel nunca muestra el sorteo, nunca relaciona alias
  con usuario y nunca muestra respuestas. Configura: capacidad máxima, intervalo y fechas,
  presupuesto y premio. Reinicia contraseñas.
- **Pantalla principal = opción B** (una tarjeta grande por stage). En computadora es un carrusel
  con los stages vecinos difuminados y la barra superior con las cabezas y el ranking.

Cambios a decisiones anteriores (por decisión de Cesar):
- "Pozo de dinero: no" (5 nov) → hay premio final para el primero, fuera de la app.
- "Todo abierto + rotación diaria" (6 nov) → stages lineales con fecha.
- Equipos (5 nov) → eliminados.
- Snowville explorable como pantalla principal (Fase 1.5) → reemplazado por la pantalla de
  stages. El arte se puede reutilizar como decoración.
- Spec §9.2 y regla 7 de `CLAUDE.md` (no pedir datos íntimos) → los stages 3 y 4 sí los piden,
  con "Paso" y visibles solo para quien regala.

Supuestos que tomé (se pueden cambiar): el PIN de 4 dígitos sigue como contraseña · lista de ≥ 50
platos · datos breves = género, lentes, estatura, cabello + un rasgo opcional · responder +10,
pasar −5, máximo 2 pases por stage · −5 por pregunta diaria sin responder · solo puntos (sin XP,
monedas ni tienda) · 4 opciones fijas en La manada · confirmación de mayoría de edad antes del
stage 4 y borrado de respuestas íntimas al cerrar la temporada · la ficha final se abre por fecha
para todos.

Pendientes de decidir (ver §12 del diseño): ¿las opciones de regalo se ven antes de la ficha
final, para que dé tiempo de comprar? · ¿se mantiene la aprobación manual de inscritos? ·
contenido del stage 5 · banco de preguntas de los stages 3 y 4.

---

## Reestructuración "Christmas Chaos" (2026-11-05)

Luis entregó un documento maestro nuevo (`docs/ESPECIFICACION.md`) y pidió reconstruir el proyecto.
Respuestas de Luis:
- **Nombre:** se mantiene **Los Juegos del Regalo**; "Christmas Chaos" es el nombre de la temporada.
- **Ingreso:** invitación + usuario + PIN de 4 dígitos (sin correos ni Google).
- **Amigo secreto:** sí. **Pozo de dinero: no** (premios definidos por el organizador).
- **Temporada:** 25 nov → 24 dic de 2026 (30 días, hora de Lima), editable desde el panel.

Supuestos que tomé (se pueden cambiar):
- Equipos: los arma el organizador, a mano o con "repartir al azar equilibrado"; nombres editables.
- Tiempo real con sondeo cada pocos segundos en vez de Supabase Realtime (más simple y robusto).
- Minijuegos en canvas propio en vez de Phaser (menos peso para celulares básicos).
- Esquema nuevo `cc` en la misma base; el esquema viejo `jdr` queda intacto (no se borra nada).
  Los 4 compañeros que se registraron en la versión anterior deben registrarse otra vez.
- Higgsfield está sin créditos (2026-11-05): los NPCs se dibujan en pixel art en código.
  Si Luis recarga créditos, se reemplazan por arte generado.

Mundo explorable (respuestas de Luis, 2026-11-05):
- Vista **desde arriba estilo RPG**; se camina **tocando a dónde ir**.
- Interacción: **emotes y frases rápidas**, **chat libre corto** (60 letras, filtro y reportes)
  y **tocar a alguien para ver su perfil**.
- Arte: Luis **recargará créditos de Higgsfield**; mientras tanto, arte en código.
- Riesgo aceptado: los canales de Realtime son públicos con la clave pública (el id de la
  temporada es un UUID imposible de adivinar). El chat oficial lo difunde el servidor.

Ritmo y pruebas (respuestas de Luis, 2026-11-06):
- **Todo abierto + rotación diaria:** sin candados por día; el ritmo lo dan el contenido que
  rota, los topes diarios y los eventos especiales (que el organizador puede lanzar a mano).
- **Temporada de prueba aparte:** sin topes, con día simulado y puntos separados de la real.

---

## Versión anterior (2026-11-04)

Registro de lo acordado con Luis. Fecha de inicio del registro: 2026-11-04.

## Estética
- **Pixel art es el estilo dominante.** Neobrutalismo, expediente secreto y Wrapped se dibujan en pixel.
- Arte generado con Higgsfield (Nano Banana Pro) y procesado con `scripts/process-art.mjs` (ver `ARTE_LICENCIAS.md`).
- La atmósfera cambia según la hora real de Lima (amanecer, día, atardecer, noche).
- Portada con "desglose" vertical (scroll) y, debajo, **10 zonas de juegos** al estilo de Santa Tracker (solo mecánicas; arte propio).

## Acceso de usuarios
- **Sin contraseñas ni cuentas.** Se entra por enlace de invitación del grupo.
- Cada agente recibe una **llave secreta** guardada en una cookie protegida (`httpOnly`) y un **código de rescate** corto para cambiar de dispositivo.
- **PIN de 4 dígitos (decidido 2026-11-04):** cada agente crea su PIN al unirse. Se pide al entrar desde un dispositivo nuevo o al usar el código de rescate. Se guarda con hash en el servidor y con límite de intentos (bloqueo temporal tras varios fallos).
- El organizador **aprueba a cada miembro** antes del sorteo (evita perfiles falsos).

## Datos y puntos
- Base de datos y fotos en **Supabase** (región São Paulo). Toda la lógica sensible pasa por el servidor; el cliente nunca lee la base directamente.
- Los puntos son un **libro de movimientos** (`points_ledger`); el ranking es la suma. El organizador puede anular movimientos.
- El emparejamiento del amigo secreto solo existe en el servidor.

## Infraestructura
- Código en GitHub, repo **privado** `alberth25or-cmd/juegos-del-regalo` (rama `main`).
- Hosting en **Vercel**, proyecto `juegos-del-regalo` enlazado al repo: cada push a `main` se publica solo.
- En línea en **https://juegos-del-regalo.vercel.app** (publicado 2026-11-04). Producción pública; las versiones de prueba (previews) piden login de Vercel.
- **Supabase** instalado desde Vercel (2026-11-04): base `supabase-almond-desert`, plan gratuito, región **São Paulo**. Sus 16 variables llegaron a Vercel como sensibles (producción y previews).
- Funciones de Vercel en **São Paulo (`gru1`)**, la misma región que la base de datos.
- Para desarrollo local, las claves van en `.env.local` (lo crea Luis copiando el snippet de Supabase; nunca se sube a git).

## Pendientes
- Dominio propio (opcional).
- Premios finales (los define el organizador en el panel).
