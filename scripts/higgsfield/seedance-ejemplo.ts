/**
 * Ejemplo de la API de Higgsfield con Seedance 2.5 (texto → video).
 *
 *   npm run hf:ejemplo
 *
 * Requiere HF_CREDENTIALS="key-id:key-secret" en .env.local (ignorado por git).
 * La clave se carga al ejecutar y NUNCA se imprime. Cada ejecución es una
 * generación que cobra créditos.
 */
import { existsSync } from "node:fs";
import { config, higgsfield } from "@higgsfield/client/v2";
import { APIError, AuthenticationError, NotEnoughCreditsError, ValidationError } from "@higgsfield/client";

const MODELO = "bytedance/seedance-2.5/text-to-video";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const credenciales = process.env.HF_CREDENTIALS;
if (!credenciales || !/^[^:\s]+:[^:\s]+$/.test(credenciales.trim())) {
  console.error('Falta HF_CREDENTIALS en .env.local con el formato "key-id:key-secret".');
  process.exit(1);
}
config({ credentials: credenciales.trim() });

console.log(`Generando video con ${MODELO} (5 s, 720p, 16:9)… puede tardar unos minutos.`);
const t0 = Date.now();

try {
  const r = await higgsfield.subscribe(MODELO, {
    input: { prompt: "A cinematic scene at sunset", duration: 5, resolution: "720p", aspect_ratio: "16:9" },
    withPolling: true,
  });
  const segundos = Math.round((Date.now() - t0) / 1000);
  const estado = r.status as string;
  if (estado === "completed" && r.video?.url) {
    console.log(`✓ Listo en ${segundos} s (solicitud ${r.request_id}).`);
    console.log(`Video: ${r.video.url}`);
    process.exit(0);
  }
  const motivo: Record<string, string> = {
    failed: "la generación falló en Higgsfield",
    nsfw: "la moderación bloqueó el contenido",
    canceled: "la solicitud fue cancelada",
    cancelled: "la solicitud fue cancelada",
    completed: "terminó pero no devolvió ninguna URL de video",
  };
  console.error(`✗ Sin video: ${motivo[estado] ?? `estado inesperado "${estado}"`} (solicitud ${r.request_id}).`);
  const detalle = (r as { error?: unknown }).error;
  if (typeof detalle === "string") console.error(`  Higgsfield dice: ${detalle}`);
  process.exit(2);
} catch (e) {
  if (e instanceof NotEnoughCreditsError) console.error("✗ No hay créditos suficientes en la cuenta de la API de Higgsfield.");
  else if (e instanceof AuthenticationError) console.error("✗ Higgsfield rechazó las credenciales (revisa HF_CREDENTIALS).");
  else if (e instanceof ValidationError) console.error("✗ Parámetros rechazados:", JSON.stringify(e.details ?? e.message));
  else if (e instanceof APIError) console.error(`✗ Error de la API (${e.statusCode ?? "?"}): ${e.message}`);
  else console.error("✗ Error:", e instanceof Error ? e.message : String(e));
  process.exit(3);
}
