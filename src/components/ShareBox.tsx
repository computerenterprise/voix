"use client";

import { useState } from "react";

export function ShareBox({ url, name, compact = false }: { url: string; name: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const text = `${name} : voici les préoccupations exprimées dans notre lycée. Fais entendre la tienne sur VOIX.`;

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} · VOIX`, text, url });
        return;
      } catch {
        /* annulé par l'utilisateur */
        return;
      }
    }
    copy();
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copie ce lien :", url);
    }
  }

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "flex flex-col gap-2 sm:flex-row sm:flex-wrap"}>
      <button type="button" onClick={nativeShare} className="btn btn-dark">
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>
        Partager la page
      </button>
      {!compact && (
        <>
          <a className="btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a className="btn btn-ghost" href={`${url}/story`} download={`voix-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`}>
            Image pour ta story
          </a>
        </>
      )}
      <button type="button" onClick={copy} className="btn btn-ghost" aria-live="polite">
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </button>
    </div>
  );
}
