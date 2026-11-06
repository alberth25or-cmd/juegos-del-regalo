# Decisiones del proyecto

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
