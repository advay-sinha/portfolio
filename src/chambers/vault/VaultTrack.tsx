"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useDescent } from "@/descent/DescentProvider";
import { claimPin } from "@/descent/pin-budget";
import { MOBILE_BREAKPOINT_PX } from "@/descent/scroll-map";

/**
 * VaultTrack — the page's single pinned passage
 * (homepage-experience §4.2; strata-spec §7: the only sideways camera
 * move and the only pin; interaction-principles §4: ≤150vh, scrub-linked).
 *
 * Owns exactly one ScrollTrigger: pin + lateral scrub. While pinned,
 * camera z plateaus and the camera tracks laterally across the systems —
 * a heavy, linear traverse (ease: "none"; the visitor's hand IS the
 * camera, so any easing here would be velocity hijacking). No snapping,
 * no momentum, no carousel physics: stopping mid-traverse is a valid,
 * composed state, like standing in the corridor.
 *
 * Ownership discipline:
 * - GSAP writes ONE property to ONE element: x on the track div.
 * - Focus transfer is a discrete data-focused attribute flip in
 *   onUpdate (changes a handful of times per traverse, never per
 *   frame); CSS transitions answer it (L4 elevation, 60% recede).
 *   No opacity, no scale, no parallax from GSAP — transform-only law.
 * - Zero React state: refs + DOM attributes; nothing re-renders during
 *   scrub.
 *
 * Pin legality: the engine clears the StrataPlane transform during the
 * vault's focus phase (pinned-stratum exemption in DescentProvider), so
 * the pin never sits inside a transformed containing block. The pin
 * budget is claimed through descent/pin-budget — a second pin anywhere
 * on the page throws in development.
 *
 * Degradation (designed, each rung):
 * - static tier / reduced motion: no ScrollTrigger, no layout change —
 *   panels stack vertically, all visible, fully readable.
 * - mobile (< 768px): unpinned by law (strata-spec §12) — same vertical
 *   stack; the track activates only on pin-capable viewports.
 * - JS-disabled: the server markup IS the vertical stack.
 * The horizontal layout exists only under [data-track-active], which
 * only this effect sets — the stacked document is the default truth.
 */

/** Pin distance — the ≤150vh law, as a number the trigger derives from. */
const PIN_VIEWPORT_FRACTION = 1.5;

export interface VaultTrackProps {
  children: ReactNode;
}

export function VaultTrack({ children }: VaultTrackProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { tier } = useDescent();

  useEffect(() => {
    if (tier === "static") return;

    const wrapper = wrapperRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!wrapper || !viewport || !track) return;

    let cancelled = false;
    let cleanupGsap: (() => void) | null = null;

    void (async () => {
      // Same module instances the DescentProvider engine loaded —
      // resolved from cache, plugin already registered there.
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      // matchMedia, not a one-time innerWidth check: crossing the
      // breakpoint mid-session creates/destroys the pin cleanly in both
      // directions — no orphaned pin on a stacked layout, no pinless
      // desktop after rotating a tablet.
      const mm = gsap.matchMedia();

      mm.add(`(min-width: ${MOBILE_BREAKPOINT_PX}px)`, () => {
        const releasePin = claimPin("vault-track");

        // Switch to the lateral layout only now that the pin is real.
        wrapper.setAttribute("data-track-active", "");

        const panels = Array.from(
          track.querySelectorAll<HTMLElement>("[data-system-panel]")
        );
        let focusedIndex = -1;
        const setFocus = (index: number) => {
          if (index === focusedIndex) return;
          focusedIndex = index;
          panels.forEach((panel, i) => {
            panel.dataset.focused = i === index ? "true" : "false";
          });
        };
        setFocus(0);

        const tween = gsap.to(track, {
          x: () => -Math.max(0, track.scrollWidth - viewport.clientWidth),
          ease: "none", // linear scroll↔position mapping — the camera law
          scrollTrigger: {
            id: "vault-track",
            trigger: viewport,
            start: "top top",
            end: () => `+=${window.innerHeight * PIN_VIEWPORT_FRACTION}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            // Apply the pin one frame early under fast scroll — the
            // wheel can outrun the scroll listener; without this the
            // track visibly overshoots, then snaps back.
            anticipatePin: 1,
            // Discrete traverse flag (twice per pass, never per frame):
            // the nav rail reads it to recede to tick marks — wide
            // focused panels share the rail's right edge, and two
            // readable systems in one column is one too many.
            onToggle: (self) => {
              document.documentElement.toggleAttribute(
                "data-vault-traverse",
                self.isActive
              );
            },
            onUpdate: (self) => {
              // Discrete focus transfer — attribute flips, not per-frame work.
              setFocus(
                Math.min(
                  panels.length - 1,
                  Math.round(self.progress * (panels.length - 1))
                )
              );
            },
          },
        });

        // The layout flip above changed document height; later, webfont
        // swap changes it again. Both invalidate every measurement
        // below the vault — refresh against the settled document.
        ScrollTrigger.refresh();
        const refreshAfterFonts = () => ScrollTrigger.refresh();
        document.fonts?.ready.then(refreshAfterFonts, () => {});

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(track, { clearProps: "transform" });
          panels.forEach((panel) => {
            panel.dataset.focused = "true";
          });
          wrapper.removeAttribute("data-track-active");
          document.documentElement.removeAttribute("data-vault-traverse");
          releasePin();
        };
      });

      cleanupGsap = () => mm.revert();
    })();

    return () => {
      cancelled = true;
      cleanupGsap?.();
    };
  }, [tier]);

  return (
    <div ref={wrapperRef} className="group/track">
      <div
        ref={viewportRef}
        className="group-data-[track-active]/track:flex group-data-[track-active]/track:h-screen group-data-[track-active]/track:items-center group-data-[track-active]/track:overflow-hidden"
      >
        <div
          ref={trackRef}
          className="flex flex-col gap-(--space-lg) group-data-[track-active]/track:w-max group-data-[track-active]/track:flex-row group-data-[track-active]/track:items-stretch group-data-[track-active]/track:gap-(--space-2xl) group-data-[track-active]/track:pr-[20vw] group-data-[track-active]/track:will-change-transform"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
