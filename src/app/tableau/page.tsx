import type { Metadata } from "next";
import Link from "next/link";
import { getDashboard } from "@/lib/schools";
import { categoryLabel, CATEGORIES, MIN_FOR_CITY, MIN_FOR_DEPARTMENT } from "@/lib/categories";
import { solidarityTotal } from "@/lib/solidarity";
import { logError } from "@/lib/log";
import { AreaExplorer, DailyChart, HBarChart } from "@/components/Charts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Tableau national",
  description: "Les problèmes signalés par les lycéens et les étudiants sur VOIX, agrégés par ville.",
};

/** Une base lente ne doit jamais laisser la page en chargement infini. */
const within = <T,>(p: Promise<T>, ms = 8000) =>
  Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`délai dépassé (${ms / 1000} s)`)), ms))]);

export default async function Dashboard() {
  const [d, solidaires] = await Promise.all([
    within(getDashboard(MIN_FOR_DEPARTMENT, MIN_FOR_CITY)).catch((e) => {
      void logError("tableau", e);
      return null;
    }),
    within(solidarityTotal()).catch(() => 0),
  ]);
  if (!d) {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-10">
        <h1 className="font-display text-4xl font-bold sm:text-6xl">Tableau national</h1>
        <p className="card mt-8 p-6 text-ink-2">Le tableau est momentanément indisponible. Réessaie dans quelques minutes.</p>
      </div>
    );
  }
  const short = (k: string) => CATEGORIES.find((c) => c.key === k)?.short ?? categoryLabel(k);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10">
      <h1 className="font-display text-4xl font-bold sm:text-6xl">Tableau national</h1>
      <p className="mt-3 max-w-2xl text-ink-2">
        Ce que signalent les lycéens et les étudiants, agrégé. Pas de classement des établissements : un établissement avec plus de participations
        n&apos;est pas « pire » qu&apos;un autre, il est simplement plus mobilisé sur VOIX.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          [d.total, d.total > 1 ? "participations" : "participation"],
          [d.schools, d.schools > 1 ? "établissements" : "établissement"],
          [solidaires, solidaires > 1 ? "personnes solidaires" : "personne solidaire"],
        ].map(([n, l]) => (
          <div key={l as string} className="card px-3 py-5 text-center sm:p-6">
            <p className="font-display text-3xl font-bold tabular-nums sm:text-5xl">{(n as number).toLocaleString("fr-FR")}</p>
            <p className="mt-1 text-xs leading-snug text-muted sm:text-sm">{l}</p>
          </div>
        ))}
      </div>

      {d.total === 0 ? (
        <p className="card mt-6 p-6 text-ink-2">
          Aucune participation pour l&apos;instant. Les graphiques apparaîtront avec les premières participations réelles.{" "}
          <Link href="/recherche" className="link">Trouver mon établissement</Link>
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          <section className="card p-5 sm:p-6" aria-labelledby="nat">
            <h2 id="nat" className="font-display text-2xl font-bold">Problèmes cités</h2>
            <p className="mb-5 mt-1 text-sm text-muted">Part des participations qui citent chaque point (plusieurs choix possibles).</p>
            <HBarChart data={d.national.map((n) => ({ label: categoryLabel(n.key), value: n.supports, percent: n.percent }))} />
          </section>
          <section className="card p-5 sm:p-6" aria-labelledby="day">
            <h2 id="day" className="font-display text-2xl font-bold">Participations par jour</h2>
            <p className="mb-5 mt-1 text-sm text-muted">30 derniers jours.</p>
            <DailyChart data={d.daily} />
          </section>
        </div>
      )}

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
