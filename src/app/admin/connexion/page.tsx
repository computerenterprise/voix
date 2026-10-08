import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

export default async function Login() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="mx-auto max-w-sm px-4 pt-16">
      <h1 className="font-display text-4xl font-bold">Administration</h1>
      <p className="mt-2 text-sm text-muted">Accès réservé à l&apos;équipe de modération.</p>
      <LoginForm />
    </div>
  );
}
