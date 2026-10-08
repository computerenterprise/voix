import { sql } from "@/lib/db";
import { json } from "@/lib/request";

export const dynamic = "force-dynamic";

/** Sonde de supervision (à brancher sur un service de monitoring externe). */
export async function GET() {
  const t = Date.now();
  try {
    await sql`select 1`;
    return json({ ok: true, db: "ok", ms: Date.now() - t });
  } catch {
    return json({ ok: false, db: "down" }, 503);
  }
}
