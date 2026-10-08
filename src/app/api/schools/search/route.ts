import { searchSchools } from "@/lib/schools";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp, json } from "@/lib/request";
import { ipHash } from "@/lib/security";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  try {
    if (!(await rateLimit(`search:${ipHash(await clientIp())}`, 120, 60))) {
      return json({ error: "Trop de recherches, réessaie dans une minute." }, 429);
    }
    const { results, fuzzy } = await searchSchools(q);
    return json({ results, fuzzy }, 200, { "cache-control": "private, max-age=60" });
  } catch (e) {
    await logError("api/search", e);
    return json({ error: "Recherche indisponible pour le moment." }, 500);
  }
}
