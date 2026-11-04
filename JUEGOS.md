# Cómo se juega — Los Juegos del Regalo

> Documento de diseño de juego. Define qué hace cada agente cada día, qué juego vive en cada zona y las reglas de cada uno.
> Aprobado por Luis el 2026-11-04: una misión al día + extras, y modo prueba con bots (/prueba).

---

## 1. La idea en una frase

Durante 14 días, cada agente cumple **una misión corta al día**, va descubriendo **quién le regala** con pistas diarias y suma puntos. El **top 3 del ranking se lleva el pozo** el día de la entrega.

## 2. Tu día (menos de 2 minutos)

Al abrir la página, la portada muestra **"Tu día"**: una lista de 3 cosas, en este orden.

| # | Qué haces | Tiempo | Dónde |
|---|---|---|---|
| 1 | 🎄 **Abre la puerta del día** (calendario de adviento): recibes una pista nueva sobre quien te regala y ves cuál es la misión de hoy. | 10 s | Árbol del adviento |
| 2 | ⭐ **Cumple la misión del día.** Hay **una sola** misión por día y cambia de tipo cada día. | 1 min | Zona de esa misión |
| 3 | 🗳️ **Vota o adivina lo de ayer** (la mejor foto, cuál era la mentira…). Al cerrar se revelan los resultados y los puntos. | 20 s | Zona de esa misión |

**Opcional, si tienes ganas:** 🎲 una apuesta del día, 🛡️ usar un comodín, 🧌 el minijuego del ogro (1 intento al día).

**Una vez por semana** (hasta 10 min): una misión semanal que da más puntos.

**En cualquier momento:** arriesgar tu sospecha de quién te regala (1 solo intento; mientras antes aciertes, más puntos).

## 3. Calendario de la temporada (ejemplo de 14 días)

| Día | Misión del día | Zona |
|---|---|---|
| Pretemporada | Unirse, votar al custodio, pagar, llenar wishlist + 3 pistas, cápsula del tiempo → **sorteo y revelación** | Varias |
| 1 | 📸 Foto misión | Chocolatada → Galería |
| 2 | 🤥 Verdad o mentira | Chocolatada |
| 3 | 🤪 Emoji resumen | Galería |
| 4 | 🤫 Palabra secreta (WhatsApp) | Chocolatada |
| 5 | 🧠 Trivia del grupo | Inteligencia |
| 6 | 📸 Foto misión | Chocolatada → Galería |
| 7 | 🎭 Adivina quién | Callejón |
| — | **Semanal 1:** 💌 Cadena de cumplidos (días 1–7) | Mirador |
| 8 | 🔍 Caza al traidor | Callejón |
| 9 | 📸 Foto misión | Chocolatada → Galería |
| 10 | 🤥 Verdad o mentira | Chocolatada |
| 11 | 😂 Meme al amigo secreto (WhatsApp) | Galería |
| 12 | 🤪 Emoji resumen | Galería |
| 13 | 🧠 Trivia del grupo | Inteligencia |
| — | **Semanal 2:** ☃️ Duelo de dos (días 8–13) | Mirador |
| 14 / entrega | 🏆 **Gran final:** revelación, votaciones finales, podio, cápsula del tiempo | Bóveda |

Durante toda la temporada: 🕶️ **Agente doble** (misión secreta a 2–3 agentes al azar) y 🧌 el **minijuego del ogro**.

## 4. Los juegos, zona por zona

Formato: **cómo se juega** · tiempo · puntos · cómo se valida.

