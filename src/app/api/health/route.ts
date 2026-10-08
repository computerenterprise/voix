import { sql } from "@/lib/db";
import { json } from "@/lib/request";

export const dynamic = "force-dynamic";

/** Sonde de supervision : état de la base et présence (jamais la valeur) des réglages obligatoires. */
export async function GET() {
  const t = Date.now();
  const config = {
    APP_SECRET: (process.env.APP_SECRET?.length ?? 0) >= 32,
    ADMIN_PASSWORD_HASH: Boolean(process.env.ADMIN_PASSWORD_HASH?.startsWith("scrypt:")),
    CRON_SECRET: Boolean(process.env.CRON_SECRET),
    SITE_URL: Boolean(process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL),
  };
  const configOk = Object.values(config).every(Boolean);
  try {
    const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from schools`;
    const ok = configOk && n > 0;
    return json({ ok, db: "ok", schools: n, config, ms: Date.now() - t }, ok ? 200 : 503);
  } catch {
    return json({ ok: false, db: "down", config }, 503);
  }
}
