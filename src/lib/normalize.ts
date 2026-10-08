/** Minuscules, sans accents, ponctuation → espaces. Utilisé à l'import et pour la recherche. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const STOP = new Set([
  "lycee", "lyc", "lp", "lgt", "lpo", "general", "generale", "technologique", "professionnel", "professionnelle",
  "polyvalent", "agricole", "prive", "public", "et", "de", "du", "des", "la", "le", "les", "l", "d", "a", "au", "aux", "en", "st", "ste",
]);

const ROMAN = ["", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx"];

/** Découpe une requête en jetons significatifs (les mots génériques comme « lycée » sont ignorés). */
export function queryTokens(q: string): string[] {
  // « Henri 4 » → « henri iv » : les noms de rois et papes s'écrivent en chiffres romains dans l'annuaire.
  const all = normalize(q)
    .split(" ")
    .filter(Boolean)
    .map((t) => (/^\d{1,2}$/.test(t) && Number(t) >= 1 && Number(t) <= 20 ? ROMAN[Number(t)] : t));
  const meaningful = all.filter((t) => !STOP.has(t));
  return (meaningful.length ? meaningful : all).slice(0, 6);
}

export function slugify(s: string): string {
  return normalize(s).replace(/ /g, "-").slice(0, 80);
}
