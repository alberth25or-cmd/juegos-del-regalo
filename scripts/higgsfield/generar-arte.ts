/**
 * Genera el arte del mundo con la API de Higgsfield (Grok Image 2.0 + referencias de estilo).
 *
 *   npm run hf:arte                 # genera lo que falte
 *   npm run hf:arte -- fabrica      # solo esos ids
 *
 * - Lo ya descargado en art-src/mundo/ NO se vuelve a pedir (no se cobra dos veces).
 * - Fondo magenta para recortar luego con scripts/process-mundo.mjs.
 * - HF_CREDENTIALS se lee de .env.local y nunca se imprime.
 * - Cada imagen nueva es una generación que cobra créditos.
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { config, higgsfield } from "@higgsfield/client/v2";
import { APIError, NotEnoughCreditsError } from "@higgsfield/client";

const MODELO = "xai/grok-imagine-image-2.0";
const DIR = join("art-src", "mundo");
const REGISTRO = join(DIR, "registro.json");

// Sprites ya publicados: guía de estilo para que todo combine.
const REFS = [
  "https://juegos-del-regalo.vercel.app/art/sprites/casa-misiones.png",
  "https://juegos-del-regalo.vercel.app/art/sprites/tienda.png",
  "https://juegos-del-regalo.vercel.app/art/sprites/arbol.png",
];

const ESTILO_EDIFICIO =
  "16-bit pixel art game sprite, front three-quarter view like a building in a classic top-down RPG town, cozy snowy Christmas village, thick snow on the roof, warm glowing windows, crisp hard-edged pixels, limited palette, dark outline, same art style and pixel density as the reference images. One single isolated building, centered, fully visible from roof to ground line, no characters, no text, no letters, no ground, no cast shadow, on a flat solid pure magenta (#FF00FF) background.";

const ESTILO_RETRATO =
  "16-bit pixel art character portrait bust for an RPG dialogue box, original character design, expressive face, crisp hard-edged pixels, limited palette, dark outline, same art style as the reference images, head and shoulders centered, no text, no letters, on a flat solid pure magenta (#FF00FF) background.";

const ESTILO_OBJETO =
  "16-bit pixel art game prop sprite, front three-quarter view for a top-down RPG, crisp hard-edged pixels, limited palette, dark outline, same art style as the reference images. One single isolated object, centered, fully visible, no characters, no text, no letters, no cast shadow, on a flat solid pure magenta (#FF00FF) background.";

export const ASSETS: { id: string; grupo: "edificio" | "retrato" | "objeto"; aspect: string; prompt: string }[] = [
  // Edificios de Snowville
  { id: "fabrica", grupo: "edificio", aspect: "4:3", prompt: "A run-down toy factory owned by a bankrupt Santa: red brick walls, sawtooth industrial roof covered in snow, one tall brick chimney puffing smoke, big wooden double door, a crooked golden gear emblem above the door, a few patched boards." },
  { id: "trofeos", grupo: "edificio", aspect: "4:3", prompt: "A small elegant trophy hall: cream stone walls, golden columns at the entrance, red tiled roof with snow, a big golden trophy cup emblem above the arched wooden door, festive garland with lights." },
  { id: "arcade", grupo: "edificio", aspect: "4:3", prompt: "A retro video game arcade building: dark purple walls, neon pink and cyan trim, a glowing marquee with colorful bulbs over a glass door, colorful arcade cabinets visible through the windows, snow on the flat roof." },
  { id: "tablon", grupo: "edificio", aspect: "4:3", prompt: "A wooden village assembly hall: brown timber walls, green roof with snow, a giant cork notice board on the facade covered with many pinned colorful papers and notes, a wooden door, a lantern." },
  { id: "arena", grupo: "edificio", aspect: "4:3", prompt: "A small snowy stone arena gate like a mini colosseum: grey stone walls with crenellations, four tall flags on top in green, red, dark navy and gold, one big arched entrance, snowballs piled by the door." },
  { id: "mercado", grupo: "edificio", aspect: "4:3", prompt: "A shady black-market Christmas shop: dark purple wooden stall-house with a crooked roof covered in snow, hanging lanterns with purple glow, crates of suspicious wrapped gifts stacked outside, a half-drawn curtain as the door." },
  // Retratos de los NPCs (para los diálogos)
  { id: "retrato-santa", grupo: "retrato", aspect: "1:1", prompt: "A broke, sarcastic Santa Claus: white beard, red suit with visible patches, tired eyes with dark circles, nervous smile, holding a long unpaid bill." },
  { id: "retrato-rudolf", grupo: "retrato", aspect: "1:1", prompt: "An arrogant reindeer with brown fur, big antlers, a red nose, dark sunglasses and a blue necktie, smug self-important smile." },
  { id: "retrato-duende", grupo: "retrato", aspect: "1:1", prompt: "A Christmas elf union leader: green pointy hat with a bell, pointy ears, red scarf, determined fierce expression, raising a fist, a blank protest sign behind him." },
  { id: "retrato-muneco", grupo: "retrato", aspect: "1:1", prompt: "A suspicious snowman: black top hat with a red band, blue scarf, carrot nose, coal eyes looking sideways, sly little smirk, twig arm near his face as if whispering a secret." },
  { id: "retrato-auditor", grupo: "retrato", aspect: "1:1", prompt: "A stern corporate auditor: grey slicked hair, round glasses, charcoal suit, red tie, frowning, holding a clipboard with a long checklist, one eyebrow raised." },
  // Objetos de los submundos
  { id: "maquina", grupo: "objeto", aspect: "2:3", prompt: "A retro arcade cabinet machine: red body, glowing screen showing falling gift boxes, joystick and colorful buttons, bright marquee on top." },
  { id: "cueva", grupo: "objeto", aspect: "4:3", prompt: "A frozen rocky cave entrance covered in snow and icicles, a dark opening with two glowing red eyes of a sleeping ogre inside." },
  { id: "mostrador", grupo: "objeto", aspect: "2:1", prompt: "A dark wooden shop counter of a black market with glowing potion bottles, a suspicious sock, a fake diploma and wrapped odd gifts on top." },
];

function cargarRegistro(): Record<string, { url: string; request: string; fecha: string }> {
  try {
    return JSON.parse(readFileSync(REGISTRO, "utf8"));
  } catch {
    return {};
  }
}

async function main() {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const cred = process.env.HF_CREDENTIALS?.trim();
  if (!cred || !/^[^:\s]+:[^:\s]+$/.test(cred)) {
    console.error('Falta HF_CREDENTIALS en .env.local con el formato "key-id:key-secret".');
    process.exit(1);
  }
  config({ credentials: cred });
  mkdirSync(DIR, { recursive: true });
  const registro = cargarRegistro();
  const pedidos = process.argv.slice(2);
  const lista = ASSETS.filter((a) => (pedidos.length ? pedidos.includes(a.id) : true)).filter((a) => !existsSync(join(DIR, `${a.id}.png`)));
  if (lista.length === 0) {
    console.log("Nada que generar: todo ya está en art-src/mundo/.");
    return;
  }
  console.log(`Generando ${lista.length} imagen(es) con ${MODELO}…`);
  let fallos = 0;
  // De a 3 en paralelo: rápido sin saturar la API.
  for (let i = 0; i < lista.length; i += 3) {
    await Promise.all(
      lista.slice(i, i + 3).map(async (a) => {
        const estilo = a.grupo === "edificio" ? ESTILO_EDIFICIO : a.grupo === "retrato" ? ESTILO_RETRATO : ESTILO_OBJETO;
        try {
          const r = await higgsfield.subscribe(MODELO, {
            input: { prompt: `${a.prompt} ${estilo}`, image_urls: REFS, resolution: "1k", aspect_ratio: a.aspect, quality: "medium" },
            withPolling: true,
          });
          const url = r.images?.[0]?.url;
          if (r.status !== "completed" || !url) {
            fallos++;
            const det = (r as { error?: unknown }).error;
            console.error(`✗ ${a.id}: ${r.status}${typeof det === "string" ? ` — ${det}` : ""}`);
            return;
          }
          const res = await fetch(url);
          if (!res.ok) throw new Error(`descarga ${res.status}`);
          writeFileSync(join(DIR, `${a.id}.png`), Buffer.from(await res.arrayBuffer()));
          registro[a.id] = { url, request: r.request_id, fecha: new Date().toISOString() };
          writeFileSync(REGISTRO, JSON.stringify(registro, null, 2));
          console.log(`✓ ${a.id} (${r.request_id})`);
        } catch (e) {
          fallos++;
          if (e instanceof NotEnoughCreditsError) console.error(`✗ ${a.id}: no hay créditos suficientes.`);
          else if (e instanceof APIError) console.error(`✗ ${a.id}: error de la API (${e.statusCode ?? "?"}) ${e.message} ${JSON.stringify(e.responseData ?? "").slice(0, 200)}`);
          else console.error(`✗ ${a.id}:`, e instanceof Error ? e.message : String(e));
        }
      }),
    );
  }
  console.log(fallos ? `Terminado con ${fallos} fallo(s). Vuelve a ejecutar para reintentar solo lo que faltó.` : "Todo generado.");
  if (fallos) process.exitCode = 2;
}

await main();
