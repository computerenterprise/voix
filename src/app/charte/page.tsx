import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Charte de modération" };

export default function Charte() {
  return (
    <article className="prose-voix mx-auto max-w-2xl px-4 pt-10">
      <h1 className="font-display text-4xl font-bold sm:text-6xl">Charte de modération</h1>
      <p className="text-xl">Sur VOIX, on décrit des problèmes, jamais des personnes.</p>

      <h2>Ce qui est publié</h2>
      <p>
        Les problèmes soutenus (cases cochées) sont comptées immédiatement. Les messages écrits ne sont{" "}
        <strong>jamais publiés automatiquement</strong> : ils restent privés jusqu&apos;à leur relecture par l&apos;équipe
        VOIX, qui peut les publier de façon anonyme ou les refuser.
      </p>

      <h2>Ce qui est refusé</h2>
      <ul>
        <li>Toute mise en cause d&apos;une personne identifiable : nom ou surnom d&apos;un élève, d&apos;un professeur, d&apos;un membre du personnel, description permettant de la reconnaître.</li>
        <li>Toute information personnelle : nom, adresse, téléphone, e-mail, pseudo de réseau social, photo.</li>
        <li>Insultes, propos haineux, discriminatoires, harcèlement, menaces.</li>
        <li>Appels à la violence, à des dégradations, ou à l&apos;organisation de blocages ou d&apos;affrontements.</li>
        <li>Contenus mensongers manifestes, publicité, propagande partisane, spam.</li>
      </ul>
      <p>
        Les adresses e-mail, numéros de téléphone, liens et adresses postales sont bloqués dès la saisie. Les autres
        contenus à risque sont repérés automatiquement pour la relecture, mais c&apos;est toujours un humain qui décide.
      </p>

      <h2>Situations graves</h2>
      <p>
        VOIX n&apos;est pas un service d&apos;urgence ni de signalement de violences. Si toi ou quelqu&apos;un est en
        danger : appelle le <strong>17</strong> (police) ou le <strong>112</strong>. Pour le harcèlement : le{" "}
        <strong>3018</strong> (gratuit, anonyme). Pour un enfant ou un adolescent en danger : le <strong>119</strong>.
      </p>

      <h2>Signaler un contenu</h2>
      <p>
        Un contenu publié te semble problématique ? <Link href="/signaler">Signale-le</Link>. Chaque signalement est
        examiné ; un contenu manifestement illicite est retiré sans délai.
      </p>

      <h2>Contestation</h2>
      <p>
        Les messages étant anonymes, nous ne pouvons pas notifier individuellement leur auteur d&apos;un refus. Les
        motifs de refus possibles sont ceux listés ci-dessus. Pour toute question, utilise la page{" "}
        <Link href="/mentions-legales">Mentions légales</Link> (contact).
      </p>
    </article>
  );
}
