"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sql } from "@/lib/db";
import { audit, isAdmin } from "@/lib/admin-auth";
import { CATEGORY_KEYS } from "@/lib/categories";
import { setSchoolCode } from "@/lib/school-code";

async function guard() {
  if (!(await isAdmin())) throw new Error("Non autorisé");
}
const id = (f: FormData, k = "id") => z.coerce.number().int().positive().parse(f.get(k));

export async function moderateReport(form: FormData) {
  await guard();
  const rid = id(form);
  const decision = z.enum(["approved", "rejected"]).parse(form.get("decision"));
  await sql`update reports set status = ${decision}, moderated_at = now() where id = ${rid}`;
  await audit(`report_${decision}`, `report:${rid}`);
  revalidatePath("/admin", "layout");
}

export async function deleteReport(form: FormData) {
  await guard();
  const rid = id(form);
  await sql`delete from reports where id = ${rid}`;
  await audit("report_deleted", `report:${rid}`);
  revalidatePath("/admin", "layout");
}

export async function setParticipationStatus(form: FormData) {
  await guard();
  const pid = id(form);
  const status = z.enum(["counted", "pending", "suspended", "removed"]).parse(form.get("status"));
  await sql`update participations set status = ${status}, flags = case when ${status} = 'counted' then '{}'::text[] else flags end, updated_at = now() where id = ${pid}`;
  await audit(`participation_${status}`, `participation:${pid}`);
  revalidatePath("/admin", "layout");
}

/** Suspend toutes les participations d'une même empreinte IP (du jour) pour un lycée : utile en cas de rafale. */
export async function suspendIpGroup(form: FormData) {
  await guard();
  const ip = z.string().min(8).max(64).parse(form.get("ip"));
  const uai = z.string().regex(/^\d{7}[A-Z]$/).parse(form.get("uai"));
  const r = await sql`update participations set status = 'suspended', updated_at = now() where ip_hash = ${ip} and school_uai = ${uai} and status in ('counted','pending')`;
  await audit("ip_group_suspended", `school:${uai}`, `${r.count} participations`);
  revalidatePath("/admin", "layout");
}

/** Valide d'un coup les participations « en vérification » d'une même connexion (ex. wifi du lycée, après contrôle). */
export async function validateIpGroup(form: FormData) {
  await guard();
  const ip = z.string().min(8).max(64).parse(form.get("ip"));
  const uai = z.string().regex(/^\d{7}[A-Z]$/).parse(form.get("uai"));
  const r = await sql`update participations set status = 'counted', updated_at = now() where ip_hash = ${ip} and school_uai = ${uai} and status = 'pending'`;
  await audit("ip_group_validated", `school:${uai}`, `${r.count} participations`);
  revalidatePath("/admin", "layout");
}

export async function handleDeletionRequest(form: FormData) {
  await guard();
  const rid = id(form);
  const status = z.enum(["done", "rejected"]).parse(form.get("status"));
  // Le contact éventuel est effacé dès le traitement (minimisation).
  await sql`update deletion_requests set status = ${status}, handled_at = now(), contact = null where id = ${rid}`;
  await audit(`deletion_request_${status}`, `deletion_request:${rid}`);
  revalidatePath("/admin", "layout");
}

export async function closeAbuse(form: FormData) {
  await guard();
  const rid = id(form);
  await sql`update abuse_reports set status = 'closed', handled_at = now() where id = ${rid}`;
  await audit("abuse_closed", `abuse:${rid}`, String(form.get("note") ?? "").slice(0, 300));
  revalidatePath("/admin", "layout");
}

export async function toggleSchool(form: FormData) {
  await guard();
  const uai = z.string().regex(/^\d{7}[A-Z]$/).parse(form.get("uai"));
  const hidden = form.get("hidden") === "1";
  await sql`update schools set hidden = ${hidden}, updated_at = now() where uai = ${uai}`;
  await audit(hidden ? "school_hidden" : "school_shown", `school:${uai}`);
  revalidatePath("/admin", "layout");
}

export async function setConcernStatus(form: FormData) {
  await guard();
  const uai = z.string().regex(/^\d{7}[A-Z]$/).parse(form.get("uai"));
  const category = z.enum(CATEGORY_KEYS as [string, ...string[]]).parse(form.get("category"));
  const status = z.enum(["", "transmis", "reponse", "en_cours", "resolu"]).parse(form.get("status"));
  const note = z.string().trim().max(280).parse(form.get("note") ?? "");
  if (!status) await sql`delete from concern_status where school_uai = ${uai} and category = ${category}`;
  else
    await sql`
      insert into concern_status (school_uai, category, status, note) values (${uai}, ${category}, ${status}, ${note || null})
      on conflict (school_uai, category) do update set status = excluded.status, note = excluded.note, updated_at = now()`;
  await audit("concern_status", `school:${uai}`, `${category}=${status || "aucun"}`);
  revalidatePath("/admin", "layout");
}

/** Définit, change ou retire le mot de passe facultatif d'un établissement (seule l'empreinte est enregistrée). */
export async function updateSchoolCode(form: FormData) {
  await guard();
  const uai = z.string().regex(/^\d{7}[A-Z]$/).parse(form.get("uai"));
  const remove = form.get("remove") === "1";
  const code = remove ? null : z.string().trim().min(5).max(120).parse(form.get("code"));
  await setSchoolCode(uai, code);
  await audit(remove ? "school_code_removed" : "school_code_set", `school:${uai}`);
  revalidatePath("/admin/lycees");
}

export async function clearErrors() {
  await guard();
  await sql`delete from error_logs`;
  await audit("errors_cleared");
  revalidatePath("/admin", "layout");
}
