import "server-only";
import { sql } from "./db";

/**
 * Limitation de débit en fenêtre fixe, stockée dans PostgreSQL : fonctionne avec plusieurs instances serverless.
 * Renvoie true si la requête est autorisée.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000);
  const [row] = await sql<{ count: number }[]>`
    insert into rate_limits (key, window_start, count) values (${key}, ${windowStart}, 1)
    on conflict (key, window_start) do update set count = rate_limits.count + 1
    returning count`;
  return row.count <= limit;
}
