import "server-only";
import { createHash } from "node:crypto";
import { sql } from "./db";
import { hmac, newToken, safeEqual } from "./security";

/**
 * Preuve de travail invisible (sans service tiers, sans cookie, sans donnée personnelle).
 * Le serveur délivre un défi signé, lié à un lycée et valable 15 min ; le navigateur cherche un nombre
 * tel que SHA-256(défi:nombre) commence par `bits` zéros. Coût négligeable pour une personne (~1 s),
 * mais chaque vote automatisé coûte du calcul, et un défi ne sert qu'une fois.
 */
export const POW_BITS = Math.min(24, Math.max(4, Number(process.env.POW_BITS ?? 16)));
const TTL_MS = 15 * 60_000;

export function issueChallenge(uai: string): { challenge: string; bits: number } {
  const payload = `v1.${uai}.${Date.now()}.${newToken(12)}.${POW_BITS}`;
  return { challenge: `${payload}.${hmac(payload, "pow").slice(0, 32)}`, bits: POW_BITS };
}

export function leadingZeroBits(buf: Uint8Array): number {
  let n = 0;
  for (const byte of buf) {
    if (byte === 0) { n += 8; continue; }
    return n + Math.clz32(byte) - 24;
  }
  return n;
}

/** Vérifie la preuve et consomme le défi. Renvoie un message d'erreur, ou null si tout est valide. */
export async function verifyPow(pow: { c: string; n: string } | undefined, uai: string): Promise<string | null> {
  if (!pow) return "missing";
  const parts = pow.c.split(".");
  if (parts.length !== 6 || parts[0] !== "v1") return "format";
  const [, cUai, ts, id, bits, sig] = parts;
  const payload = parts.slice(0, 5).join(".");
  if (!safeEqual(sig, hmac(payload, "pow").slice(0, 32))) return "signature";
  if (cUai !== uai) return "school";
  const age = Date.now() - Number(ts);
  if (!(age >= 0 && age < TTL_MS)) return "expired";
  if (Number(bits) < POW_BITS) return "difficulty";
  const digest = createHash("sha256").update(`${pow.c}:${pow.n}`).digest();
  if (leadingZeroBits(digest) < Number(bits)) return "work";
  const used = await sql`insert into pow_used (id) values (${id}) on conflict do nothing returning id`;
  if (used.length === 0) return "reused";
  return null;
}
