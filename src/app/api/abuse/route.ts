import { z } from "zod";
import { sql } from "@/lib/db";
import { json, sameOrigin, clientIp } from "@/lib/request";
import { rateLimit } from "@/lib/ratelimit";
import { ipHash } from "@/lib/security";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";
const Input = z.object({
  target_url: z.string().trim().max(300).optional().nullable(),
  reason: z.enum(["donnees_personnelles", "accusation", "haine", "menace", "faux", "autre"]),
  details: z.string().trim().max(1000).optional().nullable(),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Choisis un motif." }, 400);
  try {
    if (!(await rateLimit(`abuse:${ipHash(await clientIp())}`, 10, 3600))) return json({ error: "Trop de signalements." }, 429);
    const d = parsed.data;
    await sql`insert into abuse_reports (target_url, reason, details) values (${d.target_url || null}, ${d.reason}, ${d.details || null})`;
    return json({ ok: true });
  } catch (e) {
    await logError("api/abuse", e);
    return json({ error: "Erreur, réessaie." }, 500);
  }
}
