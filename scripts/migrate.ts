// Applique les migrations SQL de db/migrations dans l'ordre. Usage : DATABASE_URL=... npm run db:migrate
import postgres from "postgres";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1, onnotice: () => {} });
const dir = join(process.cwd(), "db/migrations");

async function main() {
  await sql`create table if not exists schema_migrations (version text primary key, applied_at timestamptz not null default now())`;
  const done = new Set((await sql<{ version: string }[]>`select version from schema_migrations`).map((r) => r.version));
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (done.has(file)) continue;
    await sql.begin(async (tx) => {
      await tx.unsafe(readFileSync(join(dir, file), "utf8"));
      await tx`insert into schema_migrations (version) values (${file})`;
    });
    console.log("appliquée :", file);
  }
  console.log("Migrations à jour.");
  await sql.end();
}
main().catch(async (e) => {
  console.error(e);
  await sql.end();
  process.exit(1);
});
