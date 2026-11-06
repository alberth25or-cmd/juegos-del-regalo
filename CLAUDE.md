@AGENTS.md

# Los Juegos del Regalo — temporada "Christmas Chaos"

Juego social web multijugador para 20 a 40 amigos (4 equipos) durante una
temporada navideña de 30 días (25 nov → 24 dic, hora `America/Lima`). Mundo
RPG pixel art (Snowville) con minijuegos, cooperación, votaciones, humor negro
consensuado y amigo secreto. El documento maestro es la fuente de verdad:
`docs/ESPECIFICACION.md`. Decisiones y supuestos: `DECISIONES.md`. Plan: `PLAN.md`.

## Stack real (y por qué difiere del documento)

- Next.js 16 App Router (`cacheComponents: true`), React 19, TypeScript estricto, Tailwind v4.
  Leer `node_modules/next/dist/docs/` antes de usar APIs de Next: esta versión cambia cosas.
- Supabase **solo como Postgres** (región São Paulo), vía `postgres` **3.4.x** desde el
  servidor. NO actualizar a postgres 4: se cuelga con consultas en paralelo detrás del pooler.
- **Sin Supabase Auth**: ingreso con invitación + usuario + PIN de 4 dígitos (decisión de
  Luis; el plan gratis de Supabase solo manda ~2 correos/hora). Sesión = token aleatorio en
  cookie httpOnly; en la BD solo su HMAC.
- **El navegador nunca habla con la BD.** Todo pasa por Route Handlers (`src/app/api/**`).
  RLS está activado en todas las tablas sin políticas, y `anon`/`authenticated` no tienen
  permisos: aunque alguien tenga la URL pública de Supabase, no puede leer nada.
- Tiempo real del MUNDO (Snowville explorable): Supabase Realtime, un canal por sala
  (`snow:<seasonId>:<sala>`), presencia + broadcast. Por la red solo viaja "voy de A a B"
  (cada celular calcula el mismo camino con A*), emotes, frases y saludos. El chat pasa por
  `/api/mundo/chat` (filtro + guardado + reporte) y el servidor lo difunde. Sin Supabase
  (en local) se usa BroadcastChannel entre pestañas. Ranking y noticias siguen con sondeo corto.
- Minijuegos arcade en `<canvas>` propio (sin Phaser) para que carguen rápido en celulares básicos.
- Despliegue: Vercel (funciones en `gru1`). Las migraciones corren solas en cada build.

## Estructura

```
db/migrations/        SQL versionado (001 = versión vieja en schema jdr; 002+ = schema cc)
scripts/              migrate.mjs, process-art.mjs, db-local.mjs, sim-20.mjs (prueba de carga)
src/app/              rutas; api/** = operaciones de negocio (JSON)
src/features/<dominio>/   reglas puras (scoring, juegos, temporada) — sin React, con tests
src/lib/server/       db, sesión, seguridad, rate limit, consultas (import "server-only")
src/lib/cliente/      fetch con timeout + reintento para el navegador
src/features/mundo/   mapas (Snowville + submundos) y rutas A* — puros, con tests
src/components/mundo/ motor canvas, arte en código, personajes, red en vivo, interfaz
src/components/       rpg/ (NPCs, avatar, retratos), games/, ui/, village/ (solo el cielo por hora: Sky)
tests/                node:test (`npm test`)
```

## Reglas no negociables

1. Puntos, XP y monedas solo los escribe el servidor, en `cc.score_ledger` (append-only:
   un trigger impide UPDATE/DELETE). Las correcciones son filas compensatorias auditadas.
2. La identidad sale SIEMPRE de la cookie de sesión, nunca de un id enviado por el navegador.
3. Partidas arcade: el servidor crea la partida (semilla + hora de inicio), valida duración,
   puntaje máximo posible para esa semilla y límites diarios. No confiar en el cliente.
4. Toda escritura múltiple va en una transacción (`sql.begin`).
5. Toda consulta tiene tope de tiempo (`conTope` en `db.ts`): nunca más "cargando" infinito.
   Toda llamada del navegador usa `api()` de `src/lib/cliente/api.ts` (timeout + reintento + error claro).
6. Admin = rol comprobado en el servidor en cada operación; ocultar botones no es seguridad.
7. Humor: catálogo de frases revisadas en `src/features/contenido/`. Nada de texto ofensivo
   generado al vuelo. Sin bromas sobre características protegidas, salud, tragedias, apariencia,
   pobreza o secretos. Participar en roast es voluntario.
8. No dejar botones decorativos que parezcan funcionar: lo que no existe se muestra como
   "Se abre el día N" o "Próximamente", deshabilitado.
9. Pixel art dominante (ver memoria): ante conflicto visual gana el pixel art. Nada copiado de
   juegos o marcas existentes (Santa Tracker, Mario Party, Palomo Games, etc.).
10. Mobile-first: navegación inferior, botones ≥ 44 px, sin depender de hover, estados de
    carga/error/vacío/éxito en cada pantalla.

## Comandos

- `npm run dev` — desarrollo (sin `.env.local` corre sin BD; con `npm run db:local` usa una BD local).
- `npm run db:local` — Postgres local en memoria (PGlite) en el puerto 54329 para probar.
- `npm test` — tests de reglas críticas.
- `npm run sim` — simula 20 jugadores a la vez contra un servidor LOCAL (nunca contra producción). `SIM_N=40 npm run sim` para 40.
- `npm run build` — migraciones + build.

## Commits

Mensajes en español, terminando con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
Nunca commitear `.env*` (salvo `.env.example`). Repo privado `alberth25or-cmd/juegos-del-regalo`.
