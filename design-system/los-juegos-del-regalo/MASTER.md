# Sistema de diseño — Los Juegos del Regalo (reorientación)

Fuente de verdad visual del Frente 1. Partió de `ui-ux-pro-max` (`--design-system`, consulta
"social party game pixel art retro christmas mobile", dials variance 6 · motion 4 · density 5) y
se ajustó a lo ya decidido en `docs/superpowers/specs/2026-11-06-reorientacion-design.md` §4.
Vista viva con datos de ejemplo: **`/diseno`** (y sus subpáginas).

## Qué tomamos de ui-ux-pro-max y qué cambiamos

| La herramienta propuso | Decisión | Por qué |
|---|---|---|
| Estilo **Pixel Art** | ✅ Se usa | Coincide con la regla 9 de `CLAUDE.md` |
| Patrón *Hero-centric*, un solo CTA | ✅ Una tarjeta, un botón grande por pantalla | Es la opción B aprobada |
| Rojo + azul neón + verde | ❌ → azul noche, dorado, rojo, crema | Paleta aprobada en el diseño (§4) |
| Press Start 2P + VT323 | ❌ → Pixelify Sans (solo títulos) + DM Sans (texto) | El diseño pide pixel solo en títulos; VT323 en texto largo se lee mal en celular |
| Stagger con GSAP | ❌ → transiciones CSS | Sin dependencias nuevas; las tarjetas ya animan con CSS |
| Checklist: sin emojis como íconos, foco visible, `prefers-reduced-motion`, 375/768/1024/1440 | ✅ Se aplica completo | — |

## Color (tokens en `src/app/globals.css`, sección "Tema noche")

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--noche` | `#101a38` | Fondo de las pantallas de juego | — |
| `--noche-2` | `#16284f` | Superficie: tarjetas, barra superior | crema 13.5:1 |
| `--noche-3` | `#21407a` | Realce, brillo del fondo | — |
| `--linea` | `#3a4f7d` | Bordes y rieles apagados | — |
| `--cream` | `#fff6e5` | Texto principal | 13.5:1 sobre `--noche-2` |
| `--texto-suave` | `#b9c3dd` | Texto secundario | 8.2:1 |
| `--texto-tenue` | `#9aa6c8` | Fechas, ayudas | 6.0:1 |
| `--gold` | `#f6b93b` | Bordes destacados, puntos, avance | 8.2:1 |
| `--cta` | `#c8304a` | Botón principal (texto crema) | 4.9:1 ✅ |
| `--cherry` | `#e2445c` | Solo decoración (marco "tú", sellos); **nunca fondo de texto** | 3.75:1 ❌ con crema |
| `--yo` | `#ff8a99` | Texto que marca "tú" en listas | 6.4:1 |
| `--ok` | `#7fd6a8` | Superado / completo | 8.3:1 |

El estado nunca depende solo del color: siempre va con ícono (candado, check) y texto
("Se abre el 5 dic", "Superado").

## Tipografía

- Títulos y cifras: `font-pixel` (Pixelify Sans 600/700). Nunca en párrafos.
- Texto: DM Sans, base 16 px, interlineado 1.5. Mínimo 13 px en etiquetas.

## Componentes (en `src/components/stages/`)

| Componente | Qué es |
|---|---|
| `Cabeza` | La cabeza del avatar (gorro + cara + bufanda), recortada del sprite existente |
| `BarraAgente` | Barra superior fija: tu cabeza + alias, puntos y puesto, riel de stages con cabezas agrupadas (máx. 3 + "+N" por stage) y ranking |
| `CarruselStages` | Carrusel con *scroll-snap*: actual al centro, vecinos difuminados por distancia. Flechas, deslizar, ← →, puntos |
| `TarjetaStage` | Contenido de cada stage según su estado: superado · actual · bloqueado |
| `ArbolEspera` | Árbol pixel con las cabezas como adornos y huecos libres según la capacidad |
| `FichaInscripcion` | Formulario: 3–4 regalos + 4 datos + 1 opcional, errores junto al campo |
| `FichaAmigoSecreto` | Expediente en papel crema con sello "Privada y confidencial" |
| `PanelOrganizador` | Configuración + pestañas separadas "Avance (por alias)" y "Contraseñas (por usuario)": nunca juntas |

Clases nuevas: `.tema-noche`, `.px-panel` (borde escalonado con color `--bc`), `.nieve-fondo`,
`.carrusel` / `.slide[data-dist]`, `.px-seg` (opciones tipo chip para radios).

## Reglas de interacción

- Táctil ≥ 44 px; ningún dato depende de *hover*.
- Un solo botón principal por pantalla (`px-btn` con `--bg: var(--cta)`).
- Bloqueado = se puede mirar, no abrir: botón deshabilitado con la fecha, nunca un botón falso.
- Movimiento: 1–2 elementos animados por vista; transiciones de 200–300 ms; con
  `prefers-reduced-motion` se quitan transiciones y desenfoques animados.
- Anonimato: en ninguna pantalla aparecen juntos usuario y alias.
