import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchool, getSchoolResultsCached, getSchoolResultsFresh } from "@/lib/schools";
import { myCategories } from "@/lib/mine";
import { CATEGORIES, CONCERN_STATUSES, MIN_FOR_PERCENT, categoryLabel } from "@/lib/categories";
import { SupportButton } from "@/components/SupportButton";
import { ShareBox } from "@/components/ShareBox";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ uai: string }>; searchParams: Promise<{ merci?: string; ecrit?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uai } = await params;
  const school = await getSchool(uai.toUpperCase());
  if (!school || school.hidden) return { title: "Lycée introuvable" };
  const title = `${school.name} (${school.city})`;
  const description = `Voici les préoccupations exprimées par les élèves du ${school.name}. Fais entendre ton lycée sur VOIX.`;
  const image = `/lycee/${school.uai}/og`;
  return {
    title,
    description,
    alternates: { canonical: `/lycee/${school.uai}` },
    openGraph: { title: `${school.name} · VOIX`, description, url: `/lycee/${school.uai}`, images: [{ url: image, width: 1200, height: 630, alt: `Préoccupations exprimées au ${school.name}` }] },
    twitter: { card: "summary_large_image", title: `${school.name} · VOIX`, description, images: [image] },
  };
}

const emoji = (k: string) => CATEGORIES.find((c) => c.key === k)?.emoji ?? "";

