import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { HeaderLogo } from "@/components/HeaderLogo";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Sur iPhone et Mac, la police système (SF Pro) est utilisée ; ailleurs, Inter, auto-hébergée.
const inter = localFont({
  src: [
    { path: "../fonts/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../fonts/inter-latin-ext-wght-normal.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "VOIX — Ton lycée, ta fac. Ta voix.", template: "%s · VOIX" },
  description:
    "Signale ce qui ne fonctionne pas dans ton lycée ou ton université, soutiens les problèmes signalés par les autres et découvre les priorités de ton établissement. Plateforme indépendante.",
  openGraph: { siteName: "VOIX", locale: "fr_FR", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn btn-dark btn-sm">
          Aller au contenu
        </a>
        <header className="sticky top-0 z-30 border-b border-black/5 bg-[rgb(251_250_247/0.78)] backdrop-blur-xl backdrop-saturate-150">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
            <HeaderLogo />
            <nav aria-label="Navigation principale" className="flex items-center gap-0.5 whitespace-nowrap text-[0.9375rem] text-ink-2">
              <Link href="/tableau" className="rounded-full px-2.5 py-2 transition-colors hover:text-ink sm:px-3">Tableau</Link>
              <Link href="/a-propos" className="rounded-full px-2.5 py-2 transition-colors hover:text-ink sm:px-3">À propos</Link>
            </nav>
          </div>
        </header>
        <main id="contenu" className="flex-1">{children}</main>
        <footer className="mt-24 bg-card">
          <div className="mx-auto max-w-5xl px-4 py-10 text-xs text-muted">
            <p className="max-w-xl leading-relaxed">
              VOIX est une plateforme civique indépendante des partis, syndicats, établissements et administrations.
              Les participations ne constituent pas un sondage représentatif des élèves.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5 text-ink-2">
              <li><Link className="hover:underline" href="/a-propos">À propos et méthode</Link></li>
              <li><Link className="hover:underline" href="/charte">Charte de modération</Link></li>
              <li><Link className="hover:underline" href="/confidentialite">Confidentialité</Link></li>
              <li><Link className="hover:underline" href="/mentions-legales">Mentions légales</Link></li>
              <li><Link className="hover:underline" href="/mes-donnees">Mes données</Link></li>
              <li><Link className="hover:underline" href="/signaler">Signaler un contenu</Link></li>
            </ul>
            <p className="mt-5">
              Données des établissements : Annuaire de l&apos;Éducation, ministère de l&apos;Éducation nationale (Licence Ouverte).
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
