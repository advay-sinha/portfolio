"use client";

import { useEffect, useRef, useState } from "react";

import { AboutSection } from "./AboutSection";
import { Atmosphere } from "./Atmosphere";
import { BootOverlay } from "./BootOverlay";
import { CertsSection } from "./CertsSection";
import { ContactSection } from "./ContactSection";
import { JourneySection } from "./JourneySection";
import { NavRail } from "./NavRail";
import { Terminal } from "./Terminal";
import { useRiseReveal } from "./useRiseReveal";
import { VaultSection } from "./VaultSection";

/**
 * The home experience — the descent as six depths over a cyberpunk
 * atmosphere. Plain scroll, IntersectionObserver reveals, and a
 * scroll-spy rail; no lenis/gsap camera. Boot overlay gates the hero
 * reveal. Content comes from the typed content/ modules throughout.
 */

function Corridor({ to }: { to: string }) {
  return (
    <div aria-hidden className="np-corridor">
      <span />
      {to}
      <span />
    </div>
  );
}

export function Portfolio() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [booted, setBooted] = useState(false);

  useRiseReveal(rootRef);

  // SMIL (animateMotion) ignores CSS, so the reduced-motion media query
  // can't stop the traveling schematic dots — remove the nodes outright.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      root.querySelectorAll("animateMotion, animate").forEach((a) => a.remove());
    }
  }, []);

  return (
    <div className="np" ref={rootRef}>
      {/* No-JS / hydration-failure resilience: the boot overlay never
          fades and reveals never fire without JS, so degrade to the
          fully-shown document. */}
      <noscript>
        <style>{`.np [data-reveal],.np [data-rise]{opacity:1!important;transform:none!important}.np-boot{display:none!important}`}</style>
      </noscript>
      <Atmosphere />
      <NavRail />

      <main className="np-main">
        <AboutSection booted={booted} />
        <Corridor to="transit → depth.02 · project vault" />
        <VaultSection />
        <Corridor to="transit → depth.03 · journey" />
        <JourneySection />
        <Corridor to="transit → depth.04 · credentials" />
        <CertsSection />
        <Corridor to="transit → depth.05 · terminal" />
        <Terminal />
        <Corridor to="transit → depth.06 · contact" />
      </main>

      {/* Contact node lives outside .np-main so the footer spans the full
          viewport width; every other section keeps the centered column. */}
      <ContactSection />

      <BootOverlay onDone={() => setBooted(true)} />
    </div>
  );
}
