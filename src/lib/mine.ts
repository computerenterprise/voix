import "server-only";
import { sql } from "./db";
import { getDevice } from "./device";

/** Préoccupations déjà soutenues par cet appareil pour ce lycée (affichage « Soutenu ✓ » uniquement). */
export async function myCategories(uai: string): Promise<string[]> {
  const d = await getDevice(false);
  if (!d) return [];
  const [row] = await sql<{ categories: string[] }[]>`
    select categories from participations where school_uai = ${uai} and device_hash = ${d.hash} and status <> 'removed'`;
  return row?.categories ?? [];
}
