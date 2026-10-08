import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchool } from "@/lib/schools";
import { myCategories } from "@/lib/mine";
import { ParticipateForm } from "@/components/ParticipateForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Participer", robots: { index: false } };

export default async function ParticipatePage({ params }: { params: Promise<{ uai: string }> }) {
  const uai = (await params).uai.toUpperCase();
  const school = await getSchool(uai);
  if (!school || school.hidden) notFound();
  const mine = await myCategories(uai);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <Link href={`/lycee/${uai}`} className="text-sm font-semibold text-muted hover:text-ink">← {school.name}</Link>
      <h1 className="font-display mt-3 text-4xl font-extrabold leading-[1.02] sm:text-5xl">Qu&apos;est-ce qui coince dans ton lycée&nbsp;?</h1>
      <p className="mt-3 text-ink-2">Choisis une ou plusieurs préoccupations. C&apos;est anonyme : on ne te demande ni nom, ni contact.</p>
      <ParticipateForm uai={uai} already={mine} />
    </div>
  );
}
