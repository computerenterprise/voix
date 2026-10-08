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
let sections = 0;
// Établissements sans lycéens : écoles uniquement post-bac (BTS, prépas), collèges.
const EXCLUDED_NATURES = /COMPOSEES UNIQT DE STS|^COLLEGE$/i;
for (const r of rows) {
  const uai = col(r, "identifiant_de_l_etablissement").toUpperCase();
  const type = col(r, "type_etablissement");
  const etat = col(r, "etat");
  const closed = col(r, "date_fermeture");
  if (!/^\d{7}[A-Z]$/.test(uai) || !/lyc/i.test(type) || /ferm/i.test(etat) || closed) {
    skipped++;
    continue;
  }
  // Une « section » rattachée administrativement à un lycée (SEP, SGT) est le même établissement pour les élèves :
  // on la retire pour ne pas éparpiller les participations. Les annexes géographiques (autre site) sont gardées.
  const nature = col(r, "libelle_nature");
  const attachment = col(r, "type_rattachement_etablissement_mere");
  if (/filiere|section/i.test(normalize(attachment)) || EXCLUDED_NATURES.test(nature)) {
    sections++;
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
  // « 075 » → « 75 », « 02A » → « 2A » ; l'outre-mer (971…988) reste sur 3 caractères.
  if (/^0(\d\d|2[AB])$/i.test(dept)) dept = dept.slice(1).toUpperCase();
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
  // Établissements absents du nouvel annuaire (fermés, fusionnés) : supprimés s'ils n'ont aucune participation, masqués sinon.
  const uais = list.map((s) => s.uai);
  const removed = await sql`
    delete from schools where source = 'annuaire-education' and not (uai = any(${uais}))
      and not exists (select 1 from participations p where p.school_uai = schools.uai)`;
  const hidden = await sql`
    update schools set hidden = true, updated_at = now()
    where source = 'annuaire-education' and not (uai = any(${uais})) and not hidden`;
  console.log(
    `${list.length} lycées importés ou mis à jour ; ${sections} sections rattachées ou établissements sans lycéens écartés ; ` +
      `${skipped} lignes ignorées (autres types, fermés ou invalides) ; ${removed.count} retirés, ${hidden.count} masqués car absents du fichier.`,
  );
  await sql.end();
}
main().catch(async (e) => {
  console.error(e);
  await sql.end();
  process.exit(1);
});
