import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages = ["", "/recherche", "/tableau", "/a-propos", "/charte", "/confidentialite", "/mentions-legales"].map((p) => ({
    url: base + p,
    changeFrequency: "daily" as const,
  }));
  // Tous les lycées référencés : chaque page doit pouvoir être trouvée depuis un moteur de recherche.
  const schools = await sql<{ uai: string; updated_at: Date }[]>`
    select uai, updated_at from schools where not hidden order by uai limit 45000`.catch(() => []);
  return [...pages, ...schools.map((s) => ({ url: `${base}/lycee/${s.uai}`, lastModified: s.updated_at, changeFrequency: "daily" as const }))];
}
