import { sql } from "@/lib/db";
import { normalize } from "@/lib/normalize";
import { CATEGORIES, CONCERN_STATUSES } from "@/lib/categories";
import { toggleSchool, setConcernStatus } from "../actions";

export default async function Schools({ searchParams }: { searchParams: Promise<{ q?: string; uai?: string }> }) {
  const { q = "", uai } = await searchParams;
  const n = normalize(q);
  const list = n.length >= 2
    ? await sql<{ uai: string; name: string; city: string; hidden: boolean }[]>`
        select uai, name, city, hidden from schools where search like ${"%" + n + "%"} or uai = ${q.toUpperCase().trim()} order by name limit 30`
    : [];
  const selected = uai
    ? (await sql<{ uai: string; name: string; city: string; hidden: boolean }[]>`select uai, name, city, hidden from schools where uai = ${uai}`)[0]
    : null;
  const statuses = selected ? await sql<{ category: string; status: string; note: string | null }[]>`select category, status, note from concern_status where school_uai = ${selected.uai}` : [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <h2 className="font-display text-2xl font-bold">Lycées</h2>
        <form className="mt-3 flex gap-2">
          <input name="q" defaultValue={q} placeholder="Nom, ville ou UAI" className="flex-1 rounded-full border border-line bg-white px-4 py-2" />
          <button className="btn btn-dark btn-sm">Chercher</button>
        </form>
        <p className="mt-2 text-xs text-muted">Pour ajouter ou mettre à jour des lycées : réimporter l&apos;annuaire officiel (npm run db:import).</p>
        <ul className="mt-3 grid gap-2">
          {list.map((s) => (
            <li key={s.uai} className="card flex items-center justify-between gap-2 p-3 text-sm">
              <a className="link" href={`/admin/lycees?q=${encodeURIComponent(q)}&uai=${s.uai}`}>{s.name} · {s.city} <span className="text-muted">({s.uai})</span></a>
              {s.hidden && <span className="chip bg-signal-soft text-signal-ink">masqué</span>}
            </li>
          ))}
        </ul>
      </section>
      {selected && (
        <section className="card p-5">
          <h3 className="text-lg font-bold">{selected.name}</h3>
          <p className="text-sm text-muted">{selected.city} · {selected.uai} · <a className="link" href={`/lycee/${selected.uai}`} target="_blank">page publique</a></p>
          <form action={toggleSchool} className="mt-3">
            <input type="hidden" name="uai" value={selected.uai} />
            <input type="hidden" name="hidden" value={selected.hidden ? "0" : "1"} />
            <button className="btn btn-ghost btn-sm">{selected.hidden ? "Réafficher le lycée" : "Masquer le lycée"}</button>
          </form>
          <h4 className="mt-6 font-bold">État de traitement (public)</h4>
          <p className="text-xs text-muted">À renseigner uniquement quand une démarche réelle a été faite.</p>
          <div className="mt-2 grid gap-2">
            {CATEGORIES.map((c) => {
              const st = statuses.find((s) => s.category === c.key);
              return (
                <form key={c.key} action={setConcernStatus} className="grid gap-1 rounded-2xl bg-paper p-3 text-sm sm:grid-cols-[1fr_auto]">
                  <input type="hidden" name="uai" value={selected.uai} /><input type="hidden" name="category" value={c.key} />
                  <span className="font-semibold sm:col-span-2">{c.label}</span>
                  <select name="status" defaultValue={st?.status ?? ""} className="rounded-lg border border-line bg-card px-2 py-1.5">
                    <option value="">Pas encore transmis</option>
                    {Object.entries(CONCERN_STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <button className="btn btn-dark btn-sm !min-h-8">Enregistrer</button>
                  <input name="note" defaultValue={st?.note ?? ""} maxLength={280} placeholder="Note publique (facultatif, sans nom de personne)" className="rounded-lg border border-line bg-card px-2 py-1.5 sm:col-span-2" />
                </form>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
