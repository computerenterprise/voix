import { sql } from "@/lib/db";
import { categoryLabel } from "@/lib/categories";

export default async function AdminStats() {
  const [[s], top, cats, audit] = await Promise.all([
    sql<Record<string, number>[]>`
      select
        (select count(*)::int from participations where status = 'counted') as counted,
        (select count(*)::int from participations where status = 'suspended') as suspended,
        (select count(*)::int from participations where status = 'removed') as removed,
        (select count(*)::int from participations where created_at > now() - interval '24 hours') as last24,
        (select count(*)::int from participations where created_at > now() - interval '1 hour') as last1h,
        (select count(*)::int from reports where status = 'pending') as pending,
        (select count(*)::int from reports where status = 'approved') as approved,
        (select count(*)::int from reports where status = 'rejected') as rejected,
        (select count(distinct school_uai)::int from participations) as schools,
        (select count(*)::int from schools) as total_schools,
        (select count(*)::int from error_logs where at > now() - interval '24 hours') as errors24`,
    sql<{ uai: string; name: string; city: string; n: number; s: number }[]>`
      select p.school_uai as uai, s.name, s.city, count(*) filter (where p.status = 'counted')::int as n,
             count(*) filter (where p.status = 'suspended')::int as s
      from participations p join schools s on s.uai = p.school_uai group by 1, 2, 3 order by n desc limit 15`,
    sql<{ key: string; n: number }[]>`
      select c as key, count(*)::int as n from participations p, unnest(p.categories) c where p.status = 'counted' group by c order by n desc`,
    sql<{ at: Date; action: string; target: string | null; detail: string | null }[]>`select at, action, target, detail from admin_audit order by at desc limit 15`,
  ]);
  const tiles: [string, number][] = [
    ["Participations comptées", s.counted], ["Suspendues", s.suspended], ["Retirées", s.removed],
    ["Dernières 24 h", s.last24], ["Dernière heure", s.last1h], ["Lycées actifs", s.schools],
    ["Messages en attente", s.pending], ["Messages publiés", s.approved], ["Messages refusés", s.rejected],
    ["Lycées référencés", s.total_schools], ["Erreurs (24 h)", s.errors24],
  ];
  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {tiles.map(([l, n]) => (
          <div key={l} className="card p-4"><p className="font-display text-3xl font-extrabold">{n.toLocaleString("fr-FR")}</p><p className="text-xs text-muted">{l}</p></div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-bold">Lycées les plus actifs (interne, ne pas publier comme classement)</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {top.map((t) => (
                <tr key={t.uai} className="border-t border-line">
                  <td className="py-2"><a className="link" href={`/lycee/${t.uai}`}>{t.name}</a> <span className="text-muted">· {t.city}</span></td>
                  <td className="py-2 text-right tabular-nums">{t.n}{t.s ? <span className="text-signal-ink"> (+{t.s} susp.)</span> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card p-5">
          <h2 className="font-bold">Préoccupations (national)</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {cats.map((c) => <tr key={c.key} className="border-t border-line"><td className="py-2">{categoryLabel(c.key)}</td><td className="py-2 text-right tabular-nums">{c.n}</td></tr>)}
            </tbody>
          </table>
          <h2 className="mt-6 font-bold">Journal d&apos;administration</h2>
          <ul className="mt-2 text-xs text-ink-2">
            {audit.map((a, i) => <li key={i} className="border-t border-line py-1.5">{a.at.toLocaleString("fr-FR")} · {a.action} {a.target} {a.detail}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
