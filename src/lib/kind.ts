/** Vocabulaire selon le type d'établissement : lycée ou université. */
export type SchoolKind = "lycee" | "universite" | "ecole";

export function words(kind: SchoolKind | string | undefined) {
  if (kind === "ecole")
    return { kind: "ecole" as const, label: "École", the: "cette école", my: "mon école", your: "ton école", our: "notre école", ofThe: "de l'école", people: "étudiants", peopleOf: (n: string) => `les étudiants de ${n}` };
  return kind === "universite"
    ? { kind: "universite" as const, label: "Université", the: "cette université", my: "mon université", your: "ton université", our: "notre université", ofThe: "de l'université", people: "étudiants", peopleOf: (n: string) => `les étudiants de ${n}` }
    : { kind: "lycee" as const, label: "Lycée", the: "ce lycée", my: "mon lycée", your: "ton lycée", our: "notre lycée", ofThe: "du lycée", people: "élèves", peopleOf: (n: string) => `les élèves du ${n}` };
}
