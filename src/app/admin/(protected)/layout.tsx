import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { sql } from "@/lib/db";
import { logout } from "../connexion/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [c] = await sql<{ reports: number; flagged: number; requests: number; abuse: number }[]>`
    select
      (select count(*)::int from reports where status = 'pending') as reports,
      (select count(*)::int from participations where status = 'suspended' or (cardinality(flags) > 0 and status = 'counted')) as flagged,
      (select count(*)::int from deletion_requests where status = 'open') as requests,
      (select count(*)::int from abuse_reports where status = 'open') as abuse`;
  const links: [string, string, number?][] = [
    ["/admin", "Statistiques"],
    ["/admin/moderation", "Modération", c.reports],
    ["/admin/participations", "Participations suspectes", c.flagged],
    ["/admin/signalements", "Signalements", c.abuse],
    ["/admin/demandes", "Suppressions", c.requests],
    ["/admin/lycees", "Lycées"],
    ["/admin/erreurs", "Erreurs"],
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="chip bg-ink text-paper">Espace privé · modération</p>
        <form action={logout}><button className="btn btn-ghost btn-sm">Déconnexion</button></form>
      </div>
      <nav className="mt-4 flex gap-1 overflow-x-auto pb-2 text-sm font-semibold" aria-label="Administration">
        {links.map(([href, label, n]) => (
          <Link key={href} href={href} className="whitespace-nowrap rounded-full bg-card px-3.5 py-2 ring-1 ring-line hover:ring-ink">
            {label}
            {n ? <span className="ml-1.5 rounded-full bg-signal px-1.5 text-ink">{n}</span> : null}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
