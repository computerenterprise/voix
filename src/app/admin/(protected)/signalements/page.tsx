import { sql } from "@/lib/db";
import { closeAbuse } from "../actions";

const REASONS: Record<string, string> = {
  donnees_personnelles: "Données personnelles", accusation: "Accusation nominative", haine: "Haine / insulte", menace: "Menace / violence", faux: "Information fausse", autre: "Autre",
};

export default async function Abuse() {
  const rows = await sql<{ id: number; target_url: string | null; reason: string; details: string | null; status: string; created_at: Date }[]>`
    select id, target_url, reason, details, status, created_at from abuse_reports order by status = 'open' desc, created_at desc limit 100`;
  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold">Signalements de contenus</h2>
      <p className="mt-1 text-sm text-muted">Contenu manifestement illicite : le retirer sans délai (Modération → Publiés → Retirer), puis clore.</p>
      <ul className="mt-4 grid gap-3">
        {rows.map((r) => (
          <li key={r.id} className="card p-5">
            <p className="text-xs text-muted">#{r.id} · {r.created_at.toLocaleString("fr-FR")} · <strong>{r.status}</strong></p>
            <p className="mt-2 font-semibold">{REASONS[r.reason] ?? r.reason}</p>
            {r.target_url && <p className="text-sm">Page : {r.target_url.startsWith("/") ? <a className="link" href={r.target_url} target="_blank">{r.target_url}</a> : r.target_url}</p>}
            {r.details && <p className="mt-2 whitespace-pre-wrap text-sm">{r.details}</p>}
            {r.status === "open" && (
              <form action={closeAbuse} className="mt-3 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={r.id} />
                <input name="note" placeholder="Décision prise (interne)" maxLength={300} className="min-w-60 flex-1 rounded-full border border-line bg-paper px-3 py-2 text-sm" />
                <button className="btn btn-dark btn-sm">Clore</button>
              </form>
            )}
          </li>
        ))}
        {rows.length === 0 && <li className="card p-6 text-muted">Aucun signalement.</li>}
      </ul>
    </div>
  );
}
