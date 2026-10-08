import type { Metadata } from "next";
import { SchoolSearch } from "@/components/SchoolSearch";

export const metadata: Metadata = { title: "Trouver mon lycée" };

export default function SearchPage() {
  return (
    <section className="mx-auto min-h-[70dvh] max-w-2xl px-4 pt-10 sm:pt-16">
      <h1 className="font-display text-4xl font-extrabold sm:text-6xl">Trouve ton lycée</h1>
      <p className="mt-3 text-ink-2">Tape son nom, sa ville ou son code postal.</p>
      <div className="mt-8">
        <SchoolSearch autoFocus />
      </div>
      <p className="mt-10 text-sm text-muted">
        Ton lycée n&apos;apparaît pas ? Les données viennent de l&apos;annuaire officiel de l&apos;Éducation nationale.
        Essaie une autre orthographe, ou <a className="link" href="/signaler">signale-nous l&apos;oubli</a>.
      </p>
    </section>
  );
}
