# Decisiones del proyecto

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
- **Supabase aún no está creado.** Plan: instalarlo desde Vercel (Storage → Supabase, región São Paulo) para que las claves lleguen solas.

## Pendientes
- Fecha de inicio y fecha exacta de entrega.
- Nombre definitivo y dominio.
- Tope de apuestas (propuesto: máximo fijo, p. ej. 20 pts).
- ¿Quién no paga juega sin optar al pozo o no entra al sorteo?
