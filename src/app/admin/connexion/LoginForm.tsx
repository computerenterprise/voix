"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-6 grid gap-3">
      <label className="text-sm font-semibold">
        Mot de passe
        <input name="password" type="password" required autoComplete="current-password"
          className="mt-1 block w-full rounded-xl border-2 border-ink bg-card px-3 py-3 text-base" />
      </label>
      {state?.error && <p role="alert" className="text-sm font-semibold text-signal-ink">{state.error}</p>}
      <button className="btn btn-dark" disabled={pending}>{pending ? "…" : "Se connecter"}</button>
    </form>
  );
}
