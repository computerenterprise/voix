export const CATEGORIES = [
  { key: "profs_absents", label: "Professeurs absents", short: "Profs absents", emoji: "🧑‍🏫" },
  { key: "classes_surchargees", label: "Classes surchargées", short: "Classes surchargées", emoji: "👥" },
  { key: "batiments", label: "État des bâtiments", short: "Bâtiments", emoji: "🏚️" },
  { key: "equipements", label: "Équipements et matériel", short: "Équipements", emoji: "🖥️" },
  { key: "orientation", label: "Orientation et Parcoursup", short: "Orientation", emoji: "🧭" },
  { key: "vie_scolaire", label: "Conditions de vie scolaire", short: "Vie scolaire", emoji: "🍽️" },
  { key: "autre", label: "Autre problème", short: "Autre", emoji: "💬" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];
export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as CategoryKey[];
export const categoryLabel = (k: string) => CATEGORIES.find((c) => c.key === k)?.label ?? k;
export const isCategory = (k: string): k is CategoryKey => (CATEGORY_KEYS as string[]).includes(k);

export const CONCERN_STATUSES = {
  transmis: "Transmis à l'établissement",
  reponse: "Réponse reçue",
  en_cours: "Pris en charge",
  resolu: "Résolu",
} as const;
export type ConcernStatus = keyof typeof CONCERN_STATUSES;

/** En dessous de ce seuil, on n'affiche pas de pourcentages (trop peu de participations pour être lisible). */
export const MIN_FOR_PERCENT = 5;
/** Seuils d'affichage agrégé au tableau national. */
export const MIN_FOR_CITY = 10;
export const MIN_FOR_DEPARTMENT = 20;
