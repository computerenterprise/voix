import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL, RETENTION } from "@/config/legal";
import { Todo } from "@/components/Todo";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Privacy() {
  return (
    <article className="prose-voix mx-auto max-w-2xl px-4 pt-10">
      <h1 className="font-display text-4xl font-bold sm:text-6xl">Confidentialité</h1>
      <p className="text-xl">La version courte : on ne sait pas qui tu es, et on fait tout pour que ça reste comme ça.</p>
      <p className="text-sm text-muted">Dernière mise à jour : {LEGAL.lastUpdated}.</p>

      <h2>Responsable du traitement</h2>
      <p>
        <Todo value={LEGAL.publisherName} label="nom de l'éditeur (personne morale)" />,{" "}
        <Todo value={LEGAL.publisherAddress} label="adresse" />. Contact pour tes droits :{" "}
        <Todo value={LEGAL.privacyEmail} label="e-mail de contact RGPD" />.
      </p>

      <h2>Ce que nous ne collectons pas</h2>
      <p>
        Pour participer, nous ne demandons ni nom, ni prénom, ni e-mail, ni téléphone, ni photo, ni adresse, ni âge, ni
        classe, et nous n&apos;utilisons pas ta géolocalisation. Il n&apos;y a pas de compte et pas de profil public.
        Aucun outil de mesure d&apos;audience, aucune publicité, aucun traceur tiers.
      </p>

      <h2>Ce que nous enregistrons</h2>
      <ul>
        <li><strong>Ta participation</strong> : le lycée choisi, les problèmes cochés, la date.</li>
        <li><strong>Ton message écrit</strong>, si tu en rédiges un. Il est relu avant toute publication. N&apos;y mets aucune information personnelle.</li>
        <li>
          <strong>Un cookie technique d&apos;appareil</strong> (« voix_d ») : un nombre aléatoire, qui ne contient rien sur toi.
          Il sert à compter une seule participation par navigateur et par lycée, et à te permettre d&apos;effacer tes
          participations. Nous n&apos;en conservons qu&apos;une empreinte chiffrée.
        </li>
        <li>
          <strong>Une empreinte de ton adresse IP</strong>, transformée de façon irréversible et différente chaque jour,
          uniquement pour détecter les abus (envois en masse). Ton adresse IP elle-même n&apos;est pas enregistrée. Si tu
          écris un message, la loi nous oblige à garder cette empreinte un an : elle ne peut servir qu&apos;à répondre à
          une demande de la justice.
        </li>
        <li>
          <strong>Si tu saisis un mot de passe</strong> (facultatif) : nous enregistrons seulement son empreinte
          chiffrée, liée à l&apos;établissement, jamais les mots eux-mêmes. Elle sert à regrouper les voix qui ont donné
          le même mot de passe. Ce mot de passe est convenu entre élèves et commun à tout un groupe : il ne permet pas
          de t&apos;identifier.
        </li>
        <li>
          <strong>Si tu cliques « Je suis solidaire »</strong> : nous enregistrons l&apos;empreinte
          de ton navigateur (pour ne compter qu&apos;une fois) et l&apos;empreinte du jour de ta connexion (contre les abus).
        </li>
      </ul>

      <h2>Pourquoi, et sur quelle base</h2>
      <p>
        Afficher des problèmes agrégés par établissement, prévenir la fraude et modérer les contenus. Base légale
        envisagée : l&apos;intérêt légitime de l&apos;éditeur à faire fonctionner une plateforme civique fiable
        (article 6.1.f du RGPD), avec des mesures renforcées parce que le public comprend des mineurs : aucune donnée
        d&apos;identité, minimisation, durées courtes, effacement en un clic.
      </p>
      <p>
        Le cookie technique est nécessaire au service demandé (un seul décompte par navigateur) et à sa sécurité ; il
        n&apos;est utilisé à aucune autre fin.
      </p>

      <h2>Combien de temps</h2>
      <table>
        <tbody>
          {RETENTION.map(([what, how]) => (
            <tr key={what}><td>{what}</td><td>{how}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>Qui y a accès</h2>
      <p>
        Uniquement l&apos;équipe de modération de VOIX. Les résultats publics sont des agrégats. Nous ne vendons ni ne
        transmettons aucune donnée. Prestataires techniques, qui agissent uniquement sur nos instructions : hébergement
        du site {LEGAL.hostName} (traitements exécutés en Europe, région de Paris), base de données {LEGAL.databaseHost}. Ces sociétés
        étant américaines, un transfert hors de l&apos;Union européenne est possible ; il est encadré par leurs
        engagements contractuels (clauses contractuelles types de la Commission européenne).
      </p>

      <h2>Tes droits</h2>
      <p>
        Tu peux accéder à tes données, les faire effacer, t&apos;opposer à leur traitement. Comme nous ne savons pas qui
        tu es, le plus simple est d&apos;utiliser <Link href="/mes-donnees">Mes données</Link> depuis le navigateur avec
        lequel tu as participé : l&apos;effacement est immédiat. Sinon, fais une demande sur la même page. Tu peux aussi
        saisir la CNIL (cnil.fr). Si tu as moins de 15 ans, tu peux exercer ces droits seul ou avec un parent.
      </p>
    </article>
  );
}
