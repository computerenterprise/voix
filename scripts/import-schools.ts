/**
 * Importe les lycées depuis l'export CSV officiel de l'Annuaire de l'Éducation
 * (data.education.gouv.fr, jeu « fr-en-annuaire-education », Licence Ouverte).
 * Usage : DATABASE_URL=... npm run db:import -- chemin/vers/fr-en-annuaire-education.csv
 * Idempotent : met à jour les établissements existants, n'efface jamais de participation.
 */
import postgres from "postgres";
import { readFileSync } from "node:fs";
import { parseCsv } from "./csv";
import { normalize } from "../src/lib/normalize";

const file = process.argv[2];
if (!file) {
  console.error("Usage : npm run db:import -- fichier.csv");
  process.exit(1);
}

const key = (h: string) => normalize(h).replace(/ /g, "_");
const text = readFileSync(file, "utf8");
const delimiter = (text.split("\n")[0].match(/;/g)?.length ?? 0) > (text.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : ",";
const [header, ...rows] = parseCsv(text, delimiter);
const idx = Object.fromEntries(header.map((h, i) => [key(h), i]));

function col(r: string[], ...names: string[]): string {
  for (const n of names) {
    const i = idx[n];
    if (i !== undefined && r[i] !== undefined && r[i].trim() !== "") return r[i].trim();
  }
  return "";
}
const yes = (v: string) => ["1", "oui", "true", "o"].includes(v.toLowerCase());

const required = ["identifiant_de_l_etablissement", "nom_etablissement", "nom_commune"];
for (const r of required) if (idx[r] === undefined) {
  console.error(`Colonne manquante : ${r}. Colonnes trouvées : ${header.map(key).join(", ")}`);
  process.exit(1);
}

type Row = {
  uai: string; name: string; city: string; postal_code: string; department_code: string;
  department_name: string; academy: string; sector: string; tracks: string[]; search: string;
};
const out = new Map<string, Row>();
let skipped = 0;
for (const r of rows) {
  const uai = col(r, "identifiant_de_l_etablissement").toUpperCase();
  const type = col(r, "type_etablissement");
  const etat = col(r, "etat");
  const closed = col(r, "date_fermeture");
  if (!/^\d{7}[A-Z]$/.test(uai) || !/lyc/i.test(type) || /ferm/i.test(etat) || closed) {
    skipped++;
    continue;
  }
  const name = col(r, "nom_etablissement");
  const city = col(r, "nom_commune");
  const postal = col(r, "code_postal");
  const tracks = [
    yes(col(r, "voie_generale")) && "générale",
    yes(col(r, "voie_technologique")) && "technologique",
    yes(col(r, "voie_professionnelle")) && "professionnelle",
  ].filter(Boolean) as string[];
  let dept = col(r, "code_departement");
  if (/^0\d\d$/.test(dept) && !dept.startsWith("09")) dept = dept.slice(1);
  out.set(uai, {
    uai,
    name,
    city,
    postal_code: postal,
    department_code: dept,
    department_name: col(r, "libelle_departement"),
    academy: col(r, "libelle_academie"),
    sector: col(r, "statut_public_prive"),
    tracks,
    search: normalize(`${name} ${city} ${postal}`),
  });
}

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1, onnotice: () => {} });
async function main() {
  const list = [...out.values()];
  for (let i = 0; i < list.length; i += 500) {
    const chunk = list.slice(i, i + 500);
    await sql`
      insert into schools ${sql(chunk, "uai", "name", "city", "postal_code", "department_code", "department_name", "academy", "sector", "tracks", "search")}
      on conflict (uai) do update set
        name = excluded.name, city = excluded.city, postal_code = excluded.postal_code,
        department_code = excluded.department_code, department_name = excluded.department_name,
        academy = excluded.academy, sector = excluded.sector, tracks = excluded.tracks,
        search = excluded.search, updated_at = now()`;
  }
  console.log(`${list.length} lycées importés ou mis à jour, ${skipped} lignes ignorées (autres types, fermés ou invalides).`);
  await sql.end();
}
main().catch(async (e) => {
  console.error(e);
  await sql.end();
  process.exit(1);
});
