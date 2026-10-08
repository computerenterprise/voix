import { z } from "zod";
import { json, sameOrigin, clientIp } from "@/lib/request";
import { rateLimit } from "@/lib/ratelimit";
import { ipHash } from "@/lib/security";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";
const Input = z.object({ message: z.string().max(500), digest: z.string().max(100).optional(), path: z.string().max(200).optional() });

/** Remontée des erreurs côté navigateur (message technique uniquement). */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({}, 403);
  const p = Input.safeParse(await req.json().catch(() => null));
  if (!p.success) return json({}, 400);
  if (!(await rateLimit(`log:${ipHash(await clientIp())}`, 20, 3600).catch(() => false))) return json({}, 429);
  await logError(`client${p.data.path ? ":" + p.data.path.replace(/[?#].*/, "") : ""}`, p.data.message, p.data.digest);
  return json({ ok: true });
}
