/**
 * Logo VOIX : le « O » est un symbole de la paix dessiné comme une lettre
 * (même hauteur de capitale, même graisse de trait, espacement régulier entre les quatre lettres).
 */
const CAP = 32; // hauteur des capitales (y de 2 à 34)
const GAP = 4.5; // espace entre les lettres
const V_W = 33.4;
const O_R = CAP / 2 + 0.6; // léger dépassement optique : un rond paraît plus petit qu'une lettre droite de même hauteur
const O_CX = V_W + GAP - 1.5 + O_R; // le « V » s'ouvre en haut : on resserre un peu pour un espace visuellement égal
const I_X = O_CX + O_R + GAP;
const X_X = I_X + 8 + GAP;
export const LOGO_WIDTH = X_X + 33.2;

export function LogoShapes({ ink, accent }: { ink: string; accent: string }) {
  const ring = 5; // anneau et branches assez fins pour que le symbole reste lisible en petit
  const r = O_R - ring / 2;
  const d = r * Math.SQRT1_2;
  const cy = 18;
  return (
    <g>
      <g fill={ink}>
        <path d="M0 2h8.6l8.2 23.4L25 2h8.4L21.2 34h-8.8z" />
        <rect x={I_X} y="2" width="8" height="32" rx="1.2" />
        <path transform={`translate(${X_X - 89} 0)`} d="M89 2h9.4l6.9 10.4L112.2 2h9.3l-11.6 15.8L122.2 34h-9.4l-7.6-11.3-7.6 11.3h-9.3L100.6 17.8z" />
      </g>
      <g fill="none" stroke={accent}>
        <circle cx={O_CX} cy={cy} r={r} strokeWidth={ring} />
        <path strokeWidth="3.8" d={`M${O_CX} ${cy - r}V${cy + r}M${O_CX} ${cy}L${O_CX - d} ${cy + d}M${O_CX} ${cy}L${O_CX + d} ${cy + d}`} />
      </g>
    </g>
  );
}

export function Logo({ className = "h-6", mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox={`0 0 ${LOGO_WIDTH} 36`} className={className} role="img" aria-label="VOIX">
      <title>VOIX</title>
      {LogoShapes({ ink: "currentColor", accent: mono ? "currentColor" : "var(--signal)" })}
    </svg>
  );
}
