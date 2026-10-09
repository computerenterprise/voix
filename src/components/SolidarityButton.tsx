"use client";

import { useState } from "react";
import { consumeProof, prepareProof } from "@/lib/pow-client";

/** « Je suis solidaire » : soutien à la cause, pour les personnes qui ne sont pas élèves ou étudiants. */
const SCOPE = "0000000F"; // même valeur que SOLIDARITY_SCOPE côté serveur

export function SolidarityButton({ done: initial, total: initialTotal }: { done: boolean; total: number }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(initial ? "done" : "idle");
  const [msg, setMsg] = useState("");
  const [total, setTotal] = useState(initialTotal);

  async function send() {
    setState("sending");
    try {
      const pow = await prepareProof(SCOPE);
      consumeProof(SCOPE);
      const res = await fetch("/api/solidarite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pow }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setState("done");
      if (!data.already) setTotal((t) => t + 1); // le total serveur est mis en cache quelques secondes
    } catch (e) {
      setMsg((e as Error).message || "Erreur réseau");
      setState("error");
    }
  }

  const count = total > 0 && (
    <span className="w-full text-sm">
      <strong className="tabular-nums">{total.toLocaleString("fr-FR")}</strong> personne{total > 1 ? "s" : ""} solidaire{total > 1 ? "s" : ""} partout en France
    </span>
  );

  if (state === "done") {
    return (
      <>
        <span className="chip bg-ok-soft text-ok" role="status">
          <svg
            aria-hidden
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 5 5 9-10" />
          </svg>
          Tu es solidaire
        </span>
        {count}
      </>
    );
  }
  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={send}
          onPointerEnter={() => prepareProof(SCOPE).catch(() => {})}
          onFocus={() => prepareProof(SCOPE).catch(() => {})}
          disabled={state === "sending"}
          className="btn btn-sm bg-white text-ink ring-1 ring-line hover:bg-ink hover:text-white"
        >
          {state === "sending" ? "…" : "☮ Je suis solidaire"}
        </button>
        {state === "error" && (
          <span className="text-xs text-signal-ink" role="alert">
            {msg}
          </span>
        )}
      </div>
      {count}
    </>
  );
}
