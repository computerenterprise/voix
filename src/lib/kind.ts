/** Vocabulaire selon le type d'établissement : lycée ou université. */
export type SchoolKind = "lycee" | "universite";

export function words(kind: SchoolKind | string | undefined) {
  return kind === "universite"
    ? { kind: "universite" as const, label: "Université", the: "cette université", my: "mon université", your: "ton université", our: "notre université", ofThe: "de l'université", people: "étudiants", peopleOf: (n: string) => `les étudiants de ${n}` }
    : { kind: "lycee" as const, label: "Lycée", the: "ce lycée", my: "mon lycée", your: "ton lycée", our: "notre lycée", ofThe: "du lycée", people: "élèves", peopleOf: (n: string) => `les élèves du ${n}` };
}
