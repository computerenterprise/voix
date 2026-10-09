import { sql } from "@/lib/db";
import { clearDevice, getDevice } from "@/lib/device";
import { json, sameOrigin, clientIp } from "@/lib/request";
import { rateLimit } from "@/lib/ratelimit";
import { ipHash } from "@/lib/security";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/** Effacement immédiat de toutes les participations (et messages) liées à ce navigateur. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  try {
    if (!(await rateLimit(`del:${ipHash(await clientIp())}`, 10, 3600))) return json({ error: "Trop de demandes." }, 429);
    const device = await getDevice(false);
    if (!device) return json({ ok: true, deleted: 0 });
    const rows = await sql`delete from participations where device_hash = ${device.hash} returning id`;
    await sql`delete from solidarity where device_hash = ${device.hash}`;
    await clearDevice();
    return json({ ok: true, deleted: rows.length });
  } catch (e) {
    await logError("api/me/delete", e);
    return json({ error: "Erreur, réessaie." }, 500);
  }
}
