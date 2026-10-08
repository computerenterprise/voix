export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10" aria-busy="true" aria-label="Chargement">
      <div className="h-4 w-40 animate-pulse rounded-full bg-paper-2" />
      <div className="mt-4 h-12 w-3/4 animate-pulse rounded-2xl bg-paper-2" />
      <div className="mt-8 grid gap-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-paper-2" />)}
      </div>
    </div>
  );
}
