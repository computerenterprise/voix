import { sql } from "@/lib/db";
import { categoryLabel } from "@/lib/categories";
import { setParticipationStatus, suspendIpGroup } from "../actions";

const FLAGS: Record<string, string> = {
  piege: "Champ piège rempli (robot)", trop_rapide: "Envoi en moins de 1,5 s", ip_partagee: "Connexion partagée (≥10 / 24 h)",
  rafale_ip: "Rafale depuis une connexion (≥40 / 24 h)", pic_lycee: "Pic sur le lycée (≥100 / 10 min)",
};

export default async function Suspicious() {
  const groups = await sql<{ ip_hash: string; uai: string; name: string; n: number; counted: number; first: Date; last: Date }[]>`
    select p.ip_hash, p.school_uai as uai, s.name, count(*)::int as n, count(*) filter (where p.status = 'counted')::int as counted,
           min(p.created_at) as first, max(p.created_at) as last
    from participations p join schools s on s.uai = p.school_uai
    where p.created_at > now() - interval '7 days' and p.ip_hash <> 'purged'
    group by 1, 2, 3 having count(*) >= 5 order by n desc limit 30`;
  const rows = await sql<{ id: number; uai: string; name: string; categories: string[]; status: string; flags: string[]; created_at: Date }[]>`
    select p.id, p.school_uai as uai, s.name, p.categories, p.status, p.flags, p.created_at
    from participations p join schools s on s.uai = p.school_uai
    where p.status <> 'counted' or cardinality(p.flags) > 0 order by p.created_at desc limit 200`;
  return (
    <div className="grid gap-8">
      <section>
        <h2 className="font-display text-2xl font-extrabold">Groupes par connexion (7 jours, ≥ 5)</h2>
        <p className="mt-1 text-sm text-muted">Une même empreinte de connexion peut être un wifi de lycée partagé : vérifier le rythme avant de suspendre.</p>
        <div className="card mt-3 overflow-x-auto p-4">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted"><tr><th className="py-1">Lycée</th><th>Connexion</th><th>Total</th><th>Comptées</th><th>Période</th><th /></tr></thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.ip_hash + g.uai} className="border-t border-line">
                  <td className="py-2">{g.name}</td><td className="font-mono text-xs">{g.ip_hash.slice(0, 10)}…</td>
                  <td className="tabular-nums">{g.n}</td><td className="tabular-nums">{g.counted}</td>
                  <td className="text-xs">{g.first.toLocaleString("fr-FR")} → {g.last.toLocaleTimeString("fr-FR")}</td>
                  <td>{g.counted > 0 && (
                    <form action={suspendIpGroup}><input type="hidden" name="ip" value={g.ip_hash} /><input type="hidden" name="uai" value={g.uai} /><button className="btn btn-dark btn-sm">Suspendre le groupe</button></form>
                  )}</td>
                </tr>
              ))}
              {groups.length === 0 && <tr><td colSpan={6} className="py-3 text-muted">Aucun groupe.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl font-extrabold">Participations signalées ou suspendues</h2>
        <ul className="mt-3 grid gap-2">
          {rows.map((r) => (
            <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-semibold">#{r.id} · {r.name} <span className="chip ml-1 bg-paper-2">{r.status}</span></p>
                <p className="text-muted">{r.created_at.toLocaleString("fr-FR")} · {r.categories.map(categoryLabel).join(", ")}</p>
                <p className="mt-1 flex flex-wrap gap-1">{r.flags.map((f) => <span key={f} className="chip bg-signal-soft text-signal-ink">{FLAGS[f] ?? f}</span>)}</p>
              </div>
              <div className="flex gap-2">
                {(["counted", "suspended", "removed"] as const).filter((s) => s !== r.status).map((s) => (
                  <form key={s} action={setParticipationStatus}>
                    <input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value={s} />
                    <button className={`btn btn-sm ${s === "counted" ? "btn-ghost" : "btn-dark"}`}>{s === "counted" ? "Valider" : s === "suspended" ? "Suspendre" : "Retirer"}</button>
                  </form>
                ))}
              </div>
            </li>
          ))}
          {rows.length === 0 && <li className="card p-6 text-muted">Aucune participation suspecte.</li>}
        </ul>
      </section>
    </div>
  );
}
