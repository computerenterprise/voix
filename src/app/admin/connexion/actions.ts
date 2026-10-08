"use server";

import { redirect } from "next/navigation";
import { checkAdminPassword, createAdminSession, audit, destroyAdminSession } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";
import { ipHash } from "@/lib/security";

export async function login(_prev: { error: string } | null, form: FormData): Promise<{ error: string }> {
  const key = `login:${ipHash(await clientIp())}`;
  if (!(await rateLimit(key, 5, 900))) return { error: "Trop de tentatives. Réessaie dans 15 minutes." };
  const password = String(form.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD_HASH) return { error: "Administration non configurée (ADMIN_PASSWORD_HASH manquant)." };
  if (!checkAdminPassword(password)) {
    await audit("login_failed");
    return { error: "Mot de passe incorrect." };
  }
  await createAdminSession();
  await audit("login");
  redirect("/admin");
}

export async function logout() {
  await destroyAdminSession();
  redirect("/admin/connexion");
}
