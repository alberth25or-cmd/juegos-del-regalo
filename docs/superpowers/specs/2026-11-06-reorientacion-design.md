# Reorientación de Los Juegos del Regalo: amigo secreto con agentes y stages en orden

**Fecha:** 2026-11-06 · **Estado:** aprobado en conversación (brainstorming con Superpowers)
**Bocetos aprobados:** `docs/superpowers/bocetos/2026-11-06-pantalla-principal-celular.html` (opción B)
y `docs/superpowers/bocetos/2026-11-06-pantalla-principal-computadora.html`.

Convención de este documento:
- **[Decidido]** lo dijo el dueño del proyecto (Cesar) durante la conversación.
- **[Propuesta]** lo puso Claude para completar el diseño. Se puede cambiar sin volver a discutir el resto.
- **[Abierto]** falta que alguien lo decida. Ver §12.

> **Cambio del 2026-11-09 (Luis): todas las casas abiertas + preguntas nuevas cada día.**
> Donde este documento dice que cada stage "se abre en su fecha y solo si superaste el anterior"
> (§2, §3, §3.4, §3.7, §5 "Ritmo", §6, §10.4), ya no aplica: las 5 casas se abren con el
> "Empezar" y cada día salen preguntas nuevas del tema de cada una, que vencen a las 23:59.
> Ya no existe "superar un stage" ni el intervalo entre stages; la única fecha es la de la ficha
> del amigo secreto. Detalle en `DECISIONES.md` (sección del 9 nov).
>
> **También del 2026-11-09 (Luis): una sola moneda y fisgonear.** Donde dice "puntos" (§3.5 y
> siguientes), léase **monedas**: es la única recompensa, el ranking es el saldo y gana quien más
> tenga. La ficha del amigo secreto (§3.6) ya no se abre de golpe al final: se llena con sobres
> cerrados a medida que tu amigo responde, uno gratis por día, y los demás se compran con monedas.
> La ficha final destaca "lo más picante". Detalle en `DECISIONES.md`.

---

## 1. Intención

El proyecto creció hacia un mundo abierto con muchas zonas, equipos, tres monedas y mucho contenido
en paralelo, y quedó confuso. La reorientación lo ordena alrededor de una sola idea:

> **Un amigo secreto con misterio.** Cada participante es un agente anónimo con nombre de comida
> peruana. Durante la temporada avanzan juntos, en orden, por stages temáticos. Las respuestas que
> dan en el camino se convierten en la ficha secreta que recibe quien les regala. Con esa ficha, el
> día del intercambio describen a su amigo secreto para reírse sin decir su nombre.

**Éxito:** nadie se pierde. Siempre está claro qué toca hoy, qué viene después, cómo va cada
uno y quién va ganando.

**Amigo secreto** [Decidido]: es la persona **a la que tú le regalas**, no la que te regala a ti.

## 2. Metas, no-metas y anti-metas

**Metas**
- Una sola forma de entrar y un solo momento para dar los datos: la inscripción.
- Avance lineal por stages con fecha. Lo que viene se ve pero no se puede abrir.
- Un solo ranking individual de puntos, siempre visible. Gana un premio final.
- El anonimato se mantiene durante toda la temporada.

**No-metas**
- Mundo abierto para explorar, como entrada o como forma de elegir actividades.
- Equipos de cualquier tipo [Decidido].
- Manejar dinero dentro de la app [Decidido]. Solo puntos y un "Premio final" descrito con texto.

**Anti-metas** (si pasa esto, fracasa aunque funcione)
- Alguien deduce quién es quién por algo que muestra la app: el panel, la barra, el orden de
  inscripción o el avatar.
- Alguien queda fuera de la historia para siempre por faltar un día.
- Las respuestas íntimas quedan expuestas a más gente de la necesaria.
- Una pantalla genera la duda de "¿y ahora qué hago?".

## 3. Recorrido del jugador, de principio a fin

