import postgres from "postgres";

/** Base de test dédiée : remise à zéro des données de participation avant chaque campagne de tests. */
export default async function globalSetup() {
  const url = process.env.E2E_DATABASE_URL ?? "postgres://voix@127.0.0.1:5432/voix_test";
  if (!/voix_test/.test(url)) throw new Error("Les tests e2e doivent viser une base de test (voix_test).");
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  await sql`truncate participations, reports, concern_status, deletion_requests, abuse_reports, error_logs, rate_limits, admin_audit, pow_used restart identity cascade`;
  await sql`update schools set hidden = false`;
  await sql.end();
}
