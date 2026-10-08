import "server-only";
import { memo } from "./memo";
import { sql } from "./db";
import { queryTokens, normalize } from "./normalize";
import { CATEGORY_KEYS, type CategoryKey, type ConcernStatus } from "./categories";

export type SchoolLite = {
  uai: string;
  name: string;
  city: string;
  postal_code: string;
  sector: string;
  tracks: string[];
  department_name: string;
};

export type School = SchoolLite & { department_code: string; academy: string; hidden: boolean };

/**
 * Recherche par nom, ville ou code postal.
 * 1) tous les jetons doivent apparaître (nom + ville normalisés) ; 2) à défaut, recherche approximative (fautes de frappe).
 */
export async function searchSchools(q: string, limit = 8): Promise<{ results: SchoolLite[]; fuzzy: boolean }> {
  const raw = q.trim().slice(0, 80);
  if (raw.length < 2) return { results: [], fuzzy: false };

  const digits = raw.replace(/\s/g, "");
  if (/^\d{2,5}$/.test(digits)) {
    const results = await sql<SchoolLite[]>`
      select uai, name, city, postal_code, sector, tracks, department_name from schools
      where not hidden and postal_code like ${digits + "%"}
      order by postal_code, city, name limit ${limit}`;
    return { results, fuzzy: false };
  }
  if (/^\d{7}[a-z]$/i.test(digits)) {
    const results = await sql<SchoolLite[]>`
      select uai, name, city, postal_code, sector, tracks, department_name from schools
      where not hidden and uai = ${digits.toUpperCase()}`;
    return { results, fuzzy: false };
  }

  const tokens = queryTokens(raw);
  if (!tokens.length) return { results: [], fuzzy: false };
  const full = normalize(raw);
  const patterns = tokens.map((t) => "%" + t + "%");

  const strict = await sql<SchoolLite[]>`
    select uai, name, city, postal_code, sector, tracks, department_name from schools
    where not hidden and search like all(${patterns}::text[])
    order by similarity(search, ${full}) desc, name limit ${limit}`;
  if (strict.length) return { results: strict, fuzzy: false };

  const fuzzy = await sql<SchoolLite[]>`
    select uai, name, city, postal_code, sector, tracks, department_name from schools
    where not hidden and word_similarity(${tokens.join(" ")}, search) >= 0.4
    order by word_similarity(${tokens.join(" ")}, search) desc, name limit ${limit}`;
  return { results: fuzzy, fuzzy: true };
}

export async function getSchool(uai: string): Promise<School | null> {
  if (!/^\d{7}[A-Z]$/.test(uai)) return null;
  const [s] = await sql<School[]>`
    select uai, name, city, postal_code, department_code, department_name, academy, sector, tracks, hidden
    from schools where uai = ${uai}`;
  return s ?? null;
}

export type CategoryResult = {
  key: CategoryKey;
  supports: number;
  percent: number | null;
  reports: number;
  status: ConcernStatus | null;
  statusNote: string | null;
};

export type SchoolResults = {
  total: number;
  categories: CategoryResult[];
  testimonies: { category: CategoryKey; body: string; created_at: string }[];
  pendingReports: number;
  updatedAt: string;
};

async function computeSchoolResults(uai: string): Promise<SchoolResults> {
  const [[{ total }], supports, reports, statuses, testimonies] = await Promise.all([
    sql<{ total: number }[]>`select count(*)::int as total from participations where school_uai = ${uai} and status = 'counted'`,
    sql<{ category: string; n: number }[]>`
      select c as category, count(*)::int as n
      from participations p, unnest(p.categories) c
      where p.school_uai = ${uai} and p.status = 'counted' group by c`,
    sql<{ category: string; status: string; n: number }[]>`
      select r.category, r.status, count(*)::int as n from reports r
      join participations p on p.id = r.participation_id and p.status = 'counted'
      where r.school_uai = ${uai} and r.status <> 'rejected' group by r.category, r.status`,
    sql<{ category: string; status: ConcernStatus; note: string | null }[]>`
      select category, status, note from concern_status where school_uai = ${uai}`,
    sql<{ category: CategoryKey; body: string; created_at: Date }[]>`
      select r.category, r.body, r.created_at from reports r
      join participations p on p.id = r.participation_id and p.status = 'counted'
      where r.school_uai = ${uai} and r.status = 'approved' order by r.moderated_at desc limit 6`,
  ]);

  const categories: CategoryResult[] = CATEGORY_KEYS.map((key) => {
    const n = supports.find((s) => s.category === key)?.n ?? 0;
    const st = statuses.find((s) => s.category === key);
    return {
      key,
      supports: n,
      percent: total > 0 ? Math.round((n / total) * 100) : null,
      reports: reports.filter((r) => r.category === key).reduce((a, r) => a + r.n, 0),
      status: st?.status ?? null,
      statusNote: st?.note ?? null,
    };
  }).sort((a, b) => b.supports - a.supports || CATEGORY_KEYS.indexOf(a.key) - CATEGORY_KEYS.indexOf(b.key));

  return {
    total,
    categories,
    testimonies: testimonies.map((t) => ({ ...t, created_at: t.created_at.toISOString() })),
    pendingReports: reports.filter((r) => r.status === "pending").reduce((a, r) => a + r.n, 0),
    updatedAt: new Date().toISOString(),
  };
}

