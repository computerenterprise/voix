import { ParticipationInput, submitParticipation } from "@/lib/participation";
import { getDevice } from "@/lib/device";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp, json, sameOrigin } from "@/lib/request";
import { ipHash } from "@/lib/security";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Requête invalide." }, 400);
  }
  const parsed = ParticipationInput.safeParse(body);
  if (!parsed.success) {
    const tooShort = parsed.error.issues.some((i) => i.path.includes("body") && i.code === "too_small");
    return json({ error: tooShort ? "Ton message doit faire au moins 10 caractères." : "Participation invalide." }, 400);
  }
  try {
    const ip = ipHash(await clientIp());
    if (!(await rateLimit(`part:${ip}`, 30, 600))) {
      return json({ error: "Trop de participations depuis cette connexion. Réessaie plus tard." }, 429);
    }
    if (parsed.data.report && !(await rateLimit(`report:${ip}`, 6, 3600))) {
      return json({ error: "Trop de messages envoyés depuis cette connexion. Réessaie dans une heure." }, 429);
    }
    const device = await getDevice(true);
    const res = await submitParticipation(parsed.data, { deviceHash: device!.hash, ipHash: ip, newDevice: device!.isNew });
    if (!res.ok) return json({ error: res.error }, res.status);
    return json({ ok: true, reportPending: res.reportPending });
  } catch (e) {
    await logError("api/participations", e);
    return json({ error: "Une erreur est survenue. Ta participation n'a pas été enregistrée, réessaie." }, 500);
  }
}
