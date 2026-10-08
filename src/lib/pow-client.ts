/** Côté navigateur : récupère un défi anti-robot pour un lycée et le résout (voir src/lib/pow.ts). */
export type PowProof = { c: string; n: string };

function zeroBits(buf: Uint8Array): number {
  let n = 0;
  for (const byte of buf) {
    if (byte === 0) { n += 8; continue; }
    return n + Math.clz32(byte) - 24;
  }
  return n;
}

async function solve(challenge: string, bits: number): Promise<PowProof> {
  const enc = new TextEncoder();
  const BATCH = 512;
  for (let start = 0; ; start += BATCH) {
    const digests = await Promise.all(
      Array.from({ length: BATCH }, (_, i) => crypto.subtle.digest("SHA-256", enc.encode(`${challenge}:${start + i}`))),
    );
    const hit = digests.findIndex((d) => zeroBits(new Uint8Array(d)) >= bits);
    if (hit >= 0) return { c: challenge, n: String(start + hit) };
  }
}

const pending = new Map<string, Promise<PowProof>>();

/** Lance (ou réutilise) la résolution d'un défi. Un défi ne sert qu'une fois : appeler `consumeProof` après envoi. */
export function prepareProof(uai: string): Promise<PowProof> {
  let p = pending.get(uai);
  if (!p) {
    p = fetch(`/api/challenge?uai=${encodeURIComponent(uai)}`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Vérification indisponible. Réessaie.");
        return solve(data.challenge, data.bits);
      });
    p.catch(() => pending.delete(uai));
    pending.set(uai, p);
  }
  return p;
}

export function consumeProof(uai: string) {
  pending.delete(uai);
}
