import type { Metadata } from "next";
import Link from "next/link";
import { MIN_FOR_PERCENT, MIN_FOR_CITY, MIN_FOR_DEPARTMENT } from "@/lib/categories";

export const metadata: Metadata = { title: "À propos et méthode", description: "Mission, indépendance et limites méthodologiques de VOIX." };

export default function About() {
  return (
    <article className="prose-voix mx-auto max-w-2xl px-4 pt-10">
      <h1 className="font-display text-4xl font-bold sm:text-6xl">À propos</h1>
      <p className="text-xl">
        VOIX transforme des constats individuels de lycéens en informations agrégées, lisibles et utiles pour améliorer
        les conditions de scolarité.
      </p>

      <h2>Notre mission</h2>
      <p>
        Professeurs non remplacés, classes surchargées, bâtiments dégradés, orientation difficile… Ces problèmes sont souvent
        vécus seul, ou dits sans être entendus. VOIX permet à chaque lycéen de les signaler simplement, de soutenir ceux
        des autres élèves et de voir ce qui revient le plus dans son établissement.
      </p>

      <h2>Indépendance</h2>
      <p>
        VOIX est indépendant des partis politiques, des syndicats, des établissements et des administrations. VOIX
        n&apos;appelle à aucune action collective et ne fournit aucun outil d&apos;organisation de blocages ou de
        rassemblements. Notre seul objet : rendre visibles des constats sur les conditions d&apos;étude.
      </p>

      <h2 id="limites">Méthode et limites</h2>
      <p>Nous préférons être honnêtes sur ce que nos chiffres disent, et ce qu&apos;ils ne disent pas.</p>
      <ul>
        <li>
          <strong>Ce n&apos;est pas un sondage.</strong> Les personnes qui participent se sont portées volontaires.
          Les résultats ne sont pas représentatifs de l&apos;ensemble des élèves d&apos;un lycée.
        </li>
        <li>
          <strong>Une participation n&apos;est pas un élève vérifié.</strong> Pour protéger les mineurs, nous ne
          demandons aucune identité. Nous ne pouvons donc pas garantir qu&apos;une participation provient d&apos;un
          élève de l&apos;établissement.
        </li>
        <li>
          <strong>Un décompte par navigateur et par lycée.</strong> Un cookie technique aléatoire évite qu&apos;un même
          navigateur compte plusieurs fois. Quelqu&apos;un qui change de navigateur ou efface ses cookies peut
          participer à nouveau : c&apos;est une limite connue.
        </li>
        <li>
          <strong>Contrôles anti-abus.</strong> Limitation du nombre d&apos;envois par connexion, détection des rafales
          provenant d&apos;une même connexion, pièges à robots, relecture humaine. Les participations suspectes sont
          suspendues et retirées des résultats. Une connexion partagée (wifi du lycée) n&apos;est pas en soi suspecte.
        </li>
        <li>
          <strong>Seuils d&apos;affichage.</strong> Les pourcentages d&apos;un lycée apparaissent à partir de{" "}
          {MIN_FOR_PERCENT} participations ; une ville à partir de {MIN_FOR_CITY}, un département à partir de{" "}
          {MIN_FOR_DEPARTMENT}.
        </li>
        <li>
          <strong>Aucun classement.</strong> Comparer des lycées selon leur nombre de participations serait trompeur :
          cela mesure la mobilisation sur VOIX, pas la gravité des problèmes.
        </li>
        <li>
          <strong>Les messages écrits sont relus</strong> avant toute publication. Ceux qui visent une personne, contiennent
          des informations personnelles, des insultes ou des menaces sont refusés. <Link href="/charte">Notre charte</Link>.
        </li>
        <li>
          <strong>L&apos;état de traitement</strong> (« transmis », « réponse reçue »…) est renseigné par l&apos;équipe
          VOIX uniquement lorsqu&apos;une démarche réelle a été faite.
        </li>
      </ul>

      <h2>Les données des établissements</h2>
      <p>
        La liste des lycées provient de l&apos;Annuaire de l&apos;Éducation publié par le ministère de l&apos;Éducation
        nationale sur data.education.gouv.fr ; celle des universités, de la liste des principaux établissements
        d&apos;enseignement supérieur publiée par le ministère de l&apos;Enseignement supérieur sur
        data.enseignementsup-recherche.gouv.fr. Les deux sont sous Licence Ouverte.
      </p>

      <h2>Vos données</h2>
      <p>
        Nous collectons le strict minimum. Tout est expliqué dans notre{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>. Tu peux effacer tes participations à tout moment
        depuis <Link href="/mes-donnees">Mes données</Link>.
      </p>
    </article>
  );
}
