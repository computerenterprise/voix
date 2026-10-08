import { sql } from "@/lib/db";
import { categoryLabel } from "@/lib/categories";
import { moderateReport, deleteReport } from "../actions";

const FLAG_LABELS: Record<string, string> = {
  personne_nommee: "Personne nommée ?", menace: "Menace ?", haine: "Haine ?", insulte: "Insulte ?", mobilisation: "Mobilisation / police ?", spam: "Spam ?",
};

export default async function Moderation({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const vue = (await searchParams).vue === "publies" ? "approved" : "pending";
  const rows = await sql<{ id: number; body: string; category: string; auto_flags: string[]; created_at: Date; uai: string; name: string; city: string; pstatus: string; pflags: string[] }[]>`
    select r.id, r.body, r.category, r.auto_flags, r.created_at, s.uai, s.name, s.city, p.status as pstatus, p.flags as pflags
    from reports r join schools s on s.uai = r.school_uai join participations p on p.id = r.participation_id
    where r.status = ${vue} order by ${vue === "pending" ? sql`cardinality(r.auto_flags) desc, r.created_at` : sql`r.moderated_at desc`} limit 100`;
  return (
    <div>
      <div className="flex gap-2 text-sm font-semibold">
        <a href="/admin/moderation" className={`rounded-full px-3 py-1.5 ${vue === "pending" ? "bg-ink text-paper" : "bg-card ring-1 ring-line"}`}>En attente</a>
        <a href="/admin/moderation?vue=publies" className={`rounded-full px-3 py-1.5 ${vue === "approved" ? "bg-ink text-paper" : "bg-card ring-1 ring-line"}`}>Publiés</a>
      </div>
      <p className="mt-3 text-sm text-muted">
        Publier uniquement des constats sur des problèmes. Refuser toute personne identifiable, donnée personnelle, insulte, menace, appel à la violence ou au blocage.
      </p>
      {rows.length === 0 && <p className="card mt-4 p-6 text-muted">Rien à traiter.</p>}
      <ul className="mt-4 grid gap-3">
        {rows.map((r) => (
          <li key={r.id} className="card p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="chip bg-paper-2">{categoryLabel(r.category)}</span>
              <a className="font-semibold underline" href={`/lycee/${r.uai}`} target="_blank">{r.name} · {r.city}</a>
              <span className="text-muted">{r.created_at.toLocaleString("fr-FR")}</span>
              {r.auto_flags.map((f) => <span key={f} className="chip bg-signal-soft text-signal-ink">{FLAG_LABELS[f] ?? f}</span>)}
              {r.pstatus !== "counted" && <span className="chip bg-ink text-paper">participation {r.pstatus}</span>}
              {r.pflags.map((f) => <span key={f} className="chip bg-paper-2 text-muted">{f}</span>)}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-lg">{r.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {vue === "pending" && (
                <form action={moderateReport}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="decision" value="approved" /><button className="btn btn-primary btn-sm">Publier</button></form>
              )}
              <form action={moderateReport}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="decision" value="rejected" /><button className="btn btn-dark btn-sm">{vue === "pending" ? "Refuser" : "Retirer"}</button></form>
              <form action={deleteReport}><input type="hidden" name="id" value={r.id} /><button className="btn btn-ghost btn-sm">Supprimer définitivement</button></form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
