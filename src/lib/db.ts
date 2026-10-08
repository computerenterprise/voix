import "server-only";
import postgres from "postgres";

declare global {
  var __voixSql: ReturnType<typeof postgres> | undefined;
}

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");
  return postgres(url, {
    // Compatible avec les poolers en mode transaction (Supabase :6543, Neon) : pas de requêtes préparées.
    prepare: false,
    // Petites réserves par instance : avec beaucoup d'instances serverless en parallèle, c'est le pooler qui mutualise.
    max: Number(process.env.DB_POOL_MAX ?? (process.env.VERCEL ? 3 : 5)),
    max_lifetime: 60 * 30,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });
}

export const sql = globalThis.__voixSql ?? (globalThis.__voixSql = create());
