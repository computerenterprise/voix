import type { Metadata } from "next";
import Link from "next/link";
import { DeleteMine, DeletionRequestForm } from "@/components/Forms";

export const metadata: Metadata = { title: "Mes données", robots: { index: false } };

export default function MyData() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10">
      <h1 className="font-display text-4xl font-extrabold sm:text-6xl">Mes données</h1>
      <p className="mt-4 text-lg text-ink-2">
        Nous ne savons pas qui tu es. Tes participations sont liées uniquement à ce navigateur, grâce à un cookie aléatoire.
      </p>
      <section className="card mt-8 p-6">
        <h2 className="font-display text-2xl font-extrabold">Effacer immédiatement</h2>
        <p className="mt-2 text-ink-2">
          Efface toutes les participations et tous les messages envoyés depuis ce navigateur, pour tous les lycées. C&apos;est définitif.
        </p>
        <div className="mt-4"><DeleteMine /></div>
      </section>
      <section className="card mt-4 p-6">
        <h2 className="font-display text-2xl font-extrabold">Autre demande</h2>
        <p className="mt-2 mb-4 text-ink-2">
          Tu as changé de navigateur ou effacé tes cookies ? Décris ce que tu veux faire supprimer, l&apos;équipe s&apos;en occupe.
          Plus d&apos;informations dans la <Link className="link" href="/confidentialite">politique de confidentialité</Link>.
        </p>
        <DeletionRequestForm />
      </section>
    </div>
  );
}