/** Résultats mis en cache 15 s par instance : absorbe les pics de trafic sur une même page de lycée. */
export const getSchoolResultsCached = memo(computeSchoolResults, 15_000);
export const getSchoolResultsFresh = computeSchoolResults;

export type HomeStats = { participations: number; schools: number; moderated: number; totalSchools: number };

export const getHomeStats = memo(
  async (): Promise<HomeStats> => {
    const [row] = await sql<HomeStats[]>`
      select
        (select count(*)::int from participations where status = 'counted') as participations,
        (select count(distinct school_uai)::int from participations where status = 'counted') as schools,
        (select count(*)::int from reports where status = 'approved') as moderated,
        (select count(*)::int from schools where not hidden) as "totalSchools"`;
    return row;
  },
  30_000,
);

export type Dashboard = {
  total: number;
  schools: number;
  national: { key: CategoryKey; supports: number; percent: number }[];
  departments: { code: string; name: string; total: number; schools: number; top: { key: CategoryKey; percent: number }[] }[];
  cities: { city: string; department: string; total: number; schools: number; top: { key: CategoryKey; percent: number }[] }[];
  daily: { day: string; n: number }[];
};

export const getDashboard = memo(
  async (minDept: number, minCity: number): Promise<Dashboard> => {
    const [[tot], national, deptRows, cityRows, daily] = await Promise.all([
      sql<{ total: number; schools: number }[]>`
        select count(*)::int as total, count(distinct school_uai)::int as schools from participations where status = 'counted'`,
      sql<{ key: CategoryKey; supports: number }[]>`
        select c as key, count(*)::int as supports from participations p, unnest(p.categories) c
        where p.status = 'counted' group by c`,
      sql<{ code: string; name: string; key: CategoryKey; n: number; total: number; schools: number }[]>`
        with p as (
          select p.*, s.department_code, s.department_name from participations p join schools s on s.uai = p.school_uai
          where p.status = 'counted'),
        t as (select department_code, department_name, count(*)::int as total, count(distinct school_uai)::int as schools
              from p group by 1, 2 having count(*) >= ${minDept})
        select t.department_code as code, t.department_name as name, c as key, count(*)::int as n, t.total, t.schools
        from t join p on p.department_code = t.department_code, unnest(p.categories) c
        group by 1, 2, 3, t.total, t.schools`,
      sql<{ city: string; department: string; key: CategoryKey; n: number; total: number; schools: number }[]>`
        with p as (
          select p.*, s.city, s.department_name from participations p join schools s on s.uai = p.school_uai
          where p.status = 'counted'),
        t as (select city, department_name, count(*)::int as total, count(distinct school_uai)::int as schools
              from p group by 1, 2 having count(*) >= ${minCity})
        select t.city, t.department_name as department, c as key, count(*)::int as n, t.total, t.schools
        from t join p on p.city = t.city and p.department_name = t.department_name, unnest(p.categories) c
        group by 1, 2, 3, t.total, t.schools`,
      sql<{ day: string; n: number }[]>`
        select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day, count(*)::int as n
        from participations where status = 'counted' and created_at > now() - interval '30 days' group by 1 order by 1`,
    ]);
    const total = tot.total;
    const group = <T extends { key: CategoryKey; n: number; total: number }>(rows: T[], id: (r: T) => string) => {
      const m = new Map<string, T[]>();
      for (const r of rows) m.set(id(r), [...(m.get(id(r)) ?? []), r]);
      return [...m.values()];
    };
    const top = (rows: { key: CategoryKey; n: number; total: number }[]) =>
      rows
        .map((r) => ({ key: r.key, percent: Math.round((r.n / r.total) * 100) }))
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 3);
    return {
      total,
      schools: tot.schools,
      national: national
        .map((r) => ({ ...r, percent: total ? Math.round((r.supports / total) * 100) : 0 }))
        .sort((a, b) => b.supports - a.supports),
      departments: group(deptRows, (r) => r.code)
        .map((rs) => ({ code: rs[0].code, name: rs[0].name, total: rs[0].total, schools: rs[0].schools, top: top(rs) }))
        .sort((a, b) => a.code.localeCompare(b.code)),
      cities: group(cityRows, (r) => r.city + "|" + r.department)
        .map((rs) => ({ city: rs[0].city, department: rs[0].department, total: rs[0].total, schools: rs[0].schools, top: top(rs) }))
        .sort((a, b) => a.city.localeCompare(b.city)),
      daily,
    };
  },
  60_000,
);
