# Arte — origen y licencias

Todo el arte de `public/art/` se generó con **Higgsfield** (modelo Nano Banana Pro, 2K) el 2026-11-04,
con prompts propios (sin marcas ni personajes de terceros), sobre fondo magenta para recorte.

| Archivo | Contenido | Job Higgsfield |
| --- | --- | --- |
| `sprites/*.png` | Hoja de 8 sprites: casa de misiones, muro de fotos, buzón, árbol, cofre, tablero, tienda, Cuy Agente | 4c4102a5-3461-4b4d-93a2-5abae6ac290c |
| `layers/mountains.png` | Cordillera nevada (capa lejana y cercana, espejada) | 3accc7db-7e27-46bf-bb7c-7665578db258 |
| `layers/hills.png` | Colinas con bosque de pinos y cabañas | a3321af0-3274-4f11-a109-130f2eae3f0f |
| `layers/ground.png` | Suelo de la plaza: camino, faroles, muñecos de nieve | afbc7a77-f8df-43a3-81f8-950fdbcdb6bf |

### Mundo explorable (2026-11-05, API de Higgsfield)

Generado con **Grok Image 2.0** (`xai/grok-imagine-image-2.0`, 1K) por la API, con los sprites
anteriores como referencia de estilo y prompts propios. Script: `npm run hf:arte`;
recorte: `node scripts/process-mundo.mjs` → `public/art/mundo/` y `src/lib/assets/mundo.json`.

| Archivo | Contenido | Solicitud Higgsfield |
| --- | --- | --- |
| `mundo/arcade.png` | arcade | 01a1adf6-dc5b-7a68-bcd8-f99b48d1813b |
| `mundo/arena.png` | arena | 01a1adf7-ec12-7a86-a167-0bd753dfa084 |
| `mundo/cueva.png` | cueva | 01a1adf9-fad2-7c52-b736-d5888251e7d6 |
| `mundo/fabrica.png` | fabrica | 01a1adf6-25d5-77a9-8af6-4f3a8e95cf25 |
| `mundo/maquina.png` | maquina | 01a1adf9-fad8-78d6-a0a5-3b597da1ed22 |
| `mundo/mercado.png` | mercado | 01a1adf7-ecd0-7645-b9fe-8e1cfe915cfd |
| `mundo/mostrador.png` | mostrador | 01a1adfa-e409-7a4d-be41-0fc8c75c1922 |
| `mundo/retrato-auditor.png` | Retrato: auditor | 01a1adf9-fa26-775f-aa47-320355d187c0 |
| `mundo/retrato-duende.png` | Retrato: duende | 01a1adf8-fc67-707f-b61c-da2eed366dda |
| `mundo/retrato-muneco.png` | Retrato: muneco | 01a1adf8-fc5a-741c-a9d1-8caaa965a59d |
| `mundo/retrato-rudolf.png` | Retrato: rudolf | 01a1adf8-fb57-7829-ab2b-c9fc4bce3721 |
| `mundo/retrato-santa.png` | Retrato: santa | 01a1adf7-ecc0-7bf6-b4e3-793f32a92b63 |
| `mundo/tablon.png` | tablon | 01a1adf6-dc6d-7bbc-94ba-47ec7dbbcf6b |
| `mundo/trofeos.png` | trofeos | 01a1adf6-dab4-7b67-9f31-06b2a5542fa4 |

Procesado con `node scripts/process-art.mjs` (requiere los originales en `art-src/`, fuera del repo):
chroma key → reducción a resolución pixel real → paleta sin tramado → recorte por objeto → capas espejadas para repetir sin costura.

Pendiente: revisar los términos de uso comercial de Higgsfield para el plan usado antes de la Fase 3 (pública).
