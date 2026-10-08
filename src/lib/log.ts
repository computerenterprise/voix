import "server-only";
import { sql } from "./db";

/** Journal technique minimal : ni IP, ni identifiant, ni contenu utilisateur. */
export async function logError(source: string, err: unknown, digest?: string) {
  const message = (err instanceof Error ? `${err.name}: ${err.message}` : String(err)).slice(0, 500);
  console.error(`[voix] ${source}: ${message}`);
  try {
    await sql`insert into error_logs (source, message, digest) values (${source.slice(0, 100)}, ${message}, ${digest ?? null})`;
  } catch {
    /* la base peut être indisponible : on garde le log console */
  }
}
