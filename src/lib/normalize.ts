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

/** Découpe une requête en jetons significatifs (les mots génériques comme « lycée » sont ignorés). */
export function queryTokens(q: string): string[] {
  const all = normalize(q).split(" ").filter(Boolean);
  const meaningful = all.filter((t) => !STOP.has(t));
  return (meaningful.length ? meaningful : all).slice(0, 6);
}

export function slugify(s: string): string {
  return normalize(s).replace(/ /g, "-").slice(0, 80);
}
