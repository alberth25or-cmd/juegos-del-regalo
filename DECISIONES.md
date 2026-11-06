# Decisiones del proyecto

## Rediseño festivo "Navidad de juguete" (2026-11-06, pedido de Cesar)

La primera versión del tema (noche sobria) "se veía pobre y sosa". Decisiones de Cesar:
- **Estilo navideño, alegre y que venda.** Se volvió a correr `ui-ux-pro-max`: estilo
  Claymorphism + fuentes Fredoka/Nunito; paleta navideña propia (la base no tenía una).
  Detalle en `design-system/los-juegos-del-regalo/MASTER.md`.
- **Alias sin barra baja:** "Agente Picarón", "Agente Cau Cau". Reemplaza `Agente_<plato>`.
- **Acceso a los juegos en local:** desde el stage 1 se abren Gift Catcher y Memory (modo demo,
  sin base de datos). La Trivia necesita la base de datos y queda marcada así.

Mías: cada stage se dibuja como un regalo (envuelto con etiqueta de fecha si está bloqueado); la
interfaz pasa a clay pero los sprites siguen en pixel art; se agregó una vista previa jugable de
"La manada" en `/diseno/manada` con votos de ejemplo.

---

## Diseño de interfaz — Frente 1 (2026-11-06)

Hecho con la skill `ui-ux-pro-max` (sistema de diseño + guías de UX) y aplicando `ponytail`
(reusar `px-box`, `PixelIcon` y los sprites; sin dependencias nuevas). Detalle y tabla de contrastes:
`design-system/los-juegos-del-regalo/MASTER.md`. Vista con datos de ejemplo en **`/diseno`**.

- **Tema noche** para las pantallas de juego: azul noche, dorado, rojo y crema (la paleta aprobada,
  no la que propuso la herramienta).
- **Rojo de botón `--cta` (#c8304a)** en vez de `--cherry`: con texto crema llega a 4.9:1; `--cherry` no
  pasa 4.5:1 y queda solo como decoración.
- **Tipografía:** Pixelify Sans solo en títulos y cifras; DM Sans en texto (se descartó VT323 por lectura).
- **Riel de avance:** se agrupan las cabezas por stage (1 en celular, 3 en computadora, más "+N"),
  porque con 20–40 agentes no caben una por una.
- **Árbol:** los huecos se reparten al azar con semilla fija y las cabezas se ordenan por alias, para
  no revelar el orden de inscripción.
- **Panel del organizador:** "Avance · por alias" y "Contraseñas · por usuario" en pestañas distintas;
  nunca en la misma vista. "Empezar" pide confirmación porque no se puede deshacer.
- **Íconos nuevos** `heart` (Amor) y `chili` (Picante), en pixel art y sin emojis.

Pendiente para los frentes 2–5: conectar estas pantallas a datos reales. `/diseno` se puede borrar
cuando todas estén conectadas.

---

## Reorientación: amigo secreto con agentes y stages en orden (2026-11-06)

Sesión de brainstorming con Cesar (skill `brainstorming` de Superpowers). Diseño completo:
`docs/superpowers/specs/2026-11-06-reorientacion-design.md`. Bocetos aprobados:
`docs/superpowers/bocetos/`. **Esta sección manda sobre las anteriores donde choquen.**

Decisiones de Cesar:
- **Amigo secreto = la persona a la que TÚ le regalas** (no quien te regala).
- **Alias anónimo, al azar y fijo:** `Agente <comida peruana>` (Agente Picarón, Agente Rocoto,
  Agente Mazamorra…; sin barra baja, ver rediseño festivo). Nadie escribe su nombre. El usuario de acceso y la contraseña sí son personales.
- **La ficha de inscripción es el pase al árbol:** 3 o 4 opciones de regalo dentro del presupuesto
  (S/40 por defecto, configurable) y 4 datos breves para describirte + 1 opcional.
- **Árbol navideño como sala de espera.** Nadie juega antes del "Empezar" del organizador. El
  "Empezar" hace el sorteo y cierra la puerta.
- **Stages lineales y temáticos.** Cada uno se abre en su fecha y solo si superaste el anterior.
  Los siguientes se ven difuminados pero no se pueden abrir. El intervalo entre stages lo
  configura el organizador, contando desde el "Empezar".
- **Superar un stage = hacer cada actividad al menos una vez.** Faltar resta puntos, pero no te
  saca de la historia.
- **Stages:** 1 Calentamiento (minijuegos existentes) · 2 **La manada** (adivinar lo que piensa la
  mayoría; se descartó votar por alias porque no era justo) · 3 **Amor y relaciones** (respuestas
  cortas) · 4 **Picante** (solo sí o no) · 5 Juicio final · Ficha del amigo secreto · Intercambio.
- **"Paso" existe y resta puntos**, con la penalidad explicada en pantalla.
- **Las respuestas íntimas las ve solo quien regala**, al final, en la "Ficha de tu amigo secreto
  — privada y confidencial".
- **Sin equipos.** Un solo ranking individual, siempre visible. Quien suma más puntos gana el
  premio final. **La app no maneja dinero:** solo muestra el texto del premio.
- **El organizador juega como uno más.** Su panel nunca muestra el sorteo, nunca relaciona alias
  con usuario y nunca muestra respuestas. Configura: capacidad máxima, intervalo y fechas,
  presupuesto y premio. Reinicia contraseñas.
- **Pantalla principal = opción B** (una tarjeta grande por stage). En computadora es un carrusel
  con los stages vecinos difuminados y la barra superior con las cabezas y el ranking.

Cambios a decisiones anteriores (por decisión de Cesar):
- "Pozo de dinero: no" (5 nov) → hay premio final para el primero, fuera de la app.
- "Todo abierto + rotación diaria" (6 nov) → stages lineales con fecha.
- Equipos (5 nov) → eliminados.
- Snowville explorable como pantalla principal (Fase 1.5) → reemplazado por la pantalla de
  stages. El arte se puede reutilizar como decoración.
- Spec §9.2 y regla 7 de `CLAUDE.md` (no pedir datos íntimos) → los stages 3 y 4 sí los piden,
  con "Paso" y visibles solo para quien regala.

Supuestos que tomé (se pueden cambiar): el PIN de 4 dígitos sigue como contraseña · lista de ≥ 50
platos · datos breves = género, lentes, estatura, cabello + un rasgo opcional · responder +10,
pasar −5, máximo 2 pases por stage · −5 por pregunta diaria sin responder · solo puntos (sin XP,
monedas ni tienda) · 4 opciones fijas en La manada · confirmación de mayoría de edad antes del
stage 4 y borrado de respuestas íntimas al cerrar la temporada · la ficha final se abre por fecha
para todos.

Pendientes de decidir (ver §12 del diseño): ¿las opciones de regalo se ven antes de la ficha
final, para que dé tiempo de comprar? · ¿se mantiene la aprobación manual de inscritos? ·
contenido del stage 5 · banco de preguntas de los stages 3 y 4.

---

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