```
Enlace de invitación ─► Registro ─► Ficha (inscripción) ─► Árbol de espera
                                                                │  organizador: "Empezar"
                                                                ▼
                                       Sorteo (secreto) + se cierra la puerta
                                                                │
 Stage 1 ─► Stage 2 ─► Stage 3 ─► Stage 4 ─► Stage 5 ─► Ficha del amigo secreto ─► Intercambio (en persona)
 (cada stage se abre en su fecha Y si superaste el anterior)
```

### 3.1 Registro
- Se entra **solo** con el enlace de invitación de la sala [Propuesta: es el flujo `/i/CODIGO` que ya existe].
- Cada persona crea un **usuario de acceso + contraseña personales** [Decidido]. [Propuesta: se mantiene
  el PIN de 4 dígitos actual como "contraseña", porque ya está construido con bloqueo por intentos].
- **No escribe ningún nombre visible** [Decidido]. El sistema le asigna al azar un **alias fijo**,
  único en la sala y que no puede cambiar: `Agente_Picarón`, `Agente_Rocoto`, `Agente_Mazamorra`…
  todos con platos típicos peruanos [Decidido]. [Propuesta: una lista de ≥ 50 platos para cubrir la
  capacidad máxima de 40].
- Avatar: se arma la **cabeza** que se verá en la barra de avance [Decidido: "su logo de cabeza creado"].
  [Propuesta: el editor actual se mantiene, con un aviso: "no lo hagas parecido a ti, es un juego de misterio"].

### 3.2 Ficha de inscripción (antes "stage 1")
Es el **pase al árbol** [Decidido]: nadie entra al árbol ni al sorteo sin la ficha completa.
- **3 o 4 opciones de regalo** dentro del presupuesto de la sala (S/40 por defecto; lo configura
  el organizador) [Decidido].
- **Datos breves para describirte**: 4 obligatorios + 1 opcional [Decidido]. [Propuesta de lista:
  género (hombre/mujer/prefiero no decir), ¿usas lentes? (sí/no), estatura (alto/medio/bajo),
  cabello (corto/largo/sin cabello); opcional: "un rasgo que te delate", en texto corto].
- Lo que se escribe en la ficha solo lo verá quien te regale, dentro de su ficha final (§3.6).

### 3.3 Árbol de espera
- Una pantalla con un **árbol navideño** donde aparece la cabeza de cada agente inscrito [Decidido].
- Muestra cuántos agentes van de la capacidad máxima, por ejemplo "14/20 agentes".
- Nadie puede jugar antes de que se empiece [Decidido].
- El organizador aprieta **"Empezar"**. En ese momento: se hace el **sorteo**, se **cierra la
  puerta** (no entra nadie más) y empieza a correr el calendario de stages [Decidido].
- [Propuesta] El sorteo es una permutación sin puntos fijos (nadie se regala a sí mismo) y se hace
  en el servidor dentro de una transacción. Nadie lo ve en la app, ni siquiera el organizador.

### 3.4 Stages
Cada stage se abre **en su fecha Y solo para quien superó el anterior** [Decidido]. Dentro del
stage cada uno juega a su ritmo. Las fechas salen de un **intervalo que configura el
organizador** a partir del "Empezar" [Decidido], y él puede adelantarlas o atrasarlas.

**Superar un stage** = haber hecho **cada actividad del stage al menos una vez** [Decidido].
Faltar a algo cuesta puntos, pero **no te saca de la historia** [Decidido]. En stages con
pregunta diaria, "cada actividad" significa responder al menos una pregunta [Propuesta].

| # | Stage | Contenido | Estado |
|---|---|---|---|
| 1 | **Calentamiento** | Minijuegos que ya existen: Gift Catcher, Memory, Trivia (Juicio del Polo Norte) | Línea [Propuesta], aceptada sin objeción |
| 2 | **La manada** | 1 pregunta por día para todos, 4 opciones. Ganas puntos si coincides con la mayoría. El resultado se ve al cierre del día (23:59, hora de Lima) | [Decidido] |
| 3 | **Amor y relaciones** | Preguntas directas de respuesta corta ("¿cuántas parejas has tenido?", "¿cuántas veces viste esta semana al amor de tu vida?") | [Decidido] |
| 4 | **Picante** | Solo sí o no ("¿eres virgen?", "¿tuviste relaciones la última semana?") | [Decidido] |
| 5 | **Juicio final** | Último reto y cierre del ranking | Contenido [Abierto] |
| 🎁 | **Ficha del amigo secreto** | Se abre para todos el mismo día | [Decidido] |
| — | **Intercambio** | En persona, 24 dic | [Decidido] |

