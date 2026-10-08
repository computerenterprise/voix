import type { Metadata } from "next";
import Link from "next/link";
import { getDashboard } from "@/lib/schools";
import { categoryLabel, CATEGORIES, MIN_FOR_CITY, MIN_FOR_DEPARTMENT } from "@/lib/categories";
import { AreaExplorer, DailyChart, HBarChart } from "@/components/Charts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Tableau national",
  description: "Les préoccupations exprimées par les lycéens et les étudiants sur VOIX, agrégées par département et par ville.",
};

export default async function Dashboard() {
  const d = await getDashboard(MIN_FOR_DEPARTMENT, MIN_FOR_CITY);
  const short = (k: string) => CATEGORIES.find((c) => c.key === k)?.short ?? categoryLabel(k);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10">
      <h1 className="font-display text-4xl font-bold sm:text-6xl">Tableau national</h1>
      <p className="mt-3 max-w-2xl text-ink-2">
        Ce que signalent les lycéens et les étudiants, agrégé. Pas de classement des établissements : un établissement avec plus de participations
        n&apos;est pas « pire » qu&apos;un autre, il est simplement plus mobilisé sur VOIX.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="card p-5">
          <p className="font-display text-4xl font-bold">{d.total.toLocaleString("fr-FR")}</p>
          <p className="text-sm text-muted">{d.total > 1 ? "participations comptabilisées" : "participation comptabilisée"}</p>
        </div>
        <div className="card p-5">
          <p className="font-display text-4xl font-bold">{d.schools.toLocaleString("fr-FR")}</p>
          <p className="text-sm text-muted">{d.schools > 1 ? "établissements avec au moins une participation" : "établissement avec au moins une participation"}</p>
        </div>
      </div>

      {d.total === 0 ? (
        <p className="card mt-6 p-6 text-ink-2">
          Aucune participation pour l&apos;instant. Les graphiques apparaîtront avec les premières participations réelles.{" "}
          <Link href="/recherche" className="link">Trouver mon établissement</Link>
        </p>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          <section className="card p-5 sm:p-6 lg:col-span-3" aria-labelledby="nat">
            <h2 id="nat" className="font-display text-2xl font-bold">Préoccupations citées</h2>
            <p className="mb-5 mt-1 text-sm text-muted">Part des participations qui citent chaque point (plusieurs choix possibles).</p>
            <HBarChart data={d.national.map((n) => ({ label: categoryLabel(n.key), value: n.supports, percent: n.percent }))} />
          </section>
          <section className="card p-5 sm:p-6 lg:col-span-2" aria-labelledby="day">
            <h2 id="day" className="font-display text-2xl font-bold">Participations par jour</h2>
            <p className="mb-5 mt-1 text-sm text-muted">30 derniers jours.</p>
            <DailyChart data={d.daily} />
          </section>
        </div>
      )}

      <section className="mt-10" aria-labelledby="dep">
        <h2 id="dep" className="font-display text-3xl font-bold">Par département</h2>
        <p className="mt-1 text-sm text-muted">Affiché à partir de {MIN_FOR_DEPARTMENT} participations dans le département.</p>
        <div className="card mt-4 p-5">
          {d.departments.length ? (
            <AreaExplorer
              kind="département"
              areas={d.departments.map((a) => ({ id: a.code, name: `${a.name} (${a.code})`, total: a.total, schools: a.schools, top: a.top.map((t) => ({ label: short(t.key), percent: t.percent })) }))}
            />
          ) : (
            <p className="text-ink-2">Pas encore assez de participations pour afficher un département.</p>
          )}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="vil">
        <h2 id="vil" className="font-display text-3xl font-bold">Par ville</h2>
        <p className="mt-1 text-sm text-muted">Affiché à partir de {MIN_FOR_CITY} participations dans la ville.</p>
        <div className="card mt-4 p-5">
          {d.cities.length ? (
            <AreaExplorer
              kind="ville"
              areas={d.cities.map((a) => ({ id: a.city, name: a.city, sub: a.department, total: a.total, schools: a.schools, top: a.top.map((t) => ({ label: short(t.key), percent: t.percent })) }))}
            />
          ) : (
            <p className="text-ink-2">Pas encore assez de participations pour afficher une ville.</p>
          )}
        </div>
      </section>

      <p className="mt-8 text-sm text-muted">
        Les participations ne sont pas des personnes vérifiées et ne constituent pas un échantillon représentatif.{" "}
        <Link href="/a-propos#limites" className="link">Méthode et limites</Link>
      </p>
    </div>
  );
}
