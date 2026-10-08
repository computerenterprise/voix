"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

/**
 * Sur l'accueil, le grand logo central suffit : le petit logo de l'en-tête n'apparaît
 * qu'une fois le grand logo sorti de l'écran, pour ne jamais afficher deux logos en même temps.
 */
export function HeaderLogo() {
  const home = usePathname() === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!home) return;
    const onScroll = () => setScrolled(window.scrollY > 220);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [home]);

  const hidden = home && !scrolled;
  return (
    <Link
      href="/"
      aria-label="VOIX, accueil"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={`shrink-0 rounded-md transition-opacity duration-300 ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <Logo className="h-[26px] w-auto sm:h-[30px]" />
    </Link>
  );
}
