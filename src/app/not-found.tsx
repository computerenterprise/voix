import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-16">
      <p className="font-display text-7xl font-bold">404</p>
      <h1 className="font-display mt-2 text-3xl font-bold">Page introuvable</h1>
      <p className="mt-3 text-ink-2">Ce lien ne mène nulle part. Le lycée a peut-être changé d&apos;identifiant.</p>
      <Link href="/recherche" className="btn btn-primary mt-6">Trouver mon établissement</Link>
    </div>
  );
}
