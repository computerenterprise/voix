/**
 * Informations légales. NE PAS INVENTER : chaque valeur null s'affiche comme « À compléter » sur le site.
 * Toutes doivent être renseignées (et validées par un juriste) avant une ouverture publique.
 */
export const LEGAL = {
  /** Personne morale ou physique qui édite le site (ex. association loi 1901 déclarée). */
  publisherName: null as string | null,
  publisherStatus: null as string | null, // ex. « Association loi 1901, RNA W000000000 »
  publisherAddress: null as string | null,
  publicationDirector: null as string | null, // directeur·rice de la publication (personne majeure)
  contactEmail: null as string | null, // adresse de contact générale et point de contact DSA
  privacyEmail: null as string | null, // contact pour les droits RGPD (ou DPO)
  hostName: null as string | null, // hébergeur du site (ex. Vercel) : raison sociale exacte
  hostAddress: null as string | null,
  hostPhone: null as string | null,
  databaseHost: null as string | null, // hébergeur de la base (ex. Supabase, région UE)
  lastUpdated: "8 octobre 2026",
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
