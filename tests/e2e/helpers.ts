import { createHash } from "node:crypto";
import type { APIRequestContext } from "@playwright/test";
import postgres from "postgres";
export const db = () => postgres(process.env.E2E_DATABASE_URL ?? "postgres://voix@127.0.0.1:5432/voix_test", { max: 1, onnotice: () => {} });
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "voix-admin-dev-password";
export const SCHOOL = "9990001A"; // établissement FICTIF de la base de test

/** Résout le défi anti-robot comme le ferait un navigateur (utile pour tester l'API directement). */
export async function proof(request: APIRequestContext, uai: string) {
  const { challenge, bits } = await (await request.get(`/api/challenge?uai=${uai}`)).json();
  for (let n = 0; ; n++) {
    const d = createHash("sha256").update(`${challenge}:${n}`).digest();
    let z = 0;
    for (const b of d) { if (b === 0) { z += 8; continue; } z += Math.clz32(b) - 24; break; }
    if (z >= bits) return { c: challenge as string, n: String(n) };
  }
}
