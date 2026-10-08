"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Result = { uai: string; name: string; city: string; postal_code: string; sector: string; tracks: string[]; department_name: string };

export function SchoolSearch({ autoFocus = false, size = "lg" }: { autoFocus?: boolean; size?: "lg" | "md" }) {
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [fuzzy, setFuzzy] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [active, setActive] = useState(-1);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setState("idle");
      return;
    }
    const t = setTimeout(async () => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setState("loading");
      try {
        const res = await fetch(`/api/schools/search?q=${encodeURIComponent(term)}`, { signal: c.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur");
        setResults(data.results);
        setFuzzy(data.fuzzy);
        setActive(data.results.length ? 0 : -1);
        setState("done");
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message);
        setState("error");
      }
    }, 140);
    return () => clearTimeout(t);
  }, [q]);

  const go = (r: Result) => router.push(`/lycee/${r.uai}`);

  const onKey = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(results[active]);
    }
  };

  const open = q.trim().length >= 2 && state !== "idle";
  const big = size === "lg";

  return (
    <div className="relative w-full">
      <label htmlFor={id} className="sr-only">Nom du lycée, ville ou code postal</label>
      <div className={`flex items-center gap-3 rounded-full border-2 border-ink bg-card ${big ? "h-16 px-5" : "h-13 px-4"} shadow-[0_6px_0_0_var(--ink)] focus-within:shadow-[0_6px_0_0_var(--signal)] transition-shadow`}>
        <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="shrink-0"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input
          id={id}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          autoFocus={autoFocus}
          placeholder="Nom du lycée, ville ou code postal"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          maxLength={80}
          className={`w-full min-w-0 bg-transparent outline-none placeholder:text-muted ${big ? "text-lg" : "text-base"} font-medium`}
        />
        {state === "loading" && <span aria-hidden className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-ink border-t-transparent" />}
      </div>

      <div aria-live="polite" className="sr-only">
        {state === "done" && `${results.length} résultat${results.length > 1 ? "s" : ""}`}
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-3 overflow-hidden rounded-3xl border border-line bg-card shadow-xl rise">
          {state === "error" && <p className="p-5 text-sm text-signal-ink">{error}</p>}
          {state === "done" && results.length === 0 && (
            <div className="p-5 text-sm text-ink-2">
              <p className="font-semibold">Aucun lycée trouvé pour « {q.trim()} ».</p>
              <p className="mt-1 text-muted">Essaie avec la ville, le code postal, ou une partie du nom seulement (ex. « Hugo Besançon »).</p>
            </div>
          )}
          {results.length > 0 && (
            <>
              {fuzzy && <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">Résultats approchants</p>}
              <ul id={`${id}-list`} role="listbox" aria-label="Lycées" className="max-h-[60vh] overflow-auto py-2">
                {results.map((r, i) => (
                  <li
                    key={r.uai}
                    id={`${id}-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                    className={`mx-2 cursor-pointer rounded-2xl px-3 py-3 ${i === active ? "bg-paper-2" : ""}`}
                  >
                    <p className="font-semibold leading-tight">{r.name}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {r.city} {r.postal_code && `· ${r.postal_code}`} {r.sector && `· ${r.sector}`}
                      {r.tracks.length > 0 && ` · voie ${r.tracks.join(", ")}`}
                    </p>
                  </li>
                ))}
              </ul>
              {results.length >= 10 && (
                <p className="border-t border-line px-5 py-3 text-xs text-muted">Beaucoup de lycées portent ce nom : ajoute la ville ou le code postal.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
