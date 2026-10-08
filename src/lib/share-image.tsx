import "server-only";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getSchool, getSchoolResultsCached } from "./schools";
import { categoryLabel, MIN_FOR_PERCENT } from "./categories";
import { siteUrl } from "./site";

let fonts: Promise<{ name: string; data: Buffer; weight: 500 | 700 | 800; style: "normal" }[]> | null = null;
function loadFonts() {
  const dir = join(process.cwd(), "assets/fonts");
  fonts ??= Promise.all([
    readFile(join(dir, "bricolage-grotesque-latin-800-normal.woff")).then((data) => ({ name: "Bricolage", data, weight: 800 as const, style: "normal" as const })),
    readFile(join(dir, "figtree-latin-500-normal.woff")).then((data) => ({ name: "Figtree", data, weight: 500 as const, style: "normal" as const })),
    readFile(join(dir, "figtree-latin-700-normal.woff")).then((data) => ({ name: "Figtree", data, weight: 700 as const, style: "normal" as const })),
  ]);
  return fonts;
}

const INK = "#0e0e10";
const PAPER = "#f5f2ec";
const SIGNAL = "#ff4a1c";

function LogoMark({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", fontFamily: "Bricolage", fontSize: size, fontWeight: 800, color: INK, letterSpacing: -2, lineHeight: 1 }}>
      <span>V</span>
      <div style={{ display: "flex", width: size * 0.82, height: size * 0.82, borderRadius: 999, background: SIGNAL, alignItems: "center", justifyContent: "center", margin: `0 ${size * 0.04}px` }}>
        <div style={{ width: size * 0.27, height: size * 0.27, borderRadius: 999, background: INK }} />
      </div>
      <span>IX</span>
    </div>
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
          <span style={{ fontFamily: "Figtree", fontWeight: 700, fontSize: story ? 46 : 24, color: INK }}>{categoryLabel(c.key)}</span>
          <span style={{ fontFamily: "Bricolage", fontWeight: 800, fontSize: story ? 64 : 30, color: INK }}>{value}</span>
        </div>
        <div style={{ display: "flex", height: story ? 26 : 10, borderRadius: 999, background: "#e4ded3", marginTop: story ? 8 : 4 }}>
          <div style={{ display: "flex", width: `${Math.max(width, 3)}%`, height: "100%", borderRadius: 999, background: i === 0 ? SIGNAL : INK }} />
        </div>
      </div>
    );
  });

  const image = new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", flexDirection: "column", background: PAPER, padding: story ? 90 : 56, fontFamily: "Figtree" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <LogoMark size={story ? 92 : 52} />
          <span style={{ fontSize: story ? 34 : 22, fontWeight: 700, color: INK }}>Ton lycée. Ta voix.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: story ? 140 : 26 }}>
          <span style={{ fontFamily: "Bricolage", fontWeight: 800, fontSize: nameSize, lineHeight: 1, color: INK, letterSpacing: -2, textTransform: "uppercase" }}>{school.name}</span>
          <span style={{ fontSize: story ? 40 : 24, color: "#615d56", marginTop: story ? 22 : 10, fontWeight: 500 }}>{school.city}</span>
          <span style={{ fontSize: story ? 50 : 26, color: INK, marginTop: story ? 60 : 14, fontWeight: 700 }}>
            {r.total > 0 ? "« Voici les préoccupations exprimées dans notre lycée. »" : "« Notre lycée peut enfin se faire entendre. »"}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginTop: story ? 40 : 4 }}>
          {rows.length ? rows : (
            <span style={{ fontSize: story ? 44 : 26, color: "#615d56", marginTop: story ? 40 : 20 }}>Aucune participation pour l&apos;instant : sois la première voix.</span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: story ? "column-reverse" : "row", justifyContent: "space-between", alignItems: story ? "flex-start" : "center", gap: story ? 36 : 16 }}>
          <span style={{ fontSize: story ? 30 : 18, color: "#615d56", fontWeight: 500, maxWidth: story ? 900 : 560 }}>
            {`${r.total} participation${r.total > 1 ? "s" : ""} · non représentatif · ${host}`}
          </span>
          <div style={{ display: "flex", background: SIGNAL, color: INK, borderRadius: 999, padding: story ? "28px 44px" : "14px 26px", fontSize: story ? 40 : 24, fontWeight: 700 }}>
            Faire entendre mon lycée
          </div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts: await loadFonts() },
  );
  image.headers.set("cache-control", "public, max-age=120, s-maxage=300, stale-while-revalidate=600");
  return image;
}
