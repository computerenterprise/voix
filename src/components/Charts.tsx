"use client";

import { useMemo, useState } from "react";

type Bar = { label: string; value: number; percent: number };

/** Barres horizontales à une seule série : la valeur est écrite en clair, l'infobulle donne le détail. */
export function HBarChart({ data, unit = "participations" }: { data: Bar[]; unit?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.percent));
  return (
    <ul className="grid gap-3" role="list">
      {data.map((d, i) => (
        <li
          key={d.label}
          className="group relative"
          tabIndex={0}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(null)}
          aria-label={`${d.label} : ${d.percent} %, ${d.value} ${unit}`}
        >
          <div className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
            <span className="font-medium">{d.label}</span>
            <span className="tabular-nums font-semibold">{d.percent}%</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-paper-2">
            <div
              className="bar-grow h-full rounded-full transition-colors"
              style={{ width: `${(d.percent / max) * 100}%`, background: hover === i ? "#0058b0" : "var(--signal)", animationDelay: `${i * 50}ms` }}
            />
          </div>
          {hover === i && (
            <div role="tooltip" className="pointer-events-none absolute right-0 -top-9 z-10 rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold text-paper shadow">
              {d.value.toLocaleString("fr-FR")} {unit} citent ce point
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Colonnes journalières (30 derniers jours), infobulle au survol ou au focus. */
export function DailyChart({ data }: { data: { day: string; n: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const days = useMemo(() => {
    const map = new Map(data.map((d) => [d.day, d.n]));
    const out: { day: string; n: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const key = d.toISOString().slice(0, 10);
      out.push({ day: key, n: map.get(key) ?? 0 });
    }
    return out;
  }, [data]);
  const max = Math.max(1, ...days.map((d) => d.n));
  const fmt = (s: string) => new Date(s + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return (
    <div>
      <div className="relative flex h-40 items-end gap-[2px]" role="img" aria-label="Participations par jour sur 30 jours">
        {days.map((d, i) => (
          <div
            key={d.day}
            className="relative flex h-full flex-1 items-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div
              className="w-full rounded-t-[4px]"
              style={{ height: `${Math.max((d.n / max) * 100, d.n ? 3 : 1)}%`, background: hover === i ? "#0058b0" : d.n ? "var(--signal)" : "var(--paper-2)" }}
            />
            {hover === i && (
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold text-paper">
                {fmt(d.day)} · {d.n}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>{fmt(days[0].day)}</span>
        <span>aujourd&apos;hui</span>
      </div>
    </div>
  );
}

type Area = { id: string; name: string; sub?: string; total: number; schools: number; top: { label: string; percent: number }[] };

/** Explorateur filtrable (départements ou villes) : un tableau lisible, pas de classement. */
export function AreaExplorer({ areas, kind }: { areas: Area[]; kind: "département" | "ville" }) {
  const [q, setQ] = useState("");
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const list = areas.filter((a) => norm(`${a.id} ${a.name} ${a.sub ?? ""}`).includes(norm(q)));
  return (
    <div>
      <label className="block">
        <span className="sr-only">Filtrer par {kind}</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Filtrer par ${kind}…`}
          className="w-full rounded-xl bg-card px-4 py-2.5 outline-none ring-1 ring-transparent focus:bg-white focus:ring-signal"
        />
      </label>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="py-2 pr-3 font-semibold">{kind === "département" ? "Département" : "Ville"}</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Participations</th>
              <th scope="col" className="py-2 font-semibold">Préoccupations les plus citées</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id + a.name} className="border-t border-line align-top">
                <td className="py-3 pr-3 font-semibold">
                  {a.name}
                  {a.sub && <span className="block text-xs font-normal text-muted">{a.sub}</span>}
                </td>
                <td className="py-3 pr-3 tabular-nums">
                  {a.total.toLocaleString("fr-FR")}
                  <span className="block text-xs text-muted">{a.schools} lycée{a.schools > 1 ? "s" : ""}</span>
                </td>
                <td className="py-3">
                  {a.top.map((t) => (
                    <span key={t.label} className="mr-1.5 mb-1.5 inline-block rounded-full bg-paper-2 px-2.5 py-0.5 text-xs font-semibold">
                      {t.label} · {t.percent}%
                    </span>
                  ))}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={3} className="py-4 text-muted">Aucun résultat.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
