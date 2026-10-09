import "server-only";
import { sql } from "./db";
import { memo } from "./memo";

export type LiveCounts = { participations: number; schools: number; solidaires: number };

/** Compteurs du tableau, une seule requête légère, mise en cache 5 s par instance. */
export const liveCounts = memo(async (): Promise<LiveCounts> => {
  const [row] = await sql<LiveCounts[]>`
    select
      (select count(*)::int from participations where status = 'counted') as participations,
      (select count(distinct school_uai)::int from participations where status = 'counted') as schools,
      (select count(*)::int from solidarity where status = 'counted') as solidaires`;
  return row;
}, 5_000);
