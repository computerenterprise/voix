import { z } from "zod";
import { sql } from "@/lib/db";
import { json, sameOrigin, clientIp } from "@/lib/request";
import { rateLimit } from "@/lib/ratelimit";
import { ipHash } from "@/lib/security";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";
const Input = z.object({ details: z.string().trim().min(5).max(1000), contact: z.string().trim().max(200).optional().nullable() });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Décris ta demande en quelques mots (5 caractères minimum)." }, 400);
  try {
    if (!(await rateLimit(`delreq:${ipHash(await clientIp())}`, 5, 3600))) return json({ error: "Trop de demandes." }, 429);
    await sql`insert into deletion_requests (details, contact) values (${parsed.data.details}, ${parsed.data.contact || null})`;
    return json({ ok: true });
  } catch (e) {
    await logError("api/deletion-request", e);
    return json({ error: "Erreur, réessaie." }, 500);
  }
}