### Zona 1 · 🍫 Plaza de la Chocolatada (misiones del día)
- **📸 Foto misión.** La página da un tema ("algo rojo cerca de ti"). Tomas una foto con el celular y la subes. Al día siguiente todas las fotos se muestran **sin nombre** en la Galería y cada uno vota su favorita (no la propia). Al cerrar se revela de quién era cada una. · 1 min · +10 por subirla, +20 la más votada, +10 la segunda · votación del grupo.
- **🤥 Verdad o mentira.** Escribes 3 datos sobre ti; uno es falso. Cada día se muestran los de **3 agentes al azar** y el resto adivina cuál es la mentira. · 1 min · +10 por participar, +5 por cada acierto, +15 si engañas a la mayoría · automático.
- **🤫 Palabra secreta.** La página te da una palabra rara ("chirimoya"). Tienes que lograr que alguien la diga en el chat de WhatsApp **sin que se note**. Cuando pase, marcas "¡lo logré!" y eliges quién la dijo; a esa persona le llega "¿dijiste *chirimoya*?" y confirma. · se juega en WhatsApp · +15 si confirman · confirmación de la otra persona.

### Zona 2 · 📸 Galería del Tendedero (creatividad)
- **🖼️ Muro de fotos.** Aquí se vota la Foto misión del día anterior: tocas tu favorita y listo. · 10 s · +20/+10 a los ganadores · votación.
- **🤪 Emoji resumen.** Resumes tu día en 3 emojis. Se muestran los de 3 agentes y el grupo adivina de quién es cada uno. · 30 s · +10 participar, +5 por acierto · automático.
- **😂 Meme al amigo secreto.** Le mandas un meme navideño por privado a quien te toca regalar (**sin firmarlo**). Marcas "enviado" y la otra persona confirma "alguien me mandó un meme". · WhatsApp · +15 · confirmación.

### Zona 3 · ⛸️ Pista de hielo (competencia)
- **🏆 Ranking en vivo.** Siempre visible. Muestra quién sube y quién baja.
- **🎲 Apuestas.** Una vez al día puedes apostar hasta **20 puntos** a una predicción ("¿quién gana la foto de hoy?"). Si aciertas, ganas el doble; si fallas, los pierdes. · 10 s · tope fijo para que el pozo no se defina por suerte.
- **🛡️ Comodines.** Empiezas con 1 y ganas más con rachas. **Escudo** (te protege de un robo), **Robar 10** (le quitas 10 puntos a alguien; se entera, pero no sabe quién fue), **Doble** (duplica los puntos de tu misión de hoy). Cada uno se usa una vez. Nadie baja de 0 y a nadie le pueden robar más de 2 veces por semana.

### Zona 4 · ⏰ Mirador de las Semanales (más puntos, hasta 10 min)
- **💌 Cadena de cumplidos (semana 1).** La página te asigna a una persona y le escribes un mensaje bonito **anónimo**. Todos reciben el suyo el domingo. · 5 min · +30.
- **☃️ Duelo de dos (semana 2).** La página empareja agentes de dos en dos con un reto creativo de 24 h ("el mejor muñeco de nieve con lo que tengas en casa"). El grupo vota al ganador de cada duelo. · 10 min · +30 participar, +20 ganar.
- **⏳ Cápsula del tiempo (pretemporada).** Escribes un mensaje para el grupo que **se abre el día de la entrega**. · 5 min · +30.

### Zona 5 · 🕵️ Oficina de Inteligencia (el misterio)
- **📮 Mi amigo secreto.** Después del sorteo ves, con una animación, **a quién le regalas**, junto con su wishlist y su rango de precio. Solo tú lo ves.
- **❓ ¿Quién te regala?** Cada día se libera **una pista** que escribió tu amigo secreto sobre sí mismo. Cuando creas saberlo, arriesgas **una sola vez**: aciertas el día 1 → +50 · día 7 → +25 · día 13 → +5. Fallar no resta, pero ya no puedes volver a intentar.
- **🧠 Trivia del grupo.** Preguntas sobre ustedes mismos ("¿quién llegó más tarde al último plan?"); las escriben los propios agentes. · 1 min · +5 por acierto.

### Zona 6 · 🔦 Callejón del Traidor (espionaje)
- **🕶️ Agente doble.** A 2–3 agentes al azar les llega una misión secreta ("logra que alguien mande un sticker de gato"). Si la cumplen sin que los descubran: +25. Los demás pueden acusar (1 vez): si acusas bien, +15 para ti. · durante la temporada.
- **🔍 Caza al traidor (día 8).** Un agente al azar es el "saboteador" del día: su misión es responder mal a propósito en la trivia. El grupo vota quién cree que fue. · +20 si el grupo lo descubre; +25 al traidor si nadie lo descubre.
- **🎭 Adivina quién (día 7).** Aparecen frases anónimas escritas por agentes ("de niño me comí una vela") y adivinas de quién es cada una. · 1 min · +5 por acierto.

