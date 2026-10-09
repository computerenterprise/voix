import { sql } from "@/lib/db";
import { json } from "@/lib/request";
import { safeEqual } from "@/lib/security";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/** Application quotidienne des durées de conservation (appelée par Vercel Cron avec CRON_SECRET).
 *  L'empreinte de connexion des auteurs de messages écrits est gardée 1 an (décret n° 2021-1362, LCEN). */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return json({ error: "Non autorisé" }, 401);
  try {
    const r = await sql.begin(async (tx) => {
      const ip = await tx`update participations p set ip_hash = 'purged' where ip_hash <> 'purged' and created_at < now() - interval '30 days'
        and not exists (select 1 from reports r where r.participation_id = p.id and r.status <> 'rejected')`;
      const parts = await tx`delete from participations where created_at < now() - interval '12 months'`;
      await tx`update solidarity set ip_hash = 'purged' where ip_hash <> 'purged' and created_at < now() - interval '30 days'`;
      await tx`delete from solidarity where created_at < now() - interval '12 months'`;
      await tx`delete from code_groups g where not exists (select 1 from participations p where p.school_uai = g.school_uai and p.code_hash = g.code_hash)`;
      const rejected = await tx`delete from reports where status = 'rejected' and moderated_at < now() - interval '30 days'`;
      const rl = await tx`delete from rate_limits where window_start < now() - interval '48 hours'`;
      await tx`delete from pow_used where used_at < now() - interval '1 day'`;
      const logs = await tx`delete from error_logs where at < now() - interval '90 days'`;
      const dr = await tx`delete from deletion_requests where created_at < now() - interval '12 months'`;
      const drc = await tx`update deletion_requests set contact = null where status <> 'open' and contact is not null`;
      const ab = await tx`delete from abuse_reports where created_at < now() - interval '12 months'`;
      const au = await tx`delete from admin_audit where at < now() - interval '12 months'`;
      return { ip: ip.count, parts: parts.count, rejected: rejected.count, rl: rl.count, logs: logs.count, dr: dr.count + drc.count, ab: ab.count, au: au.count };
    });
    return json({ ok: true, ...r });
  } catch (e) {
    await logError("cron/purge", e);
    return json({ error: "échec" }, 500);
  }
}
