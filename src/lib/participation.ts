import "server-only";
import { z } from "zod";
import { sql } from "./db";
import { CATEGORY_KEYS } from "./categories";
import { checkText, BLOCKING_MESSAGES } from "./text-guard";

export const ParticipationInput = z.object({
  uai: z.string().regex(/^\d{7}[A-Z]$/),
  categories: z.array(z.enum(CATEGORY_KEYS as [string, ...string[]])).min(1).max(7),
  report: z
    .object({
      category: z.enum(CATEGORY_KEYS as [string, ...string[]]),
      body: z.string().trim().min(10).max(500),
    })
    .optional()
    .nullable(),
  hp: z.string().max(200).optional(),        // champ piège invisible
  elapsed: z.number().int().min(0).max(86_400_000).optional(), // ms passées sur le formulaire
  pow: z.object({ c: z.string().max(200), n: z.string().regex(/^\d{1,12}$/) }).optional(), // preuve de travail
});
export type ParticipationInput = z.infer<typeof ParticipationInput>;

/** Seuils anti-abus par lycée et par empreinte d'IP du jour (une IP peut être partagée : wifi du lycée, opérateur mobile). */
export const IP_FLAG_THRESHOLD = 10;
/**
 * Au-delà de ce nombre de navigateurs différents depuis la même connexion (même jour, même lycée), les nouvelles
 * participations sont enregistrées « en vérification » et ne sont pas comptées tant que l'équipe ne les a pas validées.
 * C'est la parade au vote répété en navigation privée ou en effaçant ses cookies.
 */
export const IP_VERIFY_THRESHOLD = 3;
export const IP_SUSPEND_THRESHOLD = 40;
export const MAX_REPORTS_PER_DEVICE_SCHOOL = 3;

export type SubmitResult =
  | { ok: true; participationId: number; status: string; reportPending: boolean }
  | { ok: false; status: number; error: string };

export async function submitParticipation(
  input: ParticipationInput,
  ctx: { deviceHash: string; ipHash: string; newDevice: boolean },
): Promise<SubmitResult> {
  const [school] = await sql<{ uai: string }[]>`select uai from schools where uai = ${input.uai} and not hidden`;
  if (!school) return { ok: false, status: 404, error: "Établissement introuvable." };

  let reportFlags: string[] = [];
  if (input.report) {
    const g = checkText(input.report.body);
    if (g.blocking.length) {
      return {
        ok: false,
        status: 422,
        error: `Pour ta sécurité, retire ${g.blocking.map((b) => BLOCKING_MESSAGES[b]).join(", ")} de ton message. Aucune information personnelle ne doit y figurer.`,
      };
    }
    reportFlags = g.flags;
  }

  const flags: string[] = [];
  let suspend = false;
  if (input.hp) {
    flags.push("piege");
    suspend = true;
  }
  if (input.elapsed !== undefined && input.elapsed < 1500) flags.push("trop_rapide");

  // Un navigateur qui a déjà participé ne fait que compléter sa participation : pas de nouveau contrôle de connexion.
  const [existing] = await sql<{ id: number }[]>`
    select id from participations where school_uai = ${input.uai} and device_hash = ${ctx.deviceHash}`;
  const [{ n: sameIp }] = existing
    ? [{ n: 0 }]
    : await sql<{ n: number }[]>`
    select count(*)::int as n from participations
    where ip_hash = ${ctx.ipHash} and school_uai = ${input.uai} and created_at > now() - interval '24 hours'`;
  let verify = false;
  if (sameIp >= IP_SUSPEND_THRESHOLD) {
    flags.push("rafale_ip");
    suspend = true;
  } else if (sameIp >= IP_VERIFY_THRESHOLD) {
    flags.push(sameIp >= IP_FLAG_THRESHOLD ? "ip_partagee" : "connexion_multiple");
    verify = true;
  }

  const [{ n: recent }] = await sql<{ n: number }[]>`
    select count(*)::int as n from participations where school_uai = ${input.uai} and created_at > now() - interval '10 minutes'`;
  if (recent >= 100) flags.push("pic_lycee");

  return sql.begin(async (tx) => {
    const [p] = await tx<{ id: number; status: string }[]>`
      insert into participations (school_uai, device_hash, ip_hash, categories, status, flags)
      values (${input.uai}, ${ctx.deviceHash}, ${ctx.ipHash}, ${input.categories}, ${suspend ? "suspended" : verify ? "pending" : "counted"}, ${flags})
      on conflict (school_uai, device_hash) do update set
        categories = (select array_agg(distinct c order by c) from unnest(participations.categories || excluded.categories) c),
        flags = (select coalesce(array_agg(distinct f), '{}') from unnest(participations.flags || excluded.flags) f),
        status = case when participations.status in ('counted','pending') and excluded.status = 'suspended' then 'suspended' else participations.status end,
        updated_at = now()
      returning id, status`;

    let reportPending = false;
    if (input.report) {
      const [{ n }] = await tx<{ n: number }[]>`select count(*)::int as n from reports where participation_id = ${p.id}`;
      if (n >= MAX_REPORTS_PER_DEVICE_SCHOOL) {
        throw new LimitError("Tu as déjà envoyé plusieurs signalements écrits pour cet établissement.");
      }
      // Le texte libre est TOUJOURS en attente de modération.
      await tx`
        insert into reports (participation_id, school_uai, category, body, auto_flags)
        values (${p.id}, ${input.uai}, ${input.report.category}, ${input.report.body}, ${reportFlags})`;
      if (!input.categories.includes(input.report.category)) {
        await tx`update participations set categories = (select array_agg(distinct c order by c) from unnest(categories || ${[input.report.category]}::text[]) c) where id = ${p.id}`;
      }
      reportPending = true;
    }
    return { ok: true as const, participationId: p.id, status: p.status, reportPending };
  }).catch((e) => {
    if (e instanceof LimitError) return { ok: false as const, status: 429, error: e.message };
    throw e;
  });
}

class LimitError extends Error {}