Calendario de ejemplo con intervalo de 5 días y "Empezar" el 25 nov: S1 25 nov · S2 30 nov ·
S3 5 dic · S4 10 dic · S5 15 dic · Ficha 20 dic · Intercambio 24 dic.

**"Paso"** en los stages 3 y 4 [Decidido]: siempre existe, **resta puntos** y la penalidad se
muestra antes de cada pregunta. [Propuesta: responder +10, pasar −5, máximo 2 pases por stage,
todo configurable].

**Consentimiento en el stage 4** [Propuesta, falta confirmar]: antes de entrar, cada agente
confirma que es mayor de edad y que acepta las preguntas picantes. Las respuestas de los stages
3 y 4 se borran al cerrar la temporada.

### 3.5 Puntos y ranking
- **Una sola moneda: puntos** [Propuesta, se sigue de "un solo ranking, sin confusiones"]. XP,
  monedas y tienda salen del alcance.
- **Ranking individual siempre visible** en la barra superior [Decidido]. Gana el premio final
  quien sume más puntos [Decidido].
- Los puntos los escribe **solo el servidor**, con reglas fijas y visibles desde el día 1
  [Decidido]. Se reutiliza el ledger append-only actual.
- [Propuesta] Penalidades: −5 por cada pregunta diaria no respondida en el stage 2, y el "Paso"
  de §3.4. Todas configurables y explicadas en pantalla.
- [Propuesta] Desempate: llega primero quien alcanzó ese puntaje antes.

### 3.6 Ficha del amigo secreto
- Se abre **al final de todos los stages** y solo la ve **quien regala** [Decidido].
- Contiene: el alias de su amigo secreto, sus 3 o 4 opciones de regalo, sus datos breves y sus
  respuestas de los stages 3 y 4. Si pasó una pregunta, aparece "Pasó".
- Lleva la marca: *"Privada y confidencial. Guárdala para describir y reír el día del intercambio"* [Decidido].
- El día del intercambio, quien regala dice "mi regalo es para Agente_Rocoto" y lo describe con la
  ficha [Decidido].
- [Abierto] Quien regala necesita comprar el regalo antes del 24 dic. Si la ficha se abre el 20 dic,
  tiene 4 días. ¿Las opciones de regalo deberían verse antes, por ejemplo apenas se hace el sorteo,
  y solo las respuestas íntimas al final?

### 3.7 Organizador
- Juega como uno más [Decidido].
- **Configuración solo para el creador** [Decidido]: capacidad máxima, intervalo entre stages,
  fechas (adelantar o atrasar), presupuesto del regalo y texto del premio final. [Propuesta: también
  los valores de puntos y penalidades].
- El panel **nunca** muestra el sorteo, nunca relaciona alias con usuario y nunca muestra
  respuestas [Decidido]. Muestra: fechas, capacidad, quién llenó la ficha y el avance.
- Reinicia la contraseña de quien la olvide sin ver nada más [Decidido].
- [Propuesta] La lista para reiniciar contraseñas va **por usuario**. El avance y la ficha se
  muestran **solo por alias**. Nunca se muestran los dos juntos.
- Advertencia honesta que se debe mostrar en las reglas: quien tenga acceso directo a la base de
  datos podría ver los datos. La app no promete anonimato absoluto frente a eso.

## 4. Pantalla principal (dirección visual aprobada)

**Opción B: una tarjeta grande por stage** [Decidido].

- **Barra superior fija** en todas las pantallas de juego: tu alias y tu cabeza, tus puntos y tu
  puesto; la línea de stages con la cabeza de cada agente en el stage donde va (la tuya con marco
  rojo); el ranking.
