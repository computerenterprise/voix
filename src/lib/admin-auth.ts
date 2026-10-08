import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hmac, safeEqual, verifyPassword } from "./security";
import { sql } from "./db";

export const ADMIN_COOKIE = "voix_admin";
const SESSION_HOURS = 8;

function sign(payload: string) {
  return hmac(payload, "admin-session");
}

export function checkAdminPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) return false;
  try {
    return verifyPassword(password, stored);
  } catch {
    return false;
  }
}

export async function createAdminSession() {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  // L'empreinte du mot de passe est incluse : changer le mot de passe invalide toutes les sessions.
  const payload = `${exp}.${hmac(process.env.ADMIN_PASSWORD_HASH ?? "", "pw").slice(0, 16)}`;
  (await cookies()).set(ADMIN_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function isAdmin(): Promise<boolean> {
  const v = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!v) return false;
  const parts = v.split(".");
  if (parts.length !== 3) return false;
  const [exp, pw, sig] = parts;
  const payload = `${exp}.${pw}`;
  if (!safeEqual(sig, sign(payload))) return false;
  if (!safeEqual(pw, hmac(process.env.ADMIN_PASSWORD_HASH ?? "", "pw").slice(0, 16))) return false;
  return Number(exp) > Date.now();
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/connexion");
}

export async function destroyAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function audit(action: string, target?: string, detail?: string) {
  await sql`insert into admin_audit (action, target, detail) values (${action}, ${target ?? null}, ${detail?.slice(0, 500) ?? null})`;
}
