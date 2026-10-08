import Link from "next/link";
import { getHomeStats } from "@/lib/schools";
import { CATEGORIES } from "@/lib/categories";
import { SchoolSearch } from "@/components/SchoolSearch";

export const dynamic = "force-dynamic";

const fmt = (n: number) => n.toLocaleString("fr-FR");

export default async function Home() {
  const stats = await getHomeStats().catch(() => null);

  return (
    <>
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-12 sm:pt-20">
        <p className="rise chip bg-ink text-paper">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-signal" /> Ton lycée. Ta voix.
        </p>
        <h1 className="rise rise-2 font-display mt-5 text-[2.6rem] leading-[0.98] font-extrabold sm:text-7xl sm:leading-[0.95]">
          Et si ton lycée pouvait enfin <span className="relative whitespace-nowrap">se faire<span aria-hidden className="absolute inset-x-0 bottom-1 -z-10 h-3 bg-signal/80 sm:h-5" /></span> entendre&nbsp;?
        </h1>
        <p className="rise rise-3 mt-5 max-w-xl text-lg text-ink-2 sm:text-xl">
          Signale ce qui ne fonctionne pas, découvre les priorités de ton établissement et fais entendre ta voix.
        </p>
        <div className="rise rise-4 mt-8 max-w-xl">
          <SchoolSearch />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/recherche" className="btn btn-primary">Trouver mon lycée</Link>
            <span className="text-sm text-muted">Anonyme · 30 secondes · sans compte</span>
          </div>
        </div>
      </section>

      <section aria-label="Chiffres en direct" className="mx-auto max-w-5xl px-4">
        {stats && stats.participations > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              [fmt(stats.participations), stats.participations > 1 ? "participations comptabilisées" : "participation comptabilisée"],
              [fmt(stats.schools), stats.schools > 1 ? "lycées concernés" : "lycée concerné"],
              [fmt(stats.moderated), stats.moderated > 1 ? "témoignages relus et publiés" : "témoignage relu et publié"],
            ].map(([n, l]) => (
              <div key={l} className="card p-4 sm:p-6">
                <p className="font-display text-3xl font-extrabold sm:text-5xl">{n}</p>
                <p className="mt-1 text-xs leading-snug text-muted sm:text-sm">{l}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-2xl font-extrabold">Les premiers résultats s&apos;afficheront ici.</p>
            <p className="text-sm text-muted">
              {stats ? `${fmt(stats.totalSchools)} lycées référencés. ` : ""}Les chiffres viennent uniquement des participations réelles.
            </p>
          </div>
        )}
        <p className="mt-3 text-xs text-muted">
          Chiffres en direct issus de la base VOIX. Une participation n&apos;est pas un élève vérifié :{" "}
          <Link href="/a-propos#limites" className="link">voir nos limites</Link>.
        </p>
      </section>

      <section className="mx-auto mt-20 max-w-5xl px-4">
        <h2 className="font-display text-3xl font-extrabold sm:text-5xl">Comment ça marche</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Trouve ton lycée", "Par son nom, sa ville ou son code postal. Tous les lycées de France sont référencés."],
            ["Dis ce qui coince", "Soutiens une préoccupation existante ou ajoute la tienne. Aucun nom, aucun compte."],
            ["Partage la page", "Plus il y a de participations, plus les priorités de ton lycée sont lisibles."],
          ].map(([t, d], i) => (
            <li key={t} className="card p-6">
              <span className="font-display grid h-10 w-10 place-items-center rounded-full bg-ink text-lg font-extrabold text-paper">{i + 1}</span>
              <h3 className="mt-4 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-ink-2">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-20 max-w-5xl px-4">
        <h2 className="font-display text-3xl font-extrabold sm:text-5xl">Ce que tu peux signaler</h2>
        <ul className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <li key={c.key} className="rounded-full border-2 border-ink bg-card px-4 py-2 text-base font-semibold">
              <span aria-hidden>{c.emoji}</span> {c.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-20 max-w-5xl px-4">
        <div className="rounded-[2rem] bg-ink p-7 text-paper sm:p-12">
          <h2 className="font-display text-3xl font-extrabold sm:text-5xl">Anonyme. Modéré. Indépendant.</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-3">
            <li>
              <p className="font-bold text-signal">Aucune donnée d&apos;identité</p>
              <p className="mt-1 text-paper/80">Pas de nom, pas de téléphone, pas de photo, pas de géolocalisation. Pas de profil public.</p>
            </li>
            <li>
              <p className="font-bold text-signal">Rien n&apos;est publié sans relecture</p>
              <p className="mt-1 text-paper/80">Les messages écrits sont relus par l&apos;équipe. Les accusations nominatives sont refusées.</p>
            </li>
            <li>
              <p className="font-bold text-signal">Sans parti ni syndicat</p>
              <p className="mt-1 text-paper/80">VOIX agrège des constats pour améliorer les conditions d&apos;étude. Rien d&apos;autre.</p>
            </li>
          </ul>
          <Link href="/a-propos" className="btn btn-primary mt-8">Notre méthode</Link>
        </div>
      </section>
    </>
  );
}
