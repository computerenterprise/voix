"use client";

import { useState } from "react";

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erreur réseau.");
  return data;
}

export function DeleteMine() {
  const [state, setState] = useState<"idle" | "confirm" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function go() {
    setState("sending");
    try {
      const d = await post("/api/me/delete", {});
      setMsg(d.deleted ? `${d.deleted} participation${d.deleted > 1 ? "s" : ""} effacée${d.deleted > 1 ? "s" : ""}, avec les messages associés.` : "Aucune participation n'est liée à ce navigateur.");
      setState("done");
    } catch (e) {
      setMsg((e as Error).message);
      setState("error");
    }
  }
  if (state === "done") return <p role="status" className="rounded-2xl bg-ok-soft p-4 font-semibold text-ok">{msg}</p>;
  return (
    <div>
      {state === "confirm" || state === "sending" ? (
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={go} disabled={state === "sending"}>Oui, tout effacer</button>
          <button className="btn btn-ghost" onClick={() => setState("idle")}>Annuler</button>
        </div>
      ) : (
        <button className="btn btn-dark" onClick={() => setState("confirm")}>Effacer mes participations</button>
      )}
      {state === "error" && <p role="alert" className="mt-2 text-sm text-signal-ink">{msg}</p>}
    </div>
  );
}

export function DeletionRequestForm() {
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      await post("/api/deletion-request", { details, contact });
      setState("done");
    } catch (err) {
      setMsg((err as Error).message);
      setState("error");
    }
  }
  if (state === "done") return <p role="status" className="rounded-2xl bg-ok-soft p-4 font-semibold text-ok">Demande reçue. Elle sera traitée par l&apos;équipe.</p>;
  return (
    <form onSubmit={submit} className="grid gap-3">
      <label className="text-sm font-semibold">
        Ta demande
        <textarea required minLength={5} maxLength={1000} rows={4} value={details} onChange={(e) => setDetails(e.target.value)}
          placeholder="Ex. : j'ai écrit un message pour le lycée X vers telle date et je souhaite qu'il soit supprimé."
          className="mt-1 block w-full rounded-xl border border-line bg-card px-3 py-2.5 text-base font-normal" />
      </label>
      <label className="text-sm font-semibold">
        Contact pour te répondre (facultatif)
        <input maxLength={200} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Facultatif"
          className="mt-1 block w-full rounded-xl border border-line bg-card px-3 py-2.5 text-base font-normal" />
        <span className="mt-1 block text-xs font-normal text-muted">Effacé dès que ta demande est traitée.</span>
      </label>
      {state === "error" && <p role="alert" className="text-sm text-signal-ink">{msg}</p>}
      <button className="btn btn-dark justify-self-start" disabled={state === "sending"}>Envoyer la demande</button>
    </form>
  );
}

const REASONS = [
  ["donnees_personnelles", "Données personnelles (nom, contact, photo…)"],
  ["accusation", "Accusation contre une personne identifiable"],
  ["haine", "Haine, insulte, discrimination, harcèlement"],
  ["menace", "Menace ou appel à la violence"],
  ["faux", "Information manifestement fausse"],
  ["autre", "Autre (dont lycée manquant ou erroné)"],
] as const;

export function AbuseForm({ initialUrl }: { initialUrl: string }) {
  const [reason, setReason] = useState("");
  const [url, setUrl] = useState(initialUrl);
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      await post("/api/abuse", { reason, target_url: url, details });
      setState("done");
    } catch (err) {
      setMsg((err as Error).message);
      setState("error");
    }
  }
  if (state === "done") return <p role="status" className="rounded-2xl bg-ok-soft p-4 font-semibold text-ok">Merci. Ton signalement va être examiné par l&apos;équipe de modération.</p>;
  return (
    <form onSubmit={submit} className="grid gap-4">
      <fieldset>
        <legend className="text-sm font-semibold">Motif</legend>
        <div className="mt-2 grid gap-2">
          {REASONS.map(([k, l]) => (
            <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 ring-2 ${reason === k ? "bg-signal-tint ring-signal" : "bg-card ring-transparent"}`}>
              <input type="radio" name="reason" value={k} checked={reason === k} onChange={() => setReason(k)} className="accent-[#2852f0]" />
              <span className="font-medium">{l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="text-sm font-semibold">
        Page concernée
        <input maxLength={300} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/lycee/…"
          className="mt-1 block w-full rounded-xl border border-line bg-card px-3 py-2.5 text-base font-normal" />
      </label>
      <label className="text-sm font-semibold">
        Précisions (facultatif)
        <textarea maxLength={1000} rows={3} value={details} onChange={(e) => setDetails(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-line bg-card px-3 py-2.5 text-base font-normal" />
      </label>
      {state === "error" && <p role="alert" className="text-sm text-signal-ink">{msg}</p>}
      <button className="btn btn-dark justify-self-start" disabled={!reason || state === "sending"}>Envoyer le signalement</button>
    </form>
  );
}
