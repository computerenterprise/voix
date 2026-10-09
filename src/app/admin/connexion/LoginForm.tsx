"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm({ totp }: { totp: boolean }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-6 grid gap-3">
      <label className="text-sm font-semibold">
        Mot de passe
        <input name="password" type="password" required autoComplete="current-password"
          className="mt-1 block w-full rounded-xl border border-line bg-white px-3 py-3 text-base" />
      </label>
      {totp && (
        <label className="text-sm font-semibold">
          Code de l&apos;application d&apos;authentification
          <input name="code" required inputMode="numeric" pattern="[0-9 ]{6,7}" maxLength={7} autoComplete="one-time-code"
            className="mt-1 block w-full rounded-xl border border-line bg-white px-3 py-3 text-base tracking-[0.3em]" />
        </label>
      )}
      {state?.error && <p role="alert" className="text-sm font-semibold text-signal-ink">{state.error}</p>}
      <button className="btn btn-dark" disabled={pending}>{pending ? "…" : "Se connecter"}</button>
    </form>
  );
}
