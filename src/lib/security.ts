import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s = process.env.APP_SECRET;
  if (!s || s.length < 32) throw new Error("APP_SECRET manquant ou trop court (32 caractères minimum)");
  return s;
}

export function hmac(value: string, purpose: string): string {
  return createHmac("sha256", secret()).update(purpose + ":" + value).digest("base64url");
}

/** Empreinte d'IP non réversible qui change chaque jour (impossible de suivre un appareil d'un jour à l'autre via l'IP). */
export function ipHash(ip: string, date = new Date()): string {
  return hmac(ip + "|" + date.toISOString().slice(0, 10), "ip").slice(0, 32);
}

export function deviceHash(token: string): string {
  return hmac(token, "device").slice(0, 43);
}

export function newToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Format : scrypt:<sel base64url>:<hash base64url> (sans « $ », pour éviter l'expansion des fichiers .env) */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const h = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("base64url")}:${h.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [alg, saltB64, hashB64] = stored.split(":");
  if (alg !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const got = scryptSync(password, Buffer.from(saltB64, "base64url"), expected.length);
  return got.length === expected.length && timingSafeEqual(got, expected);
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
