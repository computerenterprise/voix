import type { Metadata } from "next";
import { AbuseForm } from "@/components/Forms";

export const metadata: Metadata = { title: "Signaler un contenu", robots: { index: false } };

export default async function Report({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = (await searchParams).page ?? "";
  const safe = page.startsWith("/") && page.length < 200 ? page : "";
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10">
      <h1 className="font-display text-4xl font-bold sm:text-6xl">Signaler un contenu</h1>
      <p className="mt-4 text-ink-2">
        Un contenu publié sur VOIX te semble illicite ou contraire à notre charte ? Dis-le nous. Pas besoin de donner ton identité.
      </p>
      <p className="mt-2 rounded-2xl bg-signal-soft p-4 text-sm font-semibold text-signal-ink">
        En cas de danger immédiat : 17 ou 112. Harcèlement : 3018. Enfance en danger : 119.
      </p>
      <div className="mt-8"><AbuseForm initialUrl={safe} /></div>
    </div>
  );
}
