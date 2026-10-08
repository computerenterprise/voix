/** Logo typographique VOIX : le « O » devient un point d'émission plein, couleur signature. */
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
      <circle cx="54.5" cy="18" r="5.2" fill={mono ? "var(--paper)" : "var(--ink)"} />
    </svg>
  );
}
