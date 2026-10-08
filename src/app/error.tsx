"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    fetch("/api/log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: String(error.message).slice(0, 500), digest: error.digest, path: location.pathname }),
    }).catch(() => {});
  }, [error]);
  return (
    <div className="mx-auto max-w-2xl px-4 pt-16">
      <h1 className="font-display text-4xl font-extrabold">Oups, quelque chose a coincé.</h1>
      <p className="mt-3 text-ink-2">L&apos;erreur a été signalée à l&apos;équipe. Tu peux réessayer.</p>
      <button onClick={reset} className="btn btn-primary mt-6">Réessayer</button>
    </div>
  );
}
