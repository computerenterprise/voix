import type { Metadata } from "next";
import { LEGAL } from "@/config/legal";
import { Todo } from "@/components/Todo";

export const metadata: Metadata = { title: "Mentions légales" };

export default function Legal() {
  return (
    <article className="prose-voix mx-auto max-w-2xl px-4 pt-10">
      <h1 className="font-display text-4xl font-bold sm:text-6xl">Mentions légales</h1>
      <h2>Éditeur</h2>
      <p>
        <Todo value={LEGAL.publisherName} label="nom de l'éditeur" />
        <br />
        <Todo value={LEGAL.publisherStatus} label="forme juridique et numéro d'immatriculation (RNA/SIREN)" />
        <br />
        <Todo value={LEGAL.publisherAddress} label="adresse du siège" />
        <br />
        Contact : <Todo value={LEGAL.contactEmail} label="e-mail de contact" />
      </p>
      <h2>Directeur ou directrice de la publication</h2>
      <p><Todo value={LEGAL.publicationDirector} label="nom (personne majeure)" /></p>
      <h2>Hébergement</h2>
      <p>
        <Todo value={LEGAL.hostName} label="raison sociale de l'hébergeur" />
        <br />
        <Todo value={LEGAL.hostAddress} label="adresse de l'hébergeur" />
        <br />
        <Todo value={LEGAL.hostPhone} label="téléphone de l'hébergeur, indiqué sur vercel.com" />
      </p>
      <h2>Point de contact pour les autorités et les utilisateurs</h2>
      <p>
        <Todo value={LEGAL.contactEmail} label="adresse de contact unique (règlement sur les services numériques)" />. Les
        contenus illicites peuvent être signalés via la page « Signaler un contenu ».
      </p>
      <h2>Base de données</h2>
      <p>{LEGAL.databaseHost} (service PostgreSQL géré).</p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, le logo et le code de VOIX appartiennent à leur éditeur. Les données des établissements sont
        réutilisées selon leur licence (ci-dessous). Les messages publiés restent ceux de leurs auteurs, anonymes.
      </p>
      <h2>Données des établissements</h2>
      <p>Annuaire de l&apos;Éducation, ministère de l&apos;Éducation nationale, data.education.gouv.fr, Licence Ouverte 2.0.</p>
    </article>
  );
}
