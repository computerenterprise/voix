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
      <section className="mx-auto max-w-3xl px-4 pt-14 pb-10 text-center sm:pt-24">
        <p className="rise eyebrow">Ton lycée. Ta voix.</p>
        <h1 className="rise rise-2 font-display mt-3 text-[2.5rem] leading-[1.06] font-bold sm:text-[4.5rem] sm:leading-[1.04]">
          Et si ton lycée pouvait enfin se faire entendre&nbsp;?
        </h1>
        <p className="rise rise-3 mx-auto mt-5 max-w-xl text-[1.1875rem] leading-relaxed text-muted sm:text-[1.3125rem]">
          Signale ce qui ne fonctionne pas, découvre les priorités de ton établissement et fais entendre ta voix.
        </p>
        <div className="rise rise-4 mx-auto mt-9 max-w-xl text-left">
          <SchoolSearch />
        </div>
        <div className="rise rise-4 mt-6 flex flex-col items-center gap-3">
          <Link href="/recherche" className="btn btn-primary">Trouver mon lycée</Link>
          <span className="text-sm text-muted">Anonyme. Sans compte. 30 secondes.</span>
        </div>
      </section>

      <section aria-label="Chiffres en direct" className="mx-auto max-w-5xl px-4">
        {stats && stats.participations > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              [fmt(stats.participations), stats.participations > 1 ? "participations comptabilisées" : "participation comptabilisée"],
              [fmt(stats.schools), stats.schools > 1 ? "lycées concernés" : "lycée concerné"],
              [fmt(stats.moderated), stats.moderated > 1 ? "témoignages relus et publiés" : "témoignage relu et publié"],
            ].map(([n, l]) => (
              <div key={l} className="card px-3 py-6 text-center sm:py-8">
                <p className="font-display text-3xl font-semibold tabular-nums sm:text-5xl">{n}</p>
                <p className="mt-1.5 text-xs leading-snug text-muted sm:text-sm">{l}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card px-6 py-8 text-center">
            <p className="font-display text-2xl font-semibold">Les premiers résultats s&apos;afficheront ici.</p>
            <p className="mt-2 text-sm text-muted">
              {stats ? `${fmt(stats.totalSchools)} lycées référencés. ` : ""}Les chiffres viennent uniquement des participations réelles.
            </p>
          </div>
        )}
        <p className="mt-3 text-center text-xs text-muted">
          Chiffres en direct. Une participation n&apos;est pas un élève vérifié.{" "}
          <Link href="/a-propos#limites" className="link">Nos limites</Link>
        </p>
      </section>

      <section className="mx-auto mt-24 max-w-5xl px-4">
        <h2 className="font-display text-center text-3xl font-bold sm:text-5xl">Comment ça marche.</h2>
        <ol className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            ["Trouve ton lycée.", "Par son nom, sa ville ou son code postal. Tous les lycées de France sont référencés."],
            ["Dis ce qui coince.", "Soutiens une préoccupation existante ou ajoute la tienne. Aucun nom, aucun compte."],
            ["Partage la page.", "Plus il y a de participations, plus les priorités de ton lycée sont lisibles."],
          ].map(([t, d], i) => (
            <li key={t} className="card p-7">
              <span className="text-sm font-semibold text-signal">0{i + 1}</span>
              <h3 className="font-display mt-3 text-2xl font-semibold">{t}</h3>
              <p className="mt-2 leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-24 max-w-5xl px-4">
        <h2 className="font-display text-center text-3xl font-bold sm:text-5xl">Ce que tu peux signaler.</h2>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <li key={c.key} className="card flex flex-col gap-3 p-5 last:col-span-2 sm:last:col-span-1">
              <span aria-hidden className="text-3xl">{c.emoji}</span>
              <span className="font-semibold leading-snug">{c.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-24 max-w-5xl px-4">
        <div className="rounded-[1.75rem] bg-black px-7 py-12 text-center text-white sm:px-14 sm:py-16">
          <h2 className="font-display text-3xl font-bold sm:text-5xl">Anonyme. Modéré.<br />Indépendant.</h2>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-8 text-left sm:grid-cols-3">
            <li>
              <p className="font-semibold text-signal-on-dark">Aucune donnée d&apos;identité</p>
              <p className="mt-1.5 leading-relaxed text-white/70">Pas de nom, pas de téléphone, pas de photo, pas de géolocalisation. Pas de profil public.</p>
            </li>
            <li>
              <p className="font-semibold text-signal-on-dark">Rien n&apos;est publié sans relecture</p>
              <p className="mt-1.5 leading-relaxed text-white/70">Les messages écrits sont relus par l&apos;équipe. Les accusations nominatives sont refusées.</p>
            </li>
            <li>
              <p className="font-semibold text-signal-on-dark">Sans parti ni syndicat</p>
              <p className="mt-1.5 leading-relaxed text-white/70">VOIX agrège des constats pour améliorer les conditions d&apos;étude. Rien d&apos;autre.</p>
            </li>
          </ul>
          <Link href="/a-propos" className="btn btn-primary mt-10">Notre méthode</Link>
        </div>
      </section>
    </>
  );
}
