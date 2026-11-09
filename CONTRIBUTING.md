# Cómo colaborar

## Qué accesos necesitas

**Solo GitHub** (ser colaborador del repositorio). No necesitas cuenta en Supabase ni en Vercel,
ni las claves de la base de datos real:

- Para desarrollar usas una **base de datos local** en tu PC (PGlite), con las mismas tablas
  que producción. Se crea sola con las migraciones de `db/migrations/`.
- El tiempo real del mundo (ver a los demás caminar) funciona en local entre pestañas del
  mismo navegador, sin Supabase.
- Las claves reales solo las tiene Luis (en Vercel). El repositorio es **público**: nunca subas
  `.env.local` ni ninguna clave.

## Correr el juego en tu PC

```bash
npm install
npm run db:local              # terminal 1: base de datos local en :54329 (se borra al cerrarla)
node scripts/dev-local.mjs    # terminal 2: el juego en http://localhost:3100
```

1. Abre http://localhost:3100/crear y crea una **temporada de prueba** (sin topes diarios y con
   "simular día N" en `/admin`).
2. Abre el enlace `/i/CODIGO` en otra pestaña (o en modo incógnito) para sumar jugadores.
3. `/diseno` muestra las pantallas nuevas con datos de ejemplo (no usa la base de datos).

## Antes de subir un cambio

```bash
npm test                 # reglas críticas
npm run lint
npm run sim              # 20 jugadores a la vez contra TU servidor local (SIM_N=40 para 40)
npm run sim:juegos       # votación, trivia, memory y energía
```

Las simulaciones solo corren contra `localhost`, nunca contra el sitio real.

## Cómo subir: rama + Pull Request

Todo lo que llega a `main` **se publica solo en el sitio real en 1–2 minutos**, y sus migraciones
se aplican a la base de datos real. Por eso:

```bash
git checkout -b mi-cambio
git push -u origin mi-cambio
```

y en GitHub abre un **Pull Request** hacia `main`. Vercel arma una **vista previa** de tu rama con
su propio enlace. La vista previa **no migra** la base de datos: si tu cambio agrega tablas, esas
pantallas fallarán ahí hasta que se una a `main`. Pruébalas en local.

## Base de datos: reglas para migraciones

- Cada cambio de tablas va en un archivo **nuevo** y numerado: `db/migrations/005_lo_que_sea.sql`.
- **Nunca edites** una migración que ya se publicó: no se vuelve a correr (queda registrada en
  `jdr.schema_migrations`). Corrige con una migración nueva.
- Solo cambios que **suman** (`create table`, `add column`, `create index`). Nada de `drop` ni
  `delete` sobre datos reales sin acordarlo con Luis: no hay vuelta atrás.
- Toda tabla nueva en el esquema `cc`, con RLS activado y sin permisos para `anon`/`authenticated`
  (ver `004_juegos_sociales.sql`). El navegador nunca habla con la base de datos: todo pasa por
  `src/app/api/**`.
- Prueba la migración con `npm run db:local` antes de subirla. Si falla en Vercel, el build se
  detiene y sigue en línea la versión anterior.

## Reglas del proyecto

Las reglas no negociables están en `CLAUDE.md` (puntos solo en el servidor, identidad desde la
cookie, consultas con tope de tiempo, mobile-first, pixel art dominante). Las decisiones de diseño
van en `DECISIONES.md`.
