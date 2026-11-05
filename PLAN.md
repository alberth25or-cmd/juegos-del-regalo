# Plan por fases — Christmas Chaos

Cada fase termina en una versión publicada y probable. "Hecho" = conectado a datos reales,
validado en el servidor, con estados de carga/error, probado en móvil y con al menos dos
usuarios cuando es multijugador (ver Definition of Done en `docs/ESPECIFICACION.md` §24).

## Qué se reutiliza de la versión anterior

| Se queda | Cómo |
|---|---|
| Nombre "Los Juegos del Regalo" | Marca del sitio; "Christmas Chaos" es la temporada |
| Arte pixel (capas de la aldea, sprites, cuy, trenes, trineo, cielo por hora de Lima) | Snowville = la aldea animada; las zonas reutilizan sus escenas |
| Ingreso con invitación + PIN, sesión en cookie, BD solo en servidor | Se refuerza: usuario + PIN para cambiar de celular, límites por IP, topes de tiempo |
| Juegos que gustaron | Adaptados a las zonas nuevas (ver `JUEGOS.md`) |
| Amigo secreto (sin pozo de dinero) | Sorteo, wishlist y pistas como evento de la temporada |

Se retira: el pozo de S/150, el simulador con bots en el navegador (`/prueba`) y las 10 zonas
viejas. El código sigue en el historial de git (commit `41735be` y anteriores).

## Fase 0 — Cimientos ✅ objetivo: login y sesión estables

- `CLAUDE.md`, `PLAN.md`, `DECISIONES.md`, `.env.example`, especificación en `docs/`.
- Esquema `cc` (migración 002): temporadas, equipos, jugadores, sesiones, partidas, ledger,
  límites, auditoría. RLS activo, sin acceso público.
- Conexión robusta: postgres 3.4, topes de tiempo por consulta, fetch con reintento.
- Ingreso: crear temporada (organizador), enlace de invitación, registro con usuario + PIN,
  entrar con usuario + PIN en otro celular, bloqueo por intentos, aprobación del organizador.
- BD local (PGlite) + simulación de 20 jugadores simultáneos.

## Fase 1 — MVP jugable: login → plaza → juego → resultado → recompensa → ranking

- Perfil y avatar pixel personalizable.
- 4 equipos: el organizador los arma (manual o reparto al azar equilibrado).
- Plaza central de Snowville con NPCs (Santa, Rudolf, Duende sindicalista, Muñeco de nieve,
  Auditor) y frases revisadas según el día y el progreso.
- **Gift Catcher — Santa en bancarrota** (arcade 60 s, táctil y teclado).
- Partidas validadas en el servidor; XP, monedas y puntos con topes diarios.
- Ranking individual y por equipos (promedio por integrante activo).
- Panel del organizador: temporada, fechas, jugadores, equipos, PIN olvidado, ajustes auditados.

## Fase 2 — Cooperación

- Misión global "Encender el árbol de Snowville" (energía navideña de los 20).
- La fábrica de los inútiles (cooperativo por turnos/asíncrono, roles por estación).
- Memory Gifts (individual y cooperativo por turnos).
- Contribución visible por jugador y por equipo; recompensa individual + de equipo.

## Fase 3 — Social y humor

- ¿Quién es más probable que…? (30+ preguntas), confesionario, roast battle voluntario,
  reportes y moderación, ranking de la vergüenza, ajustes de humor y consentimiento.
- Amigo secreto: sorteo, wishlist, pistas diarias y "¿quién te regala?".

## Fase 4 — Viralidad

- Chaos Moments (tarjetas 9:16 y 1:1), generador de memes (15+ plantillas propias),
  resumen semanal, compartir con Web Share API, demo pública de Gift Catcher.

## Fase 5 — Expansión y cierre

- Escape del Polo Norte, desactivación de la máquina (info asimétrica), sabotaje controlado,
  guerra de nieve por rondas, mercado negro (cosméticos), salón de trofeos, ceremonia final.