export default async function SchoolPage({ params, searchParams }: Props) {
  const { uai: raw } = await params;
  const uai = raw.toUpperCase();
  const { merci, ecrit } = await searchParams;
  const school = await getSchool(uai);
  if (!school || school.hidden) notFound();

  // Juste après une participation, on lit les résultats frais pour que la personne voie l'effet de sa voix.
  const [results, mine] = await Promise.all([merci ? getSchoolResultsFresh(uai) : getSchoolResultsCached(uai), myCategories(uai)]);
  const showPercent = results.total >= MIN_FOR_PERCENT;
  const url = `${siteUrl()}/lycee/${uai}`;
  const max = Math.max(1, ...results.categories.map((c) => c.supports));

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      {merci && (
        <div role="status" className="rise mb-6 rounded-3xl bg-ink p-6 text-paper">
          <p className="font-display text-2xl font-extrabold">Merci, ta voix est comptée.</p>
          <p className="mt-1 text-paper/80">
            {ecrit ? "Ton message sera relu par l'équipe avant toute publication. " : ""}
            Plus vous êtes nombreux, plus les priorités de ton lycée sont lisibles. Partage la page à ta classe.
          </p>
          <div className="mt-4 [&_.btn-ghost]:border-paper [&_.btn-ghost]:text-paper [&_.btn-ghost:hover]:bg-paper [&_.btn-ghost:hover]:text-ink [&_.btn-dark]:bg-signal [&_.btn-dark]:text-ink">
            <ShareBox url={url} name={school.name} />
          </div>
        </div>
      )}

      <p className="rise text-sm font-semibold text-muted">
        {school.city}
        {school.department_name && ` · ${school.department_name}`}
        {school.sector && ` · ${school.sector}`}
      </p>
      <h1 className="rise rise-2 font-display mt-2 text-4xl leading-[1.02] font-extrabold sm:text-6xl">{school.name}</h1>
      {school.tracks.length > 0 && <p className="mt-2 text-sm text-muted">Voie {school.tracks.join(", ")}</p>}

      <div className="rise rise-3 mt-6 flex items-end justify-between gap-4 border-y border-line py-5">
        <div>
          <p data-testid="total" className="font-display text-5xl font-extrabold leading-none">{results.total.toLocaleString("fr-FR")}</p>
          <p className="mt-1 text-sm text-muted">participation{results.total > 1 ? "s" : ""} comptabilisée{results.total > 1 ? "s" : ""}</p>
        </div>
        <Link href={`/a-propos#limites`} className="chip max-w-[11rem] bg-paper-2 text-ink-2 text-right">Non représentatif de tous les élèves</Link>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link href={`/lycee/${uai}/participer`} className="btn btn-primary w-full sm:w-auto">
          {mine.length ? "Ajouter un signalement" : "Faire entendre mon lycée"}
        </Link>
        {!merci && <ShareBox url={url} name={school.name} compact />}
      </div>

      <section className="mt-10" aria-labelledby="prio">
        <h2 id="prio" className="font-display text-3xl font-extrabold">Préoccupations signalées</h2>
        {results.total === 0 ? (
          <p className="mt-3 text-ink-2">
            Personne n&apos;a encore participé pour ce lycée. Sois la première voix : soutiens une préoccupation ci-dessous.
          </p>
        ) : !showPercent ? (
          <p className="mt-3 text-sm text-muted">
            Les pourcentages s&apos;affichent à partir de {MIN_FOR_PERCENT} participations. En attendant, voici le nombre de soutiens.
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">Part des participations qui citent chaque préoccupation (plusieurs choix possibles).</p>
        )}

        <ul className="mt-5 grid gap-3">
          {results.categories.map((c, i) => (
            <li key={c.key} className="card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-tight">
                    <span aria-hidden className="mr-1.5">{emoji(c.key)}</span>
                    {categoryLabel(c.key)}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {c.supports} soutien{c.supports > 1 ? "s" : ""}
                    {c.reports > 0 && ` · ${c.reports} signalement${c.reports > 1 ? "s" : ""} écrit${c.reports > 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {showPercent && c.percent !== null && (
                    <span className="font-display text-3xl font-extrabold tabular-nums">{c.percent}%</span>
                  )}
                </div>
              </div>
              {results.total > 0 && (
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-paper-2" aria-hidden>
                  <div
                    className="bar-grow h-full rounded-full"
                    style={{
                      width: `${showPercent ? c.percent : Math.round((c.supports / max) * 100)}%`,
                      background: i === 0 && c.supports > 0 ? "var(--signal)" : "var(--ink)",
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className={`chip ${c.status ? "bg-ok-soft text-ok" : "bg-paper-2 text-muted"}`}>
                  {c.status ? CONCERN_STATUSES[c.status] : "Pas encore transmis"}
                </span>
                <SupportButton uai={uai} category={c.key} supported={mine.includes(c.key)} label={categoryLabel(c.key)} />
              </div>
              {c.statusNote && <p className="mt-2 text-sm text-ink-2">{c.statusNote}</p>}
            </li>
          ))}
        </ul>
      </section>

      {results.testimonies.length > 0 && (
        <section className="mt-12" aria-labelledby="temo">
          <h2 id="temo" className="font-display text-3xl font-extrabold">Témoignages relus</h2>
          <p className="mt-2 text-sm text-muted">Publiés après relecture par l&apos;équipe VOIX. Anonymes, sans nom de personne.</p>
          <ul className="mt-4 grid gap-3">
            {results.testimonies.map((t, i) => (
              <li key={i} className="card p-5">
                <p className="chip bg-paper-2 text-ink-2">{categoryLabel(t.category)}</p>
                <blockquote className="mt-3 text-lg leading-snug">« {t.body} »</blockquote>
              </li>
            ))}
          </ul>
        </section>
      )}
      {results.pendingReports > 0 && (
        <p className="mt-4 text-sm text-muted">
          {results.pendingReports} message{results.pendingReports > 1 ? "s" : ""} en attente de relecture.
        </p>
      )}

      <section className="mt-12 rounded-3xl border border-line bg-paper-2/60 p-5 text-sm text-ink-2">
        <h2 className="font-bold text-ink">Comment lire ces chiffres</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Une participation correspond à un navigateur, pas à un élève vérifié. Ce n&apos;est pas un sondage représentatif.</li>
          <li>Les participations suspectes sont contrôlées et peuvent être retirées du décompte.</li>
          <li>L&apos;état de traitement est mis à jour par l&apos;équipe VOIX quand une démarche est faite auprès du lycée.</li>
        </ul>
        <p className="mt-3">
          Un contenu pose problème ? <Link className="link" href={`/signaler?page=/lycee/${uai}`}>Signale-le</Link>.
        </p>
      </section>
    </div>
  );
}
