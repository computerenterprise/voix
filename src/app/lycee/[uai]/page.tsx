import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchool, getSchoolResultsCached, getSchoolResultsFresh } from "@/lib/schools";
import { myCategories } from "@/lib/mine";
import { CATEGORIES, CONCERN_STATUSES, MIN_FOR_PERCENT, categoryLabel } from "@/lib/categories";
import { SupportButton } from "@/components/SupportButton";
import { ShareBox } from "@/components/ShareBox";
import { words } from "@/lib/kind";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ uai: string }>; searchParams: Promise<{ merci?: string; ecrit?: string; verif?: string; code?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uai } = await params;
  const school = await getSchool(uai.toUpperCase());
  if (!school || school.hidden) return { title: "Établissement introuvable" };
  const title = `${school.name} (${school.city})`;
  const w = words(school.kind);
  const description = `Voici les problèmes signalés par ${w.peopleOf(school.name)}. Fais entendre ${w.your} sur VOIX.`;
  const image = `/lycee/${school.uai}/og`;
  return {
    title,
    description,
    alternates: { canonical: `/lycee/${school.uai}` },
    openGraph: { title: `${school.name} · VOIX`, description, url: `/lycee/${school.uai}`, images: [{ url: image, width: 1200, height: 630, alt: `Problèmes signalés au ${school.name}` }] },
    twitter: { card: "summary_large_image", title: `${school.name} · VOIX`, description, images: [image] },
  };
}

const emoji = (k: string) => CATEGORIES.find((c) => c.key === k)?.emoji ?? "";

