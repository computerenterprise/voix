import { sql } from "@/lib/db";
import { json } from "@/lib/request";
import { safeEqual } from "@/lib/security";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

/** Application quotidienne des durées de conservation (appelée par Vercel Cron avec CRON_SECRET). */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return json({ error: "Non autorisé" }, 401);
  try {
    const r = await sql.begin(async (tx) => {
      const ip = await tx`update participations set ip_hash = 'purged' where ip_hash <> 'purged' and created_at < now() - interval '30 days'`;
      const parts = await tx`delete from participations where created_at < now() - interval '12 months'`;
      const rejected = await tx`delete from reports where status = 'rejected' and moderated_at < now() - interval '30 days'`;
      const rl = await tx`delete from rate_limits where window_start < now() - interval '48 hours'`;
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
