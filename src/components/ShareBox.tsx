"use client";

import { useState } from "react";
import { words } from "@/lib/kind";

export function ShareBox({ url, name, compact = false, kind }: { url: string; name: string; compact?: boolean; kind?: string }) {
  const [copied, setCopied] = useState(false);
  const text = `${name} : voici les problèmes signalés dans ${words(kind).our}. Fais entendre la tienne sur VOIX.`;

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
    <div className={compact ? "flex flex-wrap justify-center gap-2" : "flex w-full max-w-xs flex-col gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center"}>
      <button type="button" onClick={nativeShare} className={`btn ${compact ? "btn-ghost btn-sm" : "btn-dark"}`}>
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>
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
      <button type="button" onClick={copy} className={`btn btn-ghost ${compact ? "btn-sm" : ""}`} aria-live="polite">
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </button>
    </div>
  );
}
