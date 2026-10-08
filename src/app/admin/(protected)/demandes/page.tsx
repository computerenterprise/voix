import { sql } from "@/lib/db";
import { handleDeletionRequest } from "../actions";

export default async function Requests() {
  const rows = await sql<{ id: number; details: string; contact: string | null; status: string; created_at: Date }[]>`
    select id, details, contact, status, created_at from deletion_requests order by status = 'open' desc, created_at desc limit 100`;
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Demandes de suppression</h2>
      <p className="mt-1 text-sm text-muted">
        Retrouver le contenu (Modération → Publiés, ou Lycées), le supprimer, puis marquer la demande comme traitée. Le contact est alors effacé. Délai légal : un mois maximum.
      </p>
      <ul className="mt-4 grid gap-3">
        {rows.map((r) => (
          <li key={r.id} className="card p-5">
            <p className="text-xs text-muted">#{r.id} · {r.created_at.toLocaleString("fr-FR")} · <strong>{r.status}</strong></p>
            <p className="mt-2 whitespace-pre-wrap">{r.details}</p>
            {r.contact && <p className="mt-2 text-sm">Contact : <span className="font-mono">{r.contact}</span></p>}
            {r.status === "open" && (
              <div className="mt-3 flex gap-2">
                <form action={handleDeletionRequest}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="done" /><button className="btn btn-dark btn-sm">Traitée</button></form>
                <form action={handleDeletionRequest}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="rejected" /><button className="btn btn-ghost btn-sm">Rejeter</button></form>
              </div>
            )}
          </li>
        ))}
        {rows.length === 0 && <li className="card p-6 text-muted">Aucune demande.</li>}
      </ul>
    </div>
  );
}
