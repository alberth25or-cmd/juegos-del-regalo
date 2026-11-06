# Los Juegos del Regalo — Temporada Christmas Chaos

Juego social web para 20 a 40 amigos: 30 días (25 nov → 24 dic, hora de Lima) en Snowville,
un pueblo navideño pixel art en quiebra. Minijuegos, equipos, votaciones, humor consensuado
y amigo secreto. En línea: https://juegos-del-regalo.vercel.app

- Visión y especificación: `docs/ESPECIFICACION.md`
- Reglas de trabajo y arquitectura: `CLAUDE.md`
- Plan por fases: `PLAN.md` · Juegos: `JUEGOS.md` · Decisiones: `DECISIONES.md`

## Cómo se juega (Fase 1)

1. El organizador entra a `/crear`, crea la temporada y comparte el enlace `/i/CODIGO`.
2. Cada amigo abre el enlace, crea su personaje pixel, su usuario y un PIN de 4 números.
3. El organizador lo aprueba en `/admin` y arma los 4 equipos (a mano o al azar).
4. En la plaza, los NPCs cuentan qué pasa; en el Arcade se juega **Gift Catcher**.
5. El servidor valida cada partida; el ranking individual y por equipos (promedio) se actualiza solo.

Para probar todo en una tarde: crea una **temporada de prueba** en `/crear` (sin topes diarios y con
"simular día N" en el panel). La temporada real va aparte.

Desde otro celular se entra en `/entrar` con usuario + PIN. Si alguien olvida su PIN, el organizador lo reinicia.

## Desarrollo

```bash
npm install
npm test                      # reglas críticas (puntuación, validación, calendario, equipos)
npm run db:local              # Postgres local en memoria (PGlite) en :54329
node scripts/dev-local.mjs    # app en http://localhost:3100 contra la BD local
npm run sim                   # 20 jugadores simultáneos contra el servidor LOCAL (SIM_N=40 para 40)
npm run sim:prueba            # temporada de prueba (simular días, sin topes) contra el servidor LOCAL
```

Sin `.env.local` y sin `db:local`, `npm run dev` levanta la aldea sin base de datos.
Variables: ver `.env.example`. Nunca subas `.env.local`.

## Despliegue

Push a `main` → Vercel compila. `npm run build` aplica primero las migraciones de
`db/migrations/` sobre Supabase (São Paulo) y luego compila Next.js.
