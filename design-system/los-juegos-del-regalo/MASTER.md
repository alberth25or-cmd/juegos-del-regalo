# Sistema de diseño: Los Juegos del Regalo ("Navidad de juguete")

Fuente de verdad visual. Vista viva con datos de ejemplo: **`/diseno`** y sus subpáginas.

## Historia

1. **v1 (tema noche, 2026-11-06):** azul noche sobrio, pixel en títulos. Cesar la encontró
   "pobre, sosa": no vendía ni se sentía navideña.
2. **v2 (actual, 2026-11-06):** se volvió a correr `ui-ux-pro-max` con
   `"christmas festive party game playful celebration gifts" --design-system --variance 8 --motion 7 --density 4`.

| La herramienta propuso | Decisión | Por qué |
|---|---|---|
| Brutalismo naranja | ❌ | No es navidad ni alegre |
| Estilo **Claymorphism** (búsqueda `style`: "playful, toy-like, chunky, thick borders, double shadows") | ✅ Base de toda la interfaz | Se siente juguete/regalo, alegre y táctil |
| Fuentes **Fredoka + Nunito** (pareja "Playful Creative") | ✅ | Redondas y festivas; Nunito se lee bien en celular |
| Paleta navideña | Sin resultado en la base (0 coincidencias) → paleta propia | Rojo, verde pino, dorado y crema sobre cielo nocturno |
| Checklist (contraste, foco, `prefers-reduced-motion`, 375–1440) | ✅ | — |

## Concepto

**Cada stage es un regalo.** Bloqueado = regalo envuelto (papel con lunares, cinta dorada, lazo
pixel) con una etiqueta colgante "Se abre el 5 dic". El de hoy = caja abierta con lazo rojo y un
solo botón. Superado = caja con lazo dorado y sus juegos a mano.

Ambiente: cielo nocturno con nieve que cae, guirnalda de focos que titilan bajo la barra y el
paisaje pixel de Snowville (montañas y pinos con bastones de caramelo) fijo al fondo.

Los sprites (cabezas, árbol, íconos) siguen en pixel art; la interfaz es clay.

## Color (tokens en `src/app/globals.css`, sección "Navidad de juguete")

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--cielo-1/2/3` | `#0b1640` → `#3a4c9e` | Fondo degradado | crema 16.5:1 |
| `--papel` | `#fffaf0` | Tarjetas clay | — |
| `--tinta` / `--tinta-suave` | `#2a2342` / `#5b5470` | Texto sobre papel | 14.2:1 / 6.9:1 |
| `--rojo-boton` | `#c8102e` | Botón principal (texto blanco) | 5.9:1 |
| `--verde` | `#1f7a4d` | Superado, selección, ranking | 5.3:1 con blanco |
| `--oro` | `#ffc845` | Puntos, cinta, foco (texto tinta) | 9.6:1 |
| `--hielo` | `#c6d0f5` | Texto secundario sobre cielo | 9.8:1 |

El estado nunca depende solo del color: siempre lleva texto ("¡Toca hoy!", "✓ Superado", "Se abre el…").

## Tipografía

- Títulos: Fredoka 600 (`.f-titulo`). Texto: Nunito 600–800, base 16 px.
- Las fuentes se cargan solo en `/diseno` (layout); el resto de la app no cambia todavía.

## Componentes (`src/components/stages/`)

| Componente | Qué es |
|---|---|
| `Decoracion` | `FondoNavidad` (nieve + paisaje) y `Guirnalda` |
| `Cabeza` | Cabeza del avatar; `bola` la pone dentro de un adorno navideño; `yo` agrega aro rojo |
| `BarraAgente` | Tu agente, puntos, riel "bastón de caramelo" con cabezas agrupadas, ranking con medallas |
| `CarruselStages` + `TarjetaStage` | Carrusel de regalos (scroll-snap, flechas, ← →, puntos) |
| `JuegoManada` | Pregunta del día con 4 opciones y resultado del grupo (vista previa) |
| `ArbolEspera` | Árbol pixel con cabezas-adorno y huecos punteados |
| `FichaInscripcion`, `FichaAmigoSecreto`, `PanelOrganizador` | Formularios y fichas en clay |

Clases: `.clay`, `.vidrio`, `.boton` (+ `.verde`, `.oro`, `.claro`), `.pastilla`, `.opcion`,
`.campo`, `.etiqueta`, `.papel-regalo`, `.etiqueta-regalo`, `.nevada`, `.paisaje`, `.foco`,
`.flotar`, `.latido`, `.carrusel`.

## Reglas

- Alias con espacios: **"Agente Picarón"**, nunca con barra baja (decisión de Cesar).
- Táctil ≥ 44 px; nada depende de *hover*. Un botón principal por pantalla.
- Bloqueado se ve, no se abre: sin botones falsos.
- Movimiento: nieve, focos, lazo flotante y latido del stage actual; todo se apaga con
  `prefers-reduced-motion`.
- Anonimato: usuario y alias nunca aparecen juntos.
