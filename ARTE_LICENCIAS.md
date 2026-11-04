# Arte — origen y licencias

Todo el arte de `public/art/` se generó con **Higgsfield** (modelo Nano Banana Pro, 2K) el 2026-11-04,
con prompts propios (sin marcas ni personajes de terceros), sobre fondo magenta para recorte.

| Archivo | Contenido | Job Higgsfield |
| --- | --- | --- |
| `sprites/*.png` | Hoja de 8 sprites: casa de misiones, muro de fotos, buzón, árbol, cofre, tablero, tienda, Cuy Agente | 4c4102a5-3461-4b4d-93a2-5abae6ac290c |
| `layers/mountains.png` | Cordillera nevada (capa lejana y cercana, espejada) | 3accc7db-7e27-46bf-bb7c-7665578db258 |
| `layers/hills.png` | Colinas con bosque de pinos y cabañas | a3321af0-3274-4f11-a109-130f2eae3f0f |
| `layers/ground.png` | Suelo de la plaza: camino, faroles, muñecos de nieve | afbc7a77-f8df-43a3-81f8-950fdbcdb6bf |

Procesado con `node scripts/process-art.mjs` (requiere los originales en `art-src/`, fuera del repo):
chroma key → reducción a resolución pixel real → paleta sin tramado → recorte por objeto → capas espejadas para repetir sin costura.

Pendiente: revisar los términos de uso comercial de Higgsfield para el plan usado antes de la Fase 3 (pública).
