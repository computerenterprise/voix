import { issueChallenge } from "@/lib/pow";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp, json } from "@/lib/request";
import { ipHash } from "@/lib/security";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const uai = new URL(req.url).searchParams.get("uai") ?? "";
  if (!/^\d{7}[A-Z]$/.test(uai)) return json({ error: "Requête invalide." }, 400);
  try {
    if (!(await rateLimit(`challenge:${ipHash(await clientIp())}`, 120, 600))) {
      return json({ error: "Trop de tentatives depuis cette connexion. Réessaie plus tard." }, 429);
    }
    return json(issueChallenge(uai));
  } catch (e) {
    await logError("api/challenge", e);
    return json({ error: "Vérification indisponible. Réessaie." }, 500);
  }
}
