import { sql } from "@/lib/db";
import { clearErrors } from "../actions";

export default async function Errors() {
  const rows = await sql<{ id: number; at: Date; source: string; message: string; digest: string | null }[]>`
    select id, at, source, message, digest from error_logs order by at desc limit 200`;
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Erreurs techniques</h2>
        <form action={clearErrors}><button className="btn btn-ghost btn-sm">Vider</button></form>
      </div>
      <p className="mt-1 text-sm text-muted">Sans IP ni identifiant. Supervision externe conseillée sur /api/health.</p>
      <div className="card mt-4 overflow-x-auto p-4">
        <table className="w-full text-xs">
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="whitespace-nowrap py-2 pr-3">{r.at.toLocaleString("fr-FR")}</td>
                <td className="pr-3 font-semibold">{r.source}</td>
                <td className="font-mono">{r.message}{r.digest && <span className="text-muted"> ({r.digest})</span>}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="py-3 text-muted">Aucune erreur enregistrée.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
