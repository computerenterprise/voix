/**
 * Contrôles automatiques du texte libre. Ils ne publient jamais rien : tout texte reste « en attente »
 * jusqu'à validation humaine. Ils servent à (1) bloquer à la saisie les coordonnées personnelles évidentes,
 * (2) signaler aux modérateurs les contenus à risque.
 */

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE = /(?:(?:\+|00)33[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}/;
const URL_RE = /\b(?:https?:\/\/|www\.)\S+/i;
const HANDLE = /(^|\s)@[a-z0-9_.]{3,}/i;
const ADDRESS = /\b\d{1,4}\s?(?:bis|ter)?\s?,?\s(?:rue|avenue|av\.|boulevard|bd|impasse|allée|chemin|place)\s/i;
// Personne nommée : civilité ou fonction (casse indifférente) suivie d'un mot à majuscule.
const TITLES = "m\\.|mr|mme|mlle|monsieur|madame|mademoiselle|prof|professeur|professeure|proviseur|proviseure|cpe|principal|principale|surveillant|surveillante|directeur|directrice";
const NAMED_PERSON = new RegExp(`(?:^|[^\\p{L}])(?:${TITLES})\\s+(?:de\\s+\\p{L}+\\s+)?\\p{Lu}[\\p{Ll}'-]{2,}`, "iu");
const NAMED_PERSON_CASE = new RegExp(`(?:${TITLES})\\s+(?:de\\s+\\p{L}+\\s+)?(\\p{L}+)`, "giu");
function hasNamedPerson(text: string): boolean {
  if (!NAMED_PERSON.test(text)) return false;
  // Le drapeau « i » rend \p{Lu} insensible à la casse : on revérifie la majuscule du nom.
  for (const m of text.matchAll(NAMED_PERSON_CASE)) if (/^\p{Lu}/u.test(m[1]) && m[1].length >= 3) return true;
  return false;
}
const THREAT = /\b(tuer|crever|buter|frapper|tabasser|bombe|arme|flinguer|égorger|egorger|incendier|cramer)\b/i;
const HATE = /\b(pd|pédé|pede|bougnoule|négro|negro|youpin|sale (?:arabe|noir|juif|blanc|race)|nazi)\b/i;
const INSULT = /\b(connard|connasse|salope|pute|enculé|encule|fdp|ntm|batard|bâtard|abruti|débile)\b/i;
const MOBILISATION = /\b(blocus|bloquer le lycée|barricade|poubelles? en feu|affrontement|keufs|flics|police)\b/i;

export type GuardResult = {
  /** Raisons bloquantes : la personne doit reformuler (coordonnées personnelles). */
  blocking: string[];
  /** Signaux pour la modération, non bloquants. */
  flags: string[];
};

export function checkText(text: string): GuardResult {
  const blocking: string[] = [];
  const flags: string[] = [];
  if (EMAIL.test(text)) blocking.push("email");
  if (PHONE.test(text)) blocking.push("telephone");
  if (URL_RE.test(text)) blocking.push("lien");
  if (HANDLE.test(text)) blocking.push("pseudo_reseau");
  if (ADDRESS.test(text)) blocking.push("adresse");
  if (hasNamedPerson(text)) flags.push("personne_nommee");
  if (THREAT.test(text)) flags.push("menace");
  if (HATE.test(text)) flags.push("haine");
  if (INSULT.test(text)) flags.push("insulte");
  if (MOBILISATION.test(text)) flags.push("mobilisation");
  if (/(.)\1{6,}/.test(text) || text.replace(/[^A-Z]/g, "").length > text.length * 0.6) flags.push("spam");
  return { blocking, flags };
}

export const BLOCKING_MESSAGES: Record<string, string> = {
  email: "une adresse e-mail",
  telephone: "un numéro de téléphone",
  lien: "un lien",
  pseudo_reseau: "un pseudo de réseau social",
  adresse: "une adresse postale",
};
