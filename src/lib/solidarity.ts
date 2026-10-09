import "server-only";
import { sql } from "./db";
import { memo } from "./memo";

/** Code utilisé pour lier la preuve anti-robot au soutien national (pas un établissement). */
export const SOLIDARITY_SCOPE = "0000000F";

/** Au-delà, les nouveaux soutiens d'une même connexion dans la journée sont enregistrés sans être comptés. */
export const SOLIDARITY_IP_MAX = 5;

/** « Je suis solidaire » : soutien à la cause, un seul par navigateur. */
export async function addSolidarity(deviceHash: string, ipHash: string): Promise<"ok" | "already"> {
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from solidarity where ip_hash = ${ipHash} and created_at > now() - interval '24 hours'`;
  const rows = await sql`
    insert into solidarity (device_hash, ip_hash, status)
    values (${deviceHash}, ${ipHash}, ${n >= SOLIDARITY_IP_MAX ? "suspended" : "counted"})
    on conflict (device_hash) do nothing returning id`;
  return rows.length ? "ok" : "already";
}

export async function isSolidary(deviceHash: string | undefined) {
  if (!deviceHash) return false;
  const [row] = await sql`select 1 from solidarity where device_hash = ${deviceHash}`;
  return !!row;
}

/** Personnes solidaires partout en France (cache court : la page d'accueil reçoit le plus de trafic). */
export const solidarityTotal = memo(async (): Promise<number> => {
  const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from solidarity where status = 'counted'`;
  return n;
}, 3_000);
