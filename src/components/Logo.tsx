/** Logo typographique VOIX : le « O » devient un symbole de la paix, couleur d'action. */
export function Logo({ className = "h-6", mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox="0 0 132 36" className={className} role="img" aria-label="VOIX">
      <title>VOIX</title>
      <g fill="currentColor">
        <path d="M0 2h8.6l8.2 23.4L25 2h8.4L21.2 34h-8.8z" />
        <rect x="76.5" y="2" width="8" height="32" rx="1.2" />
        <path d="M89 2h9.4l6.9 10.4L112.2 2h9.3l-11.6 15.8L122.2 34h-9.4l-7.6-11.3-7.6 11.3h-9.3L100.6 17.8z" />
      </g>
      <circle cx="54.5" cy="18" r="16" fill={mono ? "currentColor" : "var(--signal)"} />
      <g fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
        <circle cx="54.5" cy="18" r="10.5" />
        <path d="M54.5 7.5v21M54.5 18l-7.4 7.4M54.5 18l7.4 7.4" />
      </g>
    </svg>
  );
}