export default async function SchoolPage({ params, searchParams }: Props) {
  const { uai: raw } = await params;
  const uai = raw.toUpperCase();
  const { merci, ecrit, verif, code } = await searchParams;
  const school = await getSchool(uai);
  if (!school || school.hidden) notFound();
  const w = words(school.kind);

  // Juste après une participation, on lit les résultats frais pour que la personne voie l'effet de sa voix.
  const [results, mine] = await Promise.all([merci ? getSchoolResultsFresh(uai) : getSchoolResultsCached(uai), myCategories(uai)]);
  const showPercent = results.total >= MIN_FOR_PERCENT;
  const url = `${siteUrl()}/lycee/${uai}`;
  const max = Math.max(1, ...results.categories.map((c) => c.supports));

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:pt-12">
      {merci && (
        <div role="status" className="rise mb-8 rounded-2xl bg-black p-7 text-center text-white sm:p-10">
          <div aria-hidden className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-signal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10"/></svg>
          </div>
          <p className="font-display mt-4 text-3xl font-bold">{verif ? "Merci, ta voix est enregistrée." : "Merci, ta voix est comptée."}</p>
          <p className="mx-auto mt-2 max-w-md leading-relaxed text-white/70">
            {verif ? `Beaucoup de participations arrivent de la même connexion pour ${w.the} : la tienne sera comptée après une vérification anti-triche. ` : ""}
            {code ? "Ton mot de passe est enregistré : ta voix rejoint celles des élèves qui ont le même. " : ""}
            {ecrit ? "Ton message sera relu par l'équipe avant toute publication. " : ""}
            Plus vous êtes nombreux, plus les priorités de {w.your} sont lisibles. Partage la page à ta classe.
          </p>
          <div className="mt-6 flex justify-center [&_.btn-ghost]:bg-white/10 [&_.btn-ghost]:text-white [&_.btn-ghost:hover]:bg-white/20 [&_.btn-dark]:bg-signal [&_.btn-dark:hover]:bg-[var(--signal-hover)]">
            <ShareBox url={url} name={school.name} kind={school.kind} />
          </div>
        </div>
      )}

      <div className="halo text-center">
        <p className="rise text-sm text-muted">
          {school.kind !== "lycee" && `${w.label} · `}
          {school.city}
          {school.department_name && ` · ${school.department_name}`}
          {school.sector && ` · ${school.sector}`}
        </p>
        <h1 className="rise rise-2 font-display mt-2 text-[2.25rem] leading-[1.08] font-bold sm:text-6xl">{school.name}</h1>
        {school.tracks.length > 0 && <p className="mt-2 text-sm text-muted">Voie {school.tracks.join(", ")}</p>}

        <div className="rise rise-3 mt-8">
          <p data-testid="total" className="font-display text-6xl font-semibold tabular-nums leading-none">{results.total.toLocaleString("fr-FR")}</p>
          <p className="mt-2 text-muted">participation{results.total > 1 ? "s" : ""} comptabilisée{results.total > 1 ? "s" : ""}</p>
          {results.verifying > 0 && (
            <p className="mt-1 text-sm text-muted">+ {results.verifying.toLocaleString("fr-FR")} en cours de vérification</p>
          )}
          <Link href={`/a-propos#limites`} className="link mt-1 inline-block text-sm">Non représentatif de tous les {w.people}</Link>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href={`/lycee/${uai}/participer`} className="btn btn-primary w-full max-w-xs">
            {mine.length ? "Ajouter un signalement" : `Faire entendre ${w.my}`}
          </Link>
          {!merci && <ShareBox url={url} name={school.name} kind={school.kind} compact />}
        </div>
      </div>

      {results.board.votes > 0 && (
        <section className="mt-12 rounded-2xl bg-black p-6 text-white sm:p-8" aria-labelledby="etat">
          <p className="text-sm font-medium text-[#7ee0a1]">Voix confirmées par un mot de passe commun</p>
          <h2 id="etat" className="font-display mt-1 text-2xl font-bold sm:text-3xl">
            L&apos;état {w.ofThe} selon {results.board.votes.toLocaleString("fr-FR")} {w.people}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Ces {w.people} ont participé avec le même mot de passe, choisi entre eux et transmis de bouche à oreille.
            L&apos;équipe VOIX a vérifié ce groupe avant de le publier. Le mot de passe ne dit rien sur personne.
          </p>
          <ul className="mt-5 grid gap-3">
            {results.board.categories.filter((c) => c.n > 0).map((c) => {
              const pct = Math.round((c.n / results.board.votes) * 100);
              return (
                <li key={c.key}>
                  <div className="flex items-baseline justify-between gap-3 text-[0.95rem]">
                    <span><span aria-hidden>{emoji(c.key)} </span>{categoryLabel(c.key, school.kind)}</span>
                    <span className="shrink-0 tabular-nums font-semibold">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden>
                    <div className="h-full rounded-full bg-[#7ee0a1]" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-16" aria-labelledby="prio">
        <h2 id="prio" className="font-display text-3xl font-bold">Problèmes signalés.</h2>
        {results.total === 0 ? (
          <p className="mt-2 text-muted">
            Personne n&apos;a encore participé pour {w.the}. Sois la première voix : soutiens un problème ci-dessous.
          </p>
        ) : !showPercent ? (
          <p className="mt-2 text-sm text-muted">
            Les pourcentages s&apos;affichent à partir de {MIN_FOR_PERCENT} participations. En attendant, voici le nombre de soutiens.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">Part des participations qui citent chaque problème (plusieurs choix possibles).</p>
        )}

        <ul className="mt-6 grid gap-3">
          {results.categories.map((c, i) => (
            <li key={c.key} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xl">{emoji(c.key)}</span>
                  <div className="min-w-0">
                    <p className="text-[1.0625rem] font-semibold leading-tight">{categoryLabel(c.key, school.kind)}</p>
                    <p className="mt-1 text-sm text-muted">
                      {c.supports} soutien{c.supports > 1 ? "s" : ""}
                      {c.reports > 0 && ` · ${c.reports} signalement${c.reports > 1 ? "s" : ""} écrit${c.reports > 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                {showPercent && c.percent !== null && (
                  <span className="font-display shrink-0 text-3xl font-semibold tabular-nums">{c.percent}%</span>
                )}
              </div>
              {results.total > 0 && (
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-2" aria-hidden>
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
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className={`chip ${c.status ? "bg-ok-soft text-ok" : "bg-white text-muted"}`}>
                  {c.status ? CONCERN_STATUSES[c.status] : "Pas encore transmis"}
                </span>
                <SupportButton uai={uai} category={c.key} supported={mine.includes(c.key)} label={categoryLabel(c.key, school.kind)} />
              </div>
              {c.statusNote && <p className="mt-2 text-sm text-ink-2">{c.statusNote}</p>}
            </li>
          ))}
        </ul>
      </section>

      {results.testimonies.length > 0 && (
        <section className="mt-16" aria-labelledby="temo">
          <h2 id="temo" className="font-display text-3xl font-bold">Témoignages relus.</h2>
          <p className="mt-2 text-sm text-muted">Publiés après relecture par l&apos;équipe VOIX. Anonymes, sans nom de personne.</p>
          <ul className="mt-6 grid gap-3">
            {results.testimonies.map((t, i) => (
              <li key={i} className="card p-6">
                <p className="text-sm font-medium text-signal">{categoryLabel(t.category, school.kind)}</p>
                <blockquote className="font-display mt-2 text-xl font-medium leading-snug">« {t.body} »</blockquote>
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

      <section className="mt-16 border-t border-line pt-6 text-sm text-muted">
        <h2 className="font-semibold text-ink">Comment lire ces chiffres</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
          <li>Une participation correspond à un navigateur, pas à une personne vérifiée. Ce n&apos;est pas un sondage représentatif.</li>
          <li>Anti-triche : un navigateur ne compte qu&apos;une fois par établissement, chaque envoi passe une vérification anti-robot, et quand beaucoup de navigateurs votent depuis la même connexion, les voix supplémentaires attendent une vérification avant d&apos;être comptées.</li>
          <li>Les participations suspectes sont contrôlées et peuvent être retirées du décompte.</li>
          <li>L&apos;état de traitement est mis à jour par l&apos;équipe VOIX quand une démarche est faite auprès de l&apos;établissement.</li>
        </ul>
        <p className="mt-3">
          Un contenu pose problème ? <Link className="link" href={`/signaler?page=/lycee/${uai}`}>Signale-le</Link>.
        </p>
      </section>
    </div>
  );
}
