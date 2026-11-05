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

## Calendario (25 nov → 24 dic, hora de Lima)

| Días | Arco | Qué se abre |
|---|---|---|
| 1–5 | El inicio del desastre | Avatares, equipos, Gift Catcher; día 5: evento "Primera auditoría" |
| 6–10 | Se rompe la amistad | Votaciones, confesionario; día 10: primer roast |
| 11–15 | La guerra del Polo Norte | Fábrica de los inútiles, misión del árbol; día 15: guerra por equipos |
| 16–20 | Nadie es inocente | Memes, sabotaje controlado; día 20: caza al saboteador |
| 21–25 | Caos absoluto | Eventos especiales y remontadas; día 25: doble puntos |
| 26–30 | El juicio final | Últimos retos; día 30 (24 dic): ceremonia y revelación del amigo secreto |

El organizador puede cambiar fechas y eventos desde el panel sin tocar código.