### Zona 7 · 🧌 Cueva del Ogro Panetonero (minijuego diario, opcional)
- **😴 ¡Que no despierte!** Minijuego de reflejos de 20 segundos: **mantienes presionado** para avanzar mientras el ogro ronca y **sueltas** cuando abre un ojo. Si llegas a los regalos sin que te vea, ganas. · 1 intento al día · +1 a +5 según qué tan lejos llegues.
- **🧩 Acertijos del ogro.** Un acertijo al día, con 3 opciones. · 15 s · +3.
- **🎁 Rescata el regalo (día 10).** Búsqueda del tesoro: el ogro escondió un regalo en una de las zonas de la página. Con 3 pistas lo encuentras tocando el lugar correcto. Los 3 primeros ganan +30, +20 y +10.

### Zona 8 · ☃️ Taller del Muñeco Gigante (colaborativo: ganan todos o nadie)
- **⛄ Muñeco de nieve gigante.** **No hay que hacer nada extra**: cada misión del día que cumple alguien suma una bola de nieve. Si **12 de 15** cumplen la misión de un día, el muñeco se completa y **todos** ganan +5 ese día.
- **🖼️ Mosaico del grupo.** Cada voto que alguien emite destapa una pieza de una imagen secreta (una foto del grupo que sube el organizador). Se revela completa en la gran final.
- **🔥 Fogata del equipo.** Si **todos** entran 3 días seguidos, al día siguiente la misión vale doble para todos.

### Zona 9 · 🏆 Salón de la Fama (logros)
- **🏅 Insignias.** Reconocimientos sin puntos: Madrugador (misión antes de las 9 a. m.), Detective (adivinó a su amigo secreto), Rey del meme, Más votado, Doble agente, El Misterioso.
- **📝 Mis pistas y wishlist.** Editas tu wishlist y tus 3 pistas (antes del sorteo).
- **🎄 Calendario de adviento.** Las 14 puertas: las pasadas abiertas, la de hoy brillando y las futuras con candado.

### Zona 10 · 💰 Bóveda del Pozo (el dinero y la final)
- **💰 El pozo.** Cuánto hay, quién pagó (lo marca el custodio), el reparto del podio y cuánto le toca a cada puesto.
- **🗳️ Custodio.** Votación en pretemporada para elegir quién guarda el dinero (nadie se vota a sí mismo).
- **🏆 Gran final.** Revelación de todos los amigos secretos, votaciones finales (mejor envoltorio, mejor reacción, mejor regalo), podio con los montos y apertura de la cápsula del tiempo.

## 5. Tabla de puntos (resumen)

| Acción | Puntos |
|---|---|
| Cumplir la misión del día | +10 |
| Ganar una votación (1.º / 2.º) | +20 / +10 |
| Aciertos en verdad o mentira, emoji, trivia, adivina quién | +5 c/u |
| Engañar a la mayoría (verdad o mentira) | +15 |
| Palabra secreta o meme confirmado | +15 |
| Misión semanal | +30 |
| Adivinar a tu amigo secreto | +50 → +5 (según el día) |
| Agente doble sin ser descubierto / acusar bien | +25 / +15 |
| Racha de 3 días | +15 |
| Muñeco gigante completado (todos) | +5 |
| Apuesta | ±(hasta 20) |
| Minijuego del ogro | +1 a +5 |

## 6. Modo prueba

Para probar todo sin esperar a que pasen los días ni tocar los datos reales:
- Todo desbloqueado, con un selector para **saltar a cualquier día** (1–14).
- Un grupo simulado de agentes falsos que también "juegan" (suben fotos, votan, responden).
- Los puntos de prueba se guardan solo en tu navegador, con un botón para reiniciar.
