import "server-only";
import { createHmac, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

/** Secreto del servidor para los hashes de tokens y códigos (no se guarda en la BD). */
function pepper() {
  return process.env.SUPABASE_JWT_SECRET || process.env.SESSION_SECRET || "solo-desarrollo-no-usar-en-produccion";
}

/** Hash determinístico (HMAC-SHA256) para buscar tokens y códigos sin guardarlos en claro. */
export function hashLookup(value: string) {
  return createHmac("sha256", pepper()).update(value).digest("base64url");
}

/** Token de sesión: 32 bytes aleatorios. Va en la cookie; en la BD solo su hash. */
export function newSessionToken() {
  return randomBytes(32).toString("base64url");
}

// Sin letras ni números que se confundan (0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(len: number) {
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/** Código de rescate, p. ej. "PK7Q-2MHX". Se muestra una sola vez. */
export function newRescueCode() {
  const c = randomCode(8);
  return `${c.slice(0, 4)}-${c.slice(4)}`;
}

export function normalizeRescueCode(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Código de invitación de la temporada (va en el enlace /i/XXXXXXXX). */
export function newInviteCode() {
  return randomCode(8);
}

export function normalizeInviteCode(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

// ---------------------------------------------------------------- usuario
/** Usuario: 3–20 letras minúsculas, números o "_". Se usa para entrar desde otro celular. */
export function normalizeUsername(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\s.-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function validateUsername(u: string): string | null {
  if (!/^[a-z0-9_]{3,20}$/.test(u)) return "Tu usuario debe tener entre 3 y 20 letras o números (sin espacios).";
  return null;
}

/** Semilla de 31 bits para partidas (criptográficamente aleatoria). */
export function newSeed() {
  return randomInt(1, 2 ** 31 - 1);
}

// ------------------------------------------------------------------- PIN
const PIN_TRIVIALES = new Set(["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "1234", "4321", "1212", "0123", "9876"]);

export function validatePin(pin: string): string | null {
  if (!/^\d{4}$/.test(pin)) return "El PIN debe tener exactamente 4 números.";
  if (PIN_TRIVIALES.has(pin)) return "Ese PIN es muy fácil de adivinar. Elige otro, agente.";
  return null;
}

/** PIN con scrypt + sal aleatoria: aunque alguien viera la BD, no podría leerlo. */
export async function hashPin(pin: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(pin, salt, 32, { N: 16384, r: 8, p: 1 });
  return `s1$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPin(pin: string, stored: string) {
  const [v, saltB64, hashB64] = stored.split("$");
  if (v !== "s1" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const actual = await scrypt(pin, Buffer.from(saltB64, "base64url"), expected.length, { N: 16384, r: 8, p: 1 });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Tras 5 intentos fallidos el PIN se bloquea 15 minutos. */
export const PIN_MAX_FAILS = 5;
export const PIN_LOCK_MINUTES = 15;

/** Huella de la IP (HMAC): sirve para limitar intentos sin guardar la IP en claro. */
export function ipFingerprint(h: Headers) {
  const ip = h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return hashLookup(`ip:${ip}`).slice(0, 22);
}
