"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { consumeProof, prepareProof } from "@/lib/pow-client";

/** « Je suis solidaire » : pour les personnes qui ne sont pas élèves ou étudiants de l'établissement. */
export function SolidarityButton({ uai, done: initial }: { uai: string; done: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(initial ? "done" : "idle");
  const [msg, setMsg] = useState("");

  async function send() {
    setState("sending");
    try {
      const pow = await prepareProof(uai);
      consumeProof(uai);
      const res = await fetch("/api/solidarite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uai, pow }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setState("done");
      router.refresh();
    } catch (e) {
      setMsg((e as Error).message || "Erreur réseau");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span className="chip bg-ok-soft text-ok" role="status">
        <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10"/></svg>
        Tu es solidaire
      </span>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={send}
        onPointerEnter={() => prepareProof(uai).catch(() => {})}
        onFocus={() => prepareProof(uai).catch(() => {})}
        disabled={state === "sending"}
        className="btn btn-sm bg-white text-ink ring-1 ring-line hover:bg-ink hover:text-white"
      >
        {state === "sending" ? "…" : "☮ Je suis solidaire"}
      </button>
      {state === "error" && <span className="text-xs text-signal-ink" role="alert">{msg}</span>}
    </div>
  );
}
