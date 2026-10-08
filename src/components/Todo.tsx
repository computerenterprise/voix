/** Affiche une valeur légale ou un marqueur visible « À compléter » si elle n'est pas renseignée. */
export function Todo({ value, label }: { value: string | null; label: string }) {
  if (value) return <>{value}</>;
  return <span className="todo">[À compléter : {label}]</span>;
}
