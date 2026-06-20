"use client";

import { useEffect, useRef } from "react";

/** Depth rail order — id maps to the section anchors in the main column. */
const ITEMS = [
  { id: "core", label: "ABOUT" },
  { id: "vault", label: "PROJECTS" },
  { id: "logs", label: "JOURNEY" },
  { id: "live", label: "CERTS" },
  { id: "terminal", label: "TERMINAL" },
  { id: "contact", label: "CONTACT" },
] as const;

const IDS = ITEMS.map((i) => i.id);

export function NavRail() {
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const links = new Map<string, HTMLElement>();
    nav.querySelectorAll<HTMLElement>("a[data-nav]").forEach((a) => {
      const id = a.getAttribute("data-nav");
      if (id) links.set(id, a);
    });

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const mid = window.innerHeight * 0.4;
        let cur = IDS[0];
        for (const id of IDS) {
          const sec = document.getElementById(id);
          if (sec && sec.getBoundingClientRect().top <= mid) cur = id;
        }
        links.forEach((a, id) =>
          a.setAttribute("data-active", id === cur ? "1" : "0")
        );
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav ref={navRef} aria-label="depth" className="np-nav">
      {ITEMS.map((it) => (
        <a key={it.id} data-nav={it.id} href={`#${it.id}`}>
          <span>{it.label}</span>
          <span className="tick" />
        </a>
      ))}
    </nav>
  );
}
