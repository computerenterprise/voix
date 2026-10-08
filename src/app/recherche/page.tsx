import type { Metadata } from "next";
import { SchoolSearch } from "@/components/SchoolSearch";

export const metadata: Metadata = { title: "Trouver mon établissement" };

export default function SearchPage() {
  return (
    <section className="mx-auto min-h-[70dvh] max-w-2xl px-4 pt-12 text-center sm:pt-20">
      <h1 className="font-display text-4xl font-bold sm:text-6xl">Trouve ton établissement.</h1>
      <p className="mt-3 text-lg text-muted">Tape son nom, sa ville ou son code postal.</p>
      <div className="mt-8 text-left">
        <SchoolSearch autoFocus />
      </div>
      <p className="mt-10 text-sm text-muted">
        Ton établissement n&apos;apparaît pas ? Les lycées viennent de l&apos;annuaire officiel de l&apos;Éducation nationale,
        les universités et écoles de la liste officielle du ministère de l&apos;Enseignement supérieur.
        Essaie une autre orthographe, ou <a className="link" href="/signaler">signale-nous l&apos;oubli</a>.
      </p>
    </section>
  );
}
