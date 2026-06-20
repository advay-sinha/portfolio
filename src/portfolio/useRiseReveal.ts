"use client";

import { useEffect, type RefObject } from "react";

/**
 * Reveal-on-scroll for every [data-rise] element under `rootRef`.
 * Mirrors the design's wireRise: elements fade/translate in once when
 * they cross into view, then stay (io.unobserve). No-JS / no-IO and
 * reduced-motion fall back to fully shown (CSS handles the latter).
 */
export function useRiseReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-rise]")
    );
    if (items.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.setAttribute("data-shown", "1"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.setAttribute("data-shown", "1");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}
