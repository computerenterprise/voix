"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { consumeProof, prepareProof } from "@/lib/pow-client";

export function ParticipateForm({ uai, already }: { uai: string; already: string[] }) {
  const router = useRouter();
  const startedAt = useRef(Date.now());
  const [selected, setSelected] = useState<string[]>([]);
  const [withText, setWithText] = useState(false);
  const [textCat, setTextCat] = useState("");
  const [body, setBody] = useState("");
  const [hp, setHp] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // La vérification anti-robot se calcule en arrière-plan pendant que l'élève choisit.
  useEffect(() => {
    prepareProof(uai).catch(() => {});
  }, [uai]);

  const toggle = (k: string) => setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const cats = [...new Set([...selected])];
  const reportCat = textCat || cats[0] || "";
  const canSend = cats.length > 0 && (!withText || (body.trim().length >= 10 && reportCat));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    setError("");
    try {
      const pow = await prepareProof(uai);
      consumeProof(uai);
      const res = await fetch("/api/participations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          uai,
          categories: cats,
          report: withText && body.trim() ? { category: reportCat, body: body.trim() } : null,
          hp,
          elapsed: Date.now() - startedAt.current,
          pow,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      router.push(`/lycee/${uai}?merci=1${data.reportPending ? "&ecrit=1" : ""}${data.verifying ? "&verif=1" : ""}`);
    } catch (err) {
      setError((err as Error).message || "Erreur réseau. Réessaie.");
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8" noValidate>
      <fieldset>
        <legend className="text-sm font-medium text-muted">Préoccupations</legend>
        <div className="mt-3 grid gap-2">
          {CATEGORIES.map((c) => {
            const on = selected.includes(c.key);
            const was = already.includes(c.key);
            return (
              <label
                key={c.key}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 ring-2 transition-all ${on ? "bg-[#e8f2ff] ring-signal" : "bg-card ring-transparent hover:bg-paper-2"}`}
              >
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(c.key)} />
                <span aria-hidden className="text-xl">{c.emoji}</span>
                <span className="flex-1 text-[1.0625rem] font-medium">{c.label}</span>
                {was && !on && <span className="chip bg-ok-soft text-ok">déjà soutenu</span>}
                <span aria-hidden className={`grid h-6 w-6 place-items-center rounded-full border-2 transition-colors ${on ? "border-signal bg-signal text-white" : "border-line bg-white"}`}>
                  {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10"/></svg>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8">
        <p className="text-sm font-medium text-muted">Un détail à ajouter&nbsp;? Facultatif.</p>
        {!withText ? (
          <button type="button" className="link mt-2 text-[1.0625rem] font-medium" onClick={() => setWithText(true)}>
            + Écrire un signalement
          </button>
        ) : (
          <div className="mt-3 rounded-2xl bg-card p-4">
            <div className="rounded-xl bg-white p-3 text-sm text-ink-2">
              <p className="font-semibold text-ink">Décris un problème, pas une personne.</p>
              <p className="mt-0.5">Pas de nom (élève, prof, personnel), pas de contact, pas d&apos;insulte. Ton message est relu avant toute publication et peut être refusé.</p>
            </div>
            {cats.length > 1 && (
              <label className="mt-3 block text-sm font-semibold">
                Ton message concerne :
                <select
                  className="mt-1 block w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base"
                  value={reportCat}
                  onChange={(e) => setTextCat(e.target.value)}
                >
                  {cats.map((k) => (
                    <option key={k} value={k}>{CATEGORIES.find((c) => c.key === k)?.label}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="mt-3 block text-sm font-semibold" htmlFor="body">Ton signalement</label>
            <textarea
              id="body"
              rows={4}
              maxLength={500}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ex. : Les toilettes du bâtiment B sont fermées depuis la rentrée."
              className="mt-1 block w-full resize-y rounded-xl border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-signal focus:shadow-[0_0_0_4px_rgb(0_113_227/0.15)]"
            />
            <p className="mt-1 text-right text-xs text-muted">{body.length}/500</p>
          </div>
        )}
      </div>

      {/* Champ piège invisible pour les robots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Ne pas remplir<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} name="website" /></label>
      </div>

      {error && <p role="alert" className="mt-6 rounded-2xl bg-signal-soft p-4 text-sm font-medium text-signal-ink">{error}</p>}

      <div className="sticky bottom-0 -mx-4 mt-8 border-t border-black/5 bg-white/80 px-4 py-4 backdrop-blur-xl">
        <button type="submit" disabled={!canSend || sending} className="btn btn-primary w-full">
          {sending ? "Envoi…" : cats.length ? `Envoyer (${cats.length})` : "Choisis au moins une préoccupation"}
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          Un seul décompte par navigateur et par lycée. <Link href="/confidentialite" className="link">Ce que nous enregistrons</Link>
        </p>
      </div>
    </form>
  );
}