- **Celular:** la tarjeta del stage actual ocupa el centro, con un solo botón grande ("Responder la
  de hoy"). Los stages siguientes asoman abajo o a los lados, difuminados y con su fecha 🔒. El
  ranking muestra el top 3 y tu puesto.
- **Computadora** [Decidido]: carrusel horizontal. El stage actual va al centro y los vecinos a los
  lados, difuminados y más pequeños; los más lejanos, todavía más borrosos. Se navega con flechas,
  deslizando o con ← →. El ranking cabe completo arriba a la derecha.
- Los stages bloqueados **se pueden mirar pero no abrir** [Decidido].
- Estilo: se mantiene el pixel art y la paleta actual (azul noche, dorado, rojo, crema), con
  tipografía pixel solo en títulos.

## 5. Enfoques considerados

**Pantalla principal:** (A) camino vertical en lista; (B) una tarjeta grande por stage, con
carrusel; (C) mapa pixel en zigzag. **Se eligió B** porque es la más enfocada: imposible perderse.
A mostraba más a la vez y C era más "videojuego", pero tenía menos texto y más riesgo de confusión.

**Juego del stage 2:** se descartó "¿Qué agente es más probable que…?", porque votar por alias
anónimos termina en puntos al azar o por popularidad y al dueño no le pareció justo. Alternativas:
(a) adivinar lo que piensa la mayoría; (b) duelos 1 contra 1 con la misma semilla; (c) misión
colectiva con tope. **Se eligió (a)**: todos responden lo mismo y nadie es blanco de nadie.

**Equipos:** eliminarlos, usarlos solo en algunos juegos o mantenerlos con premio propio.
**Se eliminaron**: un solo marcador, sin dudas sobre qué cuenta para el premio.

**Ritmo:** abrir apenas terminas, abrir por fecha más haber superado el anterior, o abrir a mano.
**Se eligió fecha + superado**, con un intervalo que configura el organizador.

**Orden de inscripción:** la ficha antes del árbol, o el sorteo primero y la ficha después.
**Se eligió la ficha antes**, porque evita fichas vacías después del sorteo y concentra el
ingreso de datos en un solo momento.

## 6. Qué cambia respecto al proyecto actual

| Hoy | Después |
|---|---|
| Portada con 3 caminos (entrar / ver Snowville / crear temporada) | Una entrada para el jugador (enlace de invitación, o usuario + contraseña) y un enlace aparte para el organizador |
| Nombre visible escrito por el jugador | Alias de comida peruana al azar |
| Snowville explorable como pantalla principal (Fase 1.5) | Pantalla de stages (opción B). El arte de Snowville puede reutilizarse como fondo o decoración, no como forma de navegar |
| 4 equipos y ranking por promedio | Sin equipos. Ranking individual |
| XP + monedas + puntos | Solo puntos |
| "Todo abierto + rotación diaria" (decisión del 6 nov) | Stages lineales con fecha |
| "Pozo de dinero: no" (decisión del 5 nov) | Hay premio final para el primero; la app no maneja dinero, solo muestra el texto del premio |
| "¿Quién es más probable…?" | Se retira. Su lugar lo ocupa "La manada" |
| Spec §9.2 / CLAUDE.md regla 7: no pedir datos íntimos | Los stages 3 y 4 sí los piden, con "Paso", visibles solo para quien regala y con borrado al final |
| Aprobación manual del organizador antes de jugar | [Abierto] ¿Se mantiene, o basta la ficha completa más la capacidad máxima? |

Lo que se mantiene: stack (Next.js 16, Postgres en Supabase vía servidor, sin Supabase Auth),
sesión en cookie httpOnly, servidor como única fuente de puntos, ledger append-only, partidas
con semilla validadas en el servidor, temporada de prueba aparte, modo de prueba con "simular día".

## 7. Restricciones

- Mobile-first, pero con diseño de computadora real (carrusel), no un celular estirado.
- Todas las reglas no negociables de `CLAUDE.md` siguen vigentes, salvo la regla 7: se ajusta para
  permitir los stages 3 y 4 con las condiciones de §3.4 y §3.6.
- Capacidad máxima configurable, hasta 40 jugadores.
- Zona horaria `America/Lima`.

## 8. Lo que queda a criterio de quien construya

- Diseño visual del árbol de espera, de la ficha final y de las tarjetas (sesión de diseño de interfaz).
- Animación del carrusel y de las cabezas avanzando.
- Modelo de datos exacto (salas, stages, respuestas, sorteo), siempre que el sorteo y las
  respuestas no se puedan leer desde ningún endpoint del organizador.
- Cómo se migra o se retira el código de Snowville, equipos, energía y votación. No se borra
  nada sin explicar por qué.

## 9. Frentes de trabajo (una sesión cada uno)

Ver `PLAN.md`. En orden: diseño de interfaz → inscripción y árbol → motor de stages y ranking →
contenido de stages → ficha final y panel del organizador. Cada sesión puede usar las skills de
`superpowers/` (brainstorming, writing-plans, etc.) y las demás carpetas de plugins del espacio de
trabajo (`ui-ux-pro-max-skill/`, `ponytail/`) cuando las necesite.

## 10. Pruebas de aceptación de la reorientación

1. Un jugador entra por el enlace, recibe un alias que no eligió y llena la ficha. Sin la ficha
   completa no llega al árbol.
2. En el árbol se ven las cabezas. Nadie juega hasta el "Empezar".
3. El "Empezar" sortea, cierra la puerta y fija las fechas. Ningún endpoint del organizador
   devuelve el sorteo ni las respuestas.
4. El stage 2 no se abre antes de su fecha, ni para quien no superó el stage 1.
5. Faltar un día resta puntos, pero no bloquea el stage siguiente.
6. "Paso" resta los puntos anunciados.
7. El ranking se ve en todas las pantallas de juego y coincide con el ledger.
8. La ficha final la ve solo quien regala y aparece en la fecha configurada.
9. En celular y en computadora la pantalla principal se ve como en los bocetos aprobados.

## 11. Llamadas que hizo Claude (para revisar al leer)

PIN de 4 dígitos como contraseña · lista de ≥ 50 platos · lista de datos breves · +10/−5 y 2 pases
por stage · −5 por pregunta diaria no respondida · desempate por quién llegó primero · solo puntos
(sin XP ni monedas) · 4 opciones fijas en "La manada" · panel por usuario, avance por alias ·
confirmación de mayoría de edad y borrado de respuestas · contenido del stage 1.

### Aclaraciones de la revisión de constructor (llamadas de Claude)
Revisé el documento leyéndolo como si tuviera que construirlo, y estas dudas las resolví así:
- **Quien supera tarde un stage** entra al siguiente apenas lo supera, si su fecha ya pasó.
  Solo se le cobran las preguntas diarias que estuvieron abiertas *para él*, no las de días en
  que todavía no tenía acceso.
- **La ficha del amigo secreto se abre por fecha para todos**, aunque alguien no haya superado
  el stage 5. Sin ella no hay intercambio.
- **Los stages superados se pueden volver a mirar.** Los minijuegos del stage 1 siguen dando
  puntos con el tope diario actual (mejor partida del día), así siempre hay algo que hacer. Los
  stages de preguntas (3 y 4) se responden una sola vez.
- **Quien inscribió la sala y todavía no llenó su ficha no bloquea el "Empezar"**: el organizador
  decide empezar con los que están en el árbol. Quien no llegó a tiempo queda fuera de esa temporada.

## 12. Preguntas abiertas

1. **Opciones de regalo antes del 20 dic** (§3.6). Es la más urgente: afecta si da tiempo de comprar.
2. **Aprobación manual** de cada inscrito por el organizador: ¿se mantiene?
3. **Contenido del stage 5 (Juicio final)**.
4. **Banco de preguntas** de los stages 3 y 4: cuántas por stage y su redacción final.
5. **Confirmación de mayoría de edad y borrado** de respuestas íntimas (propuesto, sin confirmar).
