import "server-only";
import { sql } from "./db";
import { hmac, safeEqual } from "./security";
import { normalize } from "./normalize";

/**
 * Mot de passe facultatif d'un établissement : trois mots, partagés par les élèves (pas un identifiant personnel).
 * Comparaison tolérante : majuscules, accents, tirets et espaces multiples sont ignorés.
 * Seule une empreinte HMAC liée à l'établissement est stockée, jamais le mot de passe en clair.
 */
export const normalizeCode = (code: string) => normalize(code).replace(/[^a-z0-9]+/g, " ").trim();
const codeHash = (uai: string, code: string) => hmac(`${uai}|${normalizeCode(code)}`, "school-code");

export async function schoolHasCode(uai: string): Promise<boolean> {
  const [row] = await sql`select 1 from school_codes where school_uai = ${uai}`;
  return !!row;
}

export async function checkSchoolCode(uai: string, code: string): Promise<boolean> {
  const [row] = await sql<{ code_hash: string }[]>`select code_hash from school_codes where school_uai = ${uai}`;
  return !!row && safeEqual(row.code_hash, codeHash(uai, code));
}

export async function setSchoolCode(uai: string, code: string | null) {
  if (!code) {
    await sql`delete from school_codes where school_uai = ${uai}`;
    return;
  }
  await sql`
    insert into school_codes (school_uai, code_hash) values (${uai}, ${codeHash(uai, code)})
    on conflict (school_uai) do update set code_hash = excluded.code_hash, version = school_codes.version + 1, updated_at = now()`;
}
