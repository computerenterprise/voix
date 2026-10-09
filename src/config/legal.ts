/**
 * Informations légales. NE PAS INVENTER : chaque valeur absente s'affiche comme « À compléter » sur le site.
 * Valeurs fournies par l'éditeur le 9 octobre 2026. Une variable d'environnement Vercel (LEGAL_…) les remplace si elle est définie.
 */
const env = (k: string): string | null => process.env[k]?.trim() || null;

export const LEGAL = {
  /** Personne morale ou physique qui édite le site (ex. association loi 1901 déclarée). */
  publisherName: env("LEGAL_PUBLISHER_NAME") ?? "Sasha Cortesi",
  publisherStatus: env("LEGAL_PUBLISHER_STATUS") ?? "Particulier", // ex. « Association loi 1901, RNA W000000000 »
  publisherAddress: env("LEGAL_PUBLISHER_ADDRESS") ?? "45 rue des Blancs-Manteaux, 75004 Paris",
  publicationDirector: env("LEGAL_PUBLICATION_DIRECTOR") ?? "Jacques Edson Fonseca", // directeur·rice de la publication : personne MAJEURE
  contactEmail: env("LEGAL_CONTACT_EMAIL"), // contact général et point de contact unique (règlement sur les services numériques)
  privacyEmail: env("LEGAL_PRIVACY_EMAIL") ?? env("LEGAL_CONTACT_EMAIL"), // droits RGPD (par défaut : contact général)
  hostName: "Vercel Inc.",
  hostAddress: "440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis",
  hostPhone: env("LEGAL_HOST_PHONE"), // numéro publié par Vercel (exigé par la loi pour la confiance dans l'économie numérique)
  databaseHost: "Supabase Inc.",
  lastUpdated: "9 octobre 2026",
};

export const RETENTION = [
  ["Participations (préoccupations soutenues)", "12 mois après la participation, puis suppression"],
  ["Empreinte d'IP du jour (anti-abus)", "Effacée au bout de 30 jours"],
  ["Messages écrits refusés", "Supprimés 30 jours après la décision"],
  ["Messages écrits publiés ou en attente", "12 mois, ou jusqu'à suppression demandée"],
  ["Cookie technique d'appareil", "12 mois"],
  ["Demandes de suppression", "Contact effacé dès traitement ; demande supprimée après 12 mois"],
  ["Signalements de contenus", "12 mois"],
  ["Journaux techniques d'erreurs", "90 jours (sans IP ni identifiant)"],
  ["Compteurs anti-abus", "48 heures"],
] as const;
