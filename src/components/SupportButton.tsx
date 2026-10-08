"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function SupportButton({ uai, category, supported, label }: { uai: string; category: string; supported: boolean; label: string }) {
  const router = useRouter();
  const loadedAt = useRef(Date.now());
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(supported ? "done" : "idle");
  const [msg, setMsg] = useState("");

  async function support() {
    setState("sending");
    try {
      const res = await fetch("/api/participations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uai, categories: [category], elapsed: Date.now() - loadedAt.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setState("done");
      // Affiche les résultats frais et l'invitation à partager.
      router.replace(`/lycee/${uai}?merci=1`, { scroll: true });
    } catch (e) {
      setMsg((e as Error).message || "Erreur réseau");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span className="chip bg-ok-soft text-ok" role="status">
        <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10"/></svg>
        Tu soutiens
      </span>
    );
  }
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={support}
        disabled={state === "sending"}
        className="btn btn-sm bg-white text-signal hover:bg-signal hover:text-white"
        aria-label={`Je soutiens : ${label}`}
      >
        {state === "sending" ? "…" : "Je soutiens"}
      </button>
      {state === "error" && <span className="text-xs text-signal-ink" role="alert">{msg}</span>}
    </div>
  );
}
