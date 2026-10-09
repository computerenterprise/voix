import "server-only";
import { sql } from "./db";
import { hmac } from "./security";
import { normalize } from "./normalize";
import { CATEGORY_KEYS, type CategoryKey } from "./categories";

/**
 * Mot de passe facultatif, choisi librement par les élèves d'un établissement (ex. trois mots).
 * VOIX ne le connaît pas à l'avance : les participations qui donnent le même mot de passe pour le même
 * établissement sont regroupées. Seule une empreinte HMAC est stockée, jamais le mot de passe en clair.
 * Saisie tolérante : majuscules, accents, ponctuation et espaces multiples sont ignorés (l'ordre des mots compte).
 */
export const normalizeCode = (code: string) => normalize(code).replace(/[^a-z0-9]+/g, " ").trim();
export const CODE_MIN_LENGTH = 6;
export const codeHash = (uai: string, code: string) => hmac(`${uai}|${normalizeCode(code)}`, "school-code");

/** Nombre de voix au même mot de passe à partir duquel un groupe est « confirmé » et peut être publié. */
export const GROUP_MIN = Math.max(2, Number(process.env.CODE_GROUP_MIN) || 5);

export type CodeGroup = {
  code_hash: string;
  votes: number;
  verifying: number;
  connections: number;
  published: boolean;
  categories: { key: CategoryKey; n: number }[];
};

const withCategories = (rows: { key: string; n: number }[]) =>
  CATEGORY_KEYS.map((key) => ({ key, n: rows.find((r) => r.key === key)?.n ?? 0 })).sort((a, b) => b.n - a.n);

/**
 * Groupes d'un établissement, du plus grand au plus petit. Un groupe retient les votes comptés et ceux
 * en vérification : le wifi d'un lycée met souvent plusieurs élèves sur la même connexion.
 */
export async function listGroups(uai: string): Promise<CodeGroup[]> {
  const groups = await sql<Omit<CodeGroup, "categories">[]>`
    select p.code_hash, count(*)::int as votes, count(*) filter (where p.status = 'pending')::int as verifying,
           count(distinct p.ip_hash)::int as connections, coalesce(bool_or(g.published), false) as published
    from participations p
    left join code_groups g on g.school_uai = p.school_uai and g.code_hash = p.code_hash
    where p.school_uai = ${uai} and p.code_hash is not null and p.status in ('counted', 'pending')
    group by p.code_hash order by votes desc, p.code_hash`;
  if (!groups.length) return [];
  const cats = await sql<{ code_hash: string; key: string; n: number }[]>`
    select p.code_hash, c as key, count(*)::int as n from participations p, unnest(p.categories) c
    where p.school_uai = ${uai} and p.code_hash is not null and p.status in ('counted', 'pending') group by p.code_hash, c`;
  return groups.map((g) => ({ ...g, categories: withCategories(cats.filter((c) => c.code_hash === g.code_hash)) }));
}

/** Tableau public : réunit les groupes publiés par l'équipe (en pratique, un par établissement). */
export async function publishedBoard(uai: string): Promise<{ votes: number; categories: { key: CategoryKey; n: number }[] }> {
  const rows = await sql<{ id: number; categories: string[] }[]>`
    select p.id, p.categories from participations p
    join code_groups g on g.school_uai = p.school_uai and g.code_hash = p.code_hash and g.published
    where p.school_uai = ${uai} and p.status in ('counted', 'pending')`;
  const counts = new Map<string, number>();
  for (const r of rows) for (const c of r.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
  return { votes: rows.length, categories: withCategories([...counts].map(([key, n]) => ({ key, n }))) };
}

/** Établissements ayant au moins un groupe confirmé pas encore publié : à examiner par l'équipe. */
export async function groupsToReview() {
  return sql<{ uai: string; name: string; city: string; votes: number }[]>`
    select s.uai, s.name, s.city, max(x.votes)::int as votes from (
      select p.school_uai, p.code_hash, count(*) as votes from participations p
      where p.code_hash is not null and p.status in ('counted', 'pending') group by 1, 2 having count(*) >= ${GROUP_MIN}
    ) x
    join schools s on s.uai = x.school_uai
    left join code_groups g on g.school_uai = x.school_uai and g.code_hash = x.code_hash
    where not coalesce(g.published, false)
    group by s.uai, s.name, s.city order by votes desc limit 30`;
}

export async function setGroupPublished(uai: string, hash: string, published: boolean) {
  await sql`
    insert into code_groups (school_uai, code_hash, published) values (${uai}, ${hash}, ${published})
    on conflict (school_uai, code_hash) do update set published = excluded.published, updated_at = now()`;
}

/** Valide d'un coup les voix « en vérification » d'un groupe (elles deviennent comptées). */
export async function validateGroup(uai: string, hash: string) {
  const r = await sql`
    update participations set status = 'counted', flags = '{}', updated_at = now()
    where school_uai = ${uai} and code_hash = ${hash} and status = 'pending'`;
  return r.count;
}
