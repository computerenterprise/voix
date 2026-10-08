import "server-only";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getSchool, getSchoolResultsCached } from "./schools";
import { categoryLabel, MIN_FOR_PERCENT } from "./categories";
import { words } from "./kind";
import { siteUrl } from "./site";

let fonts: Promise<{ name: string; data: Buffer; weight: 500 | 600 | 700; style: "normal" }[]> | null = null;
function loadFonts() {
  const dir = join(process.cwd(), "assets/fonts");
  fonts ??= Promise.all(
    ([500, 600, 700] as const).map((weight) =>
      readFile(join(dir, `inter-latin-${weight}-normal.woff`)).then((data) => ({ name: "Inter", data, weight, style: "normal" as const })),
    ),
  );
  return fonts;
}

import { LogoShapes, LOGO_WIDTH } from "@/components/Logo";

const INK = "#1d1d1f";
const PAPER = "#ffffff";
const SIGNAL = "#0071e3";
const MUTED = "#6e6e73";
const TRACK = "#e8e8ed";

function LogoMark({ size }: { size: number }) {
  // Même dessin que le logo du site (src/components/Logo.tsx) : hauteur des capitales = size * 0.72.
  const h = size * 0.72 * (36 / 32);
  return (
    <svg width={(h * LOGO_WIDTH) / 36} height={h} viewBox={`0 0 ${LOGO_WIDTH} 36`}>
      {LogoShapes({ ink: INK, accent: SIGNAL })}
    </svg>
  );
}

export async function renderShareImage(uaiRaw: string, format: "og" | "story") {
  const uai = uaiRaw.toUpperCase();
  const school = await getSchool(uai);
  if (!school || school.hidden) return new Response("Introuvable", { status: 404 });
  const r = await getSchoolResultsCached(uai);
  const showPercent = r.total >= MIN_FOR_PERCENT;
  const top = r.categories.filter((c) => c.supports > 0).slice(0, 3);
  const story = format === "story";
  const W = story ? 1080 : 1200;
  const H = story ? 1920 : 630;
  const host = siteUrl().replace(/^https?:\/\//, "");
  const nameSize = school.name.length > 60 ? (story ? 70 : 40) : school.name.length > 38 ? (story ? 84 : 46) : story ? 100 : 58;

  const rows = top.map((c, i) => {
    const value = showPercent ? `${c.percent}%` : `${c.supports}`;
    const width = showPercent ? c.percent ?? 0 : Math.round((c.supports / Math.max(1, top[0].supports)) * 100);
    return (
      <div key={c.key} style={{ display: "flex", flexDirection: "column", marginTop: story ? 44 : 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: story ? 46 : 24, color: INK }}>{categoryLabel(c.key, school.kind)}</span>
          <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: story ? 64 : 30, color: INK }}>{value}</span>
        </div>
        <div style={{ display: "flex", height: story ? 26 : 10, borderRadius: 999, background: TRACK, marginTop: story ? 8 : 4 }}>
          <div style={{ display: "flex", width: `${Math.max(width, 3)}%`, height: "100%", borderRadius: 999, background: SIGNAL }} />
        </div>
      </div>
    );
  });

  const image = new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", flexDirection: "column", background: PAPER, padding: story ? 90 : 56, fontFamily: "Inter" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <LogoMark size={story ? 120 : 68} />
          <span style={{ fontSize: story ? 34 : 22, fontWeight: 600, color: SIGNAL }}>{school.kind === "universite" ? "Ta fac. Ta voix." : school.kind === "ecole" ? "Ton école. Ta voix." : "Ton lycée. Ta voix."}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: story ? 140 : 26 }}>
          <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: nameSize, lineHeight: 1.05, color: INK, letterSpacing: -1.5 }}>{school.name}</span>
          <span style={{ fontSize: story ? 40 : 24, color: MUTED, marginTop: story ? 22 : 10, fontWeight: 500 }}>{school.city}</span>
          <span style={{ fontSize: story ? 50 : 26, color: INK, marginTop: story ? 60 : 14, fontWeight: 500 }}>
            {r.total > 0 ? `« Voici les préoccupations exprimées dans ${words(school.kind).our}. »` : `« ${words(school.kind).our[0].toUpperCase()}${words(school.kind).our.slice(1)} peut enfin se faire entendre. »`}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginTop: story ? 40 : 4 }}>
          {rows.length ? rows : (
            <span style={{ fontSize: story ? 44 : 26, color: MUTED, marginTop: story ? 40 : 20 }}>Aucune participation pour l&apos;instant : sois la première voix.</span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: story ? "column-reverse" : "row", justifyContent: "space-between", alignItems: story ? "flex-start" : "center", gap: story ? 36 : 16 }}>
          <span style={{ fontSize: story ? 30 : 18, color: MUTED, fontWeight: 500, maxWidth: story ? 900 : 560 }}>
            {`${r.total} participation${r.total > 1 ? "s" : ""} · non représentatif · ${host}`}
          </span>
          <div style={{ display: "flex", background: SIGNAL, color: "#fff", borderRadius: 999, padding: story ? "28px 44px" : "14px 26px", fontSize: story ? 40 : 24, fontWeight: 600 }}>
            Faire entendre {words(school.kind).my}
          </div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts: await loadFonts() },
  );
  image.headers.set("cache-control", "public, max-age=120, s-maxage=300, stale-while-revalidate=600");
  return image;
}
