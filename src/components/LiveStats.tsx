"use client";

import { useEffect, useRef, useState } from "react";

type Counts = { participations: number; schools: number; solidaires: number };

const POLL_MS = 10_000;
const fmt = (n: number) => n.toLocaleString("fr-FR");

/** Fait défiler un nombre jusqu'à sa nouvelle valeur. */
function useTween(target: number) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = duration ? Math.min(1, (t - t0) / duration) : 1;
      const v = Math.round(start + (target - start) * (1 - Math.pow(1 - k, 3)));
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

function Stat({ value, one, many, live }: { value: number; one: string; many: string; live?: boolean }) {
  const shown = useTween(value);
  return (
    <div className="card px-3 py-5 text-center sm:p-6" data-testid={live ? "compteur-direct" : undefined}>
      <p className="font-display text-3xl font-bold tabular-nums sm:text-5xl" aria-live={live ? "polite" : undefined}>
        {fmt(shown)}
      </p>
      <p className="mt-1 text-xs leading-snug text-muted sm:text-sm">{shown > 1 ? many : one}</p>
    </div>
  );
}

export function LiveStats({ initial }: { initial: Counts }) {
  const [c, setC] = useState(initial);
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch("/api/compteurs", { cache: "no-store" });
        if (r.ok && !stop) setC(await r.json());
      } catch {
        /* réseau coupé : on garde les derniers chiffres */
      }
    };
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      stop = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  return (
    <div className="mt-8">
      <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
        <span aria-hidden className="pulse-dot inline-block h-2 w-2 rounded-full bg-ok" />
        En direct
      </p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat value={c.participations} one="participation" many="participations" live />
        <Stat value={c.schools} one="établissement" many="établissements" />
        <Stat value={c.solidaires} one="personne solidaire" many="personnes solidaires" live />
      </div>
    </div>
  );
}
