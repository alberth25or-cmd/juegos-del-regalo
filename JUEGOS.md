# Juegos de la temporada Christmas Chaos

Diseño de juego adaptado del documento maestro (`docs/ESPECIFICACION.md`) y de los juegos de
la versión anterior que funcionaron. Las fases dicen cuándo se construye cada uno (`PLAN.md`).

## Monedas y puntos (separados, como pide el documento)

| Qué | Para qué | Cómo se gana | Límite |
|---|---|---|---|
| **XP** | Subir de nivel | Jugar y completar cosas | Sin tope; no se pierde |
| **Monedas** 🪙 | Cosméticos del Mercado negro | Actividades, misiones, logros | Sin ventaja competitiva |
| **Puntos** ⭐ | Ranking individual y de equipos | Resultados validados | Tope diario por actividad |

Reglas del ranking:
- Cada juego cuenta solo el **mejor resultado válido del día** (los demás intentos dan XP, no puntos).
- Puntos = parte por participar + parte por resultado (así faltar un día no te hunde y jugar 100 veces no te salva).
- **Ranking de equipos = promedio de puntos por integrante activo**, no la suma.
- Todo movimiento queda en un libro (ledger) que nadie puede editar; el organizador corrige con movimientos compensatorios que quedan auditados.

## Zonas de Snowville

| Zona | Juegos | Viene de la versión anterior |
|---|---|---|
| 🏛️ Plaza central | NPCs, noticias, misión destacada, día N de 30, calendario | Puerta del día (adviento) |
| 🕹️ Arcade | **Gift Catcher** (F1), Memory Gifts (F2), Aguanta el botón (F2) | "Mantener", minijuego del ogro |
| 🏭 Fábrica de regalos | La fábrica de los inútiles (F2), misión global Encender el árbol (F2) | Muñeco/Mosaico/Fogata colaborativos |
| 🌲 Bosque congelado | Acertijos (F3), Escape del Polo Norte (F5), La cueva del ogro (F5) | Acertijo, Rescate, zona del ogro |
| 🕶️ Mercado negro | Tienda cosmética e inventario (F5) | Tienda y cofre |
| 📌 Tablón del caos | ¿Quién es más probable…?, Confesionario, Roast, Memes, Emoji resumen (F3–F4) | Verdad o mentira, Adivina quién, Meme secreto, Emoji resumen |
| ⚔️ Arena | Duelos, Trivia absurda por equipos, Guerra de nieve, Caza al saboteador (F3–F5) | Duelo, Trivia, Caza al traidor |
| 🏆 Salón de trofeos | Logros, ranking de la vergüenza, cápsula del tiempo, ceremonia (F3–F5) | Insignias, Cápsula, Gran final, Cumplidos |
| 🎁 Amigo secreto | Sorteo, wishlist, pistas diarias, "¿quién te regala?" (F3) | Igual, sin pozo de dinero |

## Gift Catcher — Santa en bancarrota (Fase 1)

- **60 segundos.** Mueves a un duende con el dedo (o con ← →/A D) para atrapar regalos.
- Caen: 🎁 regalo (+10), 🎁 dorado (+25), 🧾 factura de Santa (−15 y te aturde), ⚫ carbón (−10), 📦 caja defectuosa (−5).
- Combo: cada 5 regalos seguidos sin fallar, el multiplicador sube (x2, x3 máx.).
- La lluvia acelera cada 15 s.
- **Validación en servidor:** el servidor crea la partida con una semilla; la secuencia de objetos es la misma en el navegador y en el servidor, así que el servidor sabe el puntaje máximo posible. Rechaza partidas de menos de 55 s, de más de 3 min abiertas, con puntaje imposible o repetidas.
- **Recompensa por partida:** XP = 10 + puntaje/20; monedas = 5 + puntaje/50.
- **Puntos de ranking:** solo el mejor resultado del día: 20 por jugar + hasta 80 según el puntaje (tope 100/día).
- Se puede jugar las veces que quieras; los puntos no suben por repetir.

## Ritmo de la temporada (decidido por Luis el 2026-11-06)

**Todo abierto desde el día 1.** Ningún juego espera "su día": así se puede probar todo
con los amigos en una tarde y nadie se queda con candados. El ritmo de 30 días lo dan:

- **Contenido que rota cada día:** una pregunta nueva de ¿Quién es más probable…?, un
  acertijo nuevo, un tema nuevo de roast, frases nuevas de los NPCs.
- **Topes diarios de puntos:** conviene volver cada día; jugar 5 horas seguidas no sirve.
- **Arcos de la historia** (cambian el tono de los NPCs y la plaza):

| Días | Arco |
|---|---|
| 1–5 | El inicio del desastre |
| 6–10 | Se rompe la amistad |
| 11–15 | La guerra del Polo Norte |
| 16–20 | Nadie es inocente |
| 21–25 | Caos absoluto |
| 26–30 | El juicio final (día 30 = 24 dic: ceremonia y revelación del amigo secreto) |

- **Eventos especiales** (saboteador, doble puntos, juicio final) en el calendario, que el
  organizador también podrá lanzar a mano desde el panel.

Lo que todavía no está construido se muestra como **"Próximamente"** (no es un candado por día).

## Temporada de prueba

Al crear una temporada se puede marcar **🧪 Es una temporada de prueba**. Va aparte de la real:
- sin topes diarios (cada partida suma sus puntos) y sin pretemporada,
- el organizador puede **simular cualquier día** desde el panel (◀ ▶ o atajos día 1/5/10…),
- un aviso 🧪 se ve en la plaza, el mundo y la cabecera para no confundirla con la real.

Al entrar con usuario + PIN se prioriza la temporada real si alguien está en las dos.

El organizador puede cambiar fechas y eventos desde el panel sin tocar código.
