/**
 * Importe les universités depuis l'export CSV officiel du ministère de l'Enseignement supérieur
 * (data.enseignementsup-recherche.gouv.fr, jeu « fr-esr-principaux-etablissements-enseignement-superieur », Licence Ouverte).
 * Retenus : le type « Université », plus les établissements dont le nom commence par « Université »
 * (Grenoble Alpes, Côte d'Azur, Lorraine, PSL, universités de technologie…). Les écoles ne sont pas importées.
 * Usage : DATABASE_URL=... npm run db:import-universites -- chemin/vers/fichier.csv
 */
import postgres from "postgres";
import { readFileSync } from "node:fs";
import { parseCsv } from "./csv";
import { normalize } from "../src/lib/normalize";

const file = process.argv[2];
if (!file) {
  console.error("Usage : npm run db:import-universites -- fichier.csv");
  process.exit(1);
}

const [header, ...rows] = parseCsv(readFileSync(file, "utf8").replace(/^﻿/, ""), ";");
const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
for (const r of ["uo_lib", "type_d_etablissement", "uai", "com_nom"]) {
  if (idx[r] === undefined) {
    console.error(`Colonne manquante : ${r}`);
    process.exit(1);
  }
}
const col = (r: string[], n: string) => (r[idx[n]] ?? "").trim();

/** « Paris 6e », « Lyon 7e », « Marseille 7e » → ville seule (l'arrondissement n'aide pas à chercher). */
const cityOf = (c: string) => c.replace(/^(Paris|Lyon|Marseille) \d+(er|e)$/, "$1");
/** « D084 » → « 84 », « D02B » → « 2B », « D974 » → « 974 » (même format que les lycées). */
const deptOf = (d: string) => d.replace(/^D/, "").replace(/^0(\d\d|2[AB])$/, "$1");

type Row = { uai: string; name: string; city: string; postal_code: string; department_code: string; department_name: string; academy: string; sector: string; tracks: string[]; search: string; kind: string; source: string };
const out = new Map<string, Row>();
let skipped = 0;
for (const r of rows) {
  if (r.length < 4) continue;
  const name = col(r, "uo_lib");
  const type = col(r, "type_d_etablissement");
  if (!(type === "Université" || /^Universit[ée] /i.test(name))) { skipped++; continue; }
  const uai = col(r, "uai").split(/[;,\s]+/)[0].toUpperCase();
  if (!/^\d{7}[A-Z]$/.test(uai)) { skipped++; continue; }
  const city = cityOf(col(r, "com_nom"));
  const postal = col(r, "code_postal_uai");
  const sigle = col(r, "sigle");
  out.set(uai, {
    uai, name, city, postal_code: postal,
    department_code: deptOf(col(r, "dep_id")),
    department_name: col(r, "dep_nom"),
    academy: col(r, "aca_nom"),
    sector: col(r, "secteur_d_etablissement") === "public" ? "Public" : "Privé",
    tracks: [],
    search: normalize(`${name} ${col(r, "nom_court")} ${sigle} universite fac ${city} ${postal}`),
    kind: "universite",
    source: "esr-etablissements",
  });
}

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1, onnotice: () => {} });
async function main() {
  const list = [...out.values()];
  await sql`
    insert into schools ${sql(list, "uai", "name", "city", "postal_code", "department_code", "department_name", "academy", "sector", "tracks", "search", "kind", "source")}
    on conflict (uai) do update set
      name = excluded.name, city = excluded.city, postal_code = excluded.postal_code,
      department_code = excluded.department_code, department_name = excluded.department_name,
      academy = excluded.academy, sector = excluded.sector, search = excluded.search,
      kind = excluded.kind, source = excluded.source, updated_at = now()`;
  const uais = list.map((s) => s.uai);
  const removed = await sql`
    delete from schools where source = 'esr-etablissements' and not (uai = any(${uais}))
      and not exists (select 1 from participations p where p.school_uai = schools.uai)`;
  const hidden = await sql`
    update schools set hidden = true, updated_at = now()
    where source = 'esr-etablissements' and not (uai = any(${uais})) and not hidden`;
  console.log(`${list.length} universités importées ou mises à jour ; ${skipped} lignes ignorées (écoles, autres) ; ${removed.count} retirées, ${hidden.count} masquées.`);
  await sql.end();
}
main().catch(async (e) => {
  console.error(e);
  await sql.end();
  process.exit(1);
});
