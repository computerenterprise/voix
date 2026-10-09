import { z } from "zod";
import { getDevice } from "@/lib/device";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp, json, sameOrigin } from "@/lib/request";
import { ipHash } from "@/lib/security";
import { logError } from "@/lib/log";
import { verifyPow } from "@/lib/pow";
import { addSolidarity, SOLIDARITY_SCOPE } from "@/lib/solidarity";

export const dynamic = "force-dynamic";

const Input = z.object({
  pow: z.object({ c: z.string().max(200), n: z.string().regex(/^\d{1,12}$/) }).optional(),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Requête invalide." }, 400);
  try {
    const ip = ipHash(await clientIp());
    if (!(await rateLimit(`solid:${ip}`, 30, 3600))) return json({ error: "Trop de soutiens depuis cette connexion. Réessaie plus tard." }, 429);
    if (await verifyPow(parsed.data.pow, SOLIDARITY_SCOPE)) {
      return json({ error: "La vérification anti-robot a échoué. Recharge la page et réessaie." }, 400);
    }
    const device = await getDevice(true);
    const res = await addSolidarity(device!.hash, ip);
    return json({ ok: true, already: res === "already" });
  } catch (e) {
    await logError("api/solidarite", e);
    return json({ error: "Une erreur est survenue. Réessaie." }, 500);
  }
}
