import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const figtree = localFont({
  src: [
    { path: "../fonts/figtree-latin-wght-normal.woff2", weight: "300 900", style: "normal" },
    { path: "../fonts/figtree-latin-ext-wght-normal.woff2", weight: "300 900", style: "normal" },
  ],
  variable: "--font-figtree",
  display: "swap",
});
const bricolage = localFont({
  src: [
    { path: "../fonts/bricolage-grotesque-latin-wght-normal.woff2", weight: "200 800", style: "normal" },
    { path: "../fonts/bricolage-grotesque-latin-ext-wght-normal.woff2", weight: "200 800", style: "normal" },
  ],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "VOIX — Ton lycée. Ta voix.", template: "%s · VOIX" },
  description:
    "Signale ce qui ne fonctionne pas dans ton lycée, soutiens les préoccupations des autres élèves et découvre les priorités de ton établissement. Plateforme indépendante.",
  openGraph: { siteName: "VOIX", locale: "fr_FR", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f5f2ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${figtree.variable} ${bricolage.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn btn-dark btn-sm">
          Aller au contenu
        </a>
        <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" aria-label="VOIX, accueil" className="rounded-md">
              <Logo className="h-6" />
            </Link>
            <nav aria-label="Navigation principale" className="flex items-center gap-1 text-[0.9375rem] font-semibold">
              <Link href="/tableau" className="rounded-full px-3 py-2 hover:bg-paper-2">Tableau</Link>
              <Link href="/a-propos" className="rounded-full px-3 py-2 hover:bg-paper-2">À propos</Link>
              <Link href="/recherche" className="btn btn-dark btn-sm ml-1 !min-h-9 !px-3.5">
                <span className="sr-only sm:not-sr-only">Mon lycée</span>
                <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </Link>
            </nav>
          </div>
        </header>
        <main id="contenu" className="flex-1">{children}</main>
        <footer className="mt-20 border-t border-line bg-paper-2/60">
          <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted">
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
              <div className="max-w-sm">
                <Logo className="h-5" />
                <p className="mt-3">
                  Plateforme civique indépendante des partis, syndicats, établissements et administrations.
                  Les participations ne sont pas un sondage représentatif.
                </p>
              </div>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-2 font-medium text-ink-2">
                <li><Link className="hover:underline" href="/a-propos">À propos et méthode</Link></li>
                <li><Link className="hover:underline" href="/charte">Charte de modération</Link></li>
                <li><Link className="hover:underline" href="/confidentialite">Confidentialité</Link></li>
                <li><Link className="hover:underline" href="/mentions-legales">Mentions légales</Link></li>
                <li><Link className="hover:underline" href="/mes-donnees">Mes données</Link></li>
                <li><Link className="hover:underline" href="/signaler">Signaler un contenu</Link></li>
              </ul>
            </div>
            <p className="mt-8 text-xs">
              Données des établissements : Annuaire de l&apos;Éducation, ministère de l&apos;Éducation nationale (Licence Ouverte).
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
