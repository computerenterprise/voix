"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui", background: "#f5f2ec", color: "#0e0e10", padding: 24 }}>
        <h1>VOIX est momentanément indisponible.</h1>
        <p>Réessaie dans quelques instants.</p>
        <button onClick={reset}>Réessayer</button>
      </body>
    </html>
  );
}
