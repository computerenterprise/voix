import "server-only";
import { sql } from "./db";

/** Au-delà, les nouveaux soutiens d'une même connexion (même jour, même établissement) sont enregistrés sans être comptés. */
export const SOLIDARITY_IP_MAX = 5;

/** Ajoute le soutien « Je suis solidaire » d'un navigateur. Un seul par navigateur et par établissement. */
export async function addSolidarity(uai: string, deviceHash: string, ipHash: string): Promise<"ok" | "already" | "unknown"> {
  const [school] = await sql`select 1 from schools where uai = ${uai} and not hidden`;
  if (!school) return "unknown";
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from solidarity
    where ip_hash = ${ipHash} and school_uai = ${uai} and created_at > now() - interval '24 hours'`;
  const rows = await sql`
    insert into solidarity (school_uai, device_hash, ip_hash, status)
    values (${uai}, ${deviceHash}, ${ipHash}, ${n >= SOLIDARITY_IP_MAX ? "suspended" : "counted"})
    on conflict (school_uai, device_hash) do nothing returning id`;
  return rows.length ? "ok" : "already";
}

export async function isSolidary(uai: string, deviceHash: string | undefined) {
  if (!deviceHash) return false;
  const [row] = await sql`select 1 from solidarity where school_uai = ${uai} and device_hash = ${deviceHash}`;
  return !!row;
}

export async function schoolSolidarity(uai: string): Promise<number> {
  const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from solidarity where school_uai = ${uai} and status = 'counted'`;
  return n;
}
