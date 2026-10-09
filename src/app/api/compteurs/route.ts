import { json } from "@/lib/request";
import { liveCounts } from "@/lib/live-counts";

export const dynamic = "force-dynamic";

/** Compteurs publics du tableau, rafraîchis en direct par la page (agrégats uniquement). */
export async function GET() {
  try {
    return json(await liveCounts(), 200, { "cache-control": "no-store" });
  } catch {
    return json({ error: "indisponible" }, 503);
  }
}
