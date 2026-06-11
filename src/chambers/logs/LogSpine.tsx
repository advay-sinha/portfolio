"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useDescent } from "@/descent/DescentProvider";

/**
 * LogSpine — the archive line carrying current through old records
 * (homepage-experience §4.3; strata-spec §9: spine scrub, UNPINNED).
 *
 * Owns exactly one ScrollTrigger: scrub-linked, no pin (the page's
 * single pin stays with VaultTrack — this island never touches the
 * pin budget). Two writes, both within the transform/opacity law:
 * - continuous: scaleY on the spine's fill element via quickSetter —
 *   the spine slowly energizes as the visitor descends. No glow ramp,
 *   no progress-bar energy: the fill is a 1px hairline at glow-dim.
 * - discrete: data-log-state (past / current / ahead) flips on the
 *   entry elements a handful of times per traverse; CSS transitions
 *   answer (current entry gains operational clarity, prior logs stay
 *   visible at reduced presence). Never per-frame React, never per-
 *   frame style writes on entries.
 *
 * Ownership discipline: GSAP writes scaleY to the fill div only.
 * Framer's reveal wrappers live INSIDE each entry <li>; the li's
 * scrub opacity is CSS responding to the data attribute. No element
 * has two writers.
 *
 * Scrub state is bidirectional camera state (strata-spec §15), exempt
 * from play-once: reversing scroll de-energizes the spine exactly as
 * the scroll map dictates. Settled means settled — scroll-mapped, not
 * re-performed.
 *
 * Degradation (designed, each rung):
 * - static tier / reduced motion: no ScrollTrigger; the server markup
 *   IS the pre-drawn spine (fill at full height) with every entry lit.
 * - JS-disabled: same — the de-emphasis states exist only under
 *   [data-spine-active], which only this effect sets.
 */
export interface LogSpineProps {
  children: ReactNode;
}

export function LogSpine({ children }: LogSpineProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const { tier } = useDescent();

  useEffect(() => {
    if (tier === "static") return;

    const wrapper = wrapperRef.current;
    const fill = fillRef.current;
    if (!wrapper || !fill) return;

    let cancelled = false;
    let cleanupGsap: (() => void) | null = null;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      // De-emphasis states switch on only now that the scrub is real.
      wrapper.setAttribute("data-spine-active", "");

      const entries = Array.from(
        wrapper.querySelectorAll<HTMLElement>("[data-log-entry]")
      );

      gsap.set(fill, { scaleY: 0, transformOrigin: "top center" });
      const setScale = gsap.quickSetter(fill, "scaleY") as (v: number) => void;

      let currentIndex = -1;
      const setCurrent = (index: number) => {
        if (index === currentIndex) return;
        currentIndex = index;
        entries.forEach((entry, i) => {
          entry.dataset.logState =
            i < index ? "past" : i === index ? "current" : "ahead";
        });
      };

      const trigger = ScrollTrigger.create({
        id: "log-spine",
        trigger: wrapper,
        start: "top 70%",
        end: "bottom 55%",
        onUpdate: (self) => {
          // Continuous: the spine energizes with descent.
          setScale(self.progress);
          // Discrete: focus depth progression, attribute flips only.
          setCurrent(
            Math.min(
              entries.length - 1,
              Math.floor(self.progress * entries.length)
            )
          );
        },
      });
      // First paint at current scroll — deep links land mid-archive.
      trigger.refresh();

      cleanupGsap = () => {
        trigger.kill();
        gsap.set(fill, { clearProps: "transform" });
        entries.forEach((entry) => {
          delete entry.dataset.logState;
        });
      };
    })();

    return () => {
      cancelled = true;
      cleanupGsap?.();
      wrapper.removeAttribute("data-spine-active");
    };
  }, [tier]);

  return (
    <div ref={wrapperRef} className="group/logs relative">
      {/* The spine: base rail (always present, pre-drawn truth) +
          energized fill (scrub-driven, transform only). */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-px bg-(--nexus-hairline)"
      />
      <div
        ref={fillRef}
        aria-hidden
        className="absolute inset-y-0 left-0 w-px bg-(--nexus-glow-dim)"
      />
      {children}
    </div>
  );
}
