import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchool } from "@/lib/schools";
import { myCategories } from "@/lib/mine";
import { ParticipateForm } from "@/components/ParticipateForm";
import { words } from "@/lib/kind";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Participer", robots: { index: false } };

export default async function ParticipatePage({ params }: { params: Promise<{ uai: string }> }) {
  const uai = (await params).uai.toUpperCase();
  const school = await getSchool(uai);
  if (!school || school.hidden) notFound();
  const mine = await myCategories(uai);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <Link href={`/lycee/${uai}`} className="link text-sm">‹ {school.name}</Link>
      <h1 className="font-display mt-4 text-[2.25rem] font-bold leading-[1.08] sm:text-5xl">Qu&apos;est-ce qui coince dans {words(school.kind).your}&nbsp;?</h1>
      <p className="mt-3 text-lg text-muted">Choisis une ou plusieurs préoccupations. C&apos;est anonyme : on ne te demande ni nom, ni contact.</p>
      <p className="mt-2 text-sm text-muted">
        Tu n&apos;es pas {words(school.kind).people === "élèves" ? "élève" : "étudiant"} ici&nbsp;? Ce formulaire est réservé aux {words(school.kind).people}.
        Pour les soutenir, utilise le bouton <Link href="/#solidarite" className="link">« Je suis solidaire »</Link>.
      </p>
      <ParticipateForm uai={uai} already={mine} kind={school.kind} />
    </div>
  );
}
