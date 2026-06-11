"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * NavRail — G4 overlay, the facility's persistent navigation
 * (strata-spec §10; interaction-principles §5).
 *
 * The only client island in the shell. Mono labels prefixed with depth
 * designations (`DEPTH.02 · SYS.VAULT`), right-edge vertical rail,
 * outside the depth simulation.
 *
 * Implementation reasoning:
 * - Client because the active indicator needs viewport observation;
 *   everything else on the page stays server-rendered. Footprint is a
 *   list, one IntersectionObserver, one string of state.
 * - Active section = the stratum crossing a 10vh band at viewport
 *   center (rootMargin -45%/-45%). Center-band beats top-edge
 *   detection for full-viewport planes and needs no scroll listener,
 *   no rAF, no layout reads.
 * - Selector-switch indicator: each item carries a hairline marker that
 *   extends (scaleX, transform-only — never width) and ignites to
 *   --nexus-glow when active. Movement is decisive at --motion-instant;
 *   no sliding pill, no fade-following blob. Active accent is one
 *   24px hairline — well inside the 2% accent budget.
 * - Anchors are real `<a href="#id">`: native keyboard operation
 *   (Tab + Enter), native focus ring from tokens.css, working targets
 *   with JS disabled. No role gymnastics, no key handlers to maintain.
 * - Responsive: below md the labels collapse and the rail reads as
 *   depth tick marks; every target stays ≥44px (touch law). Names
 *   persist via aria-label, so the accessible experience is identical
 *   at every width. Nothing is display:none-without-replacement.
 *
 * Future extensibility:
 * - Active state will derive from DescentProvider (ScrollTrigger
 *   callbacks → context) once the depth system exists; the observer
 *   here is the static-tier fallback and the swap is internal — the
 *   rendered markup and props do not change.
 * - Anchor jumps will route through `lenis.scrollTo` (accelerated
 *   dolly, ≤1200ms) via a provider-level click interception; the
 *   anchors themselves stay as the no-JS fallback.
 * - Depth peek (proxy sharpening on hover, strata-spec §10) arrives
 *   with proxies, not before.
 */

export interface NavRailItem {
  /** Anchor target — the StrataPlane id. */
  id: string;
  /** Depth designation, e.g. "DEPTH.02". */
  depth: string;
  /** Chamber label, e.g. "SYS.VAULT". */
  label: string;
}

export interface NavRailProps {
  items: NavRailItem[];
}

const markerTransition =
  "[transition:transform_var(--motion-instant)_var(--ease-out-facility),background-color_var(--motion-instant)_var(--ease-out-facility)]";
const labelTransition =
  "[transition:color_var(--motion-instant)_var(--ease-out-facility),opacity_var(--motion-deliberate)_var(--ease-out-facility)]";

export function NavRail({ items }: NavRailProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      // 10vh observation band centered in the viewport: exactly one
      // stratum can occupy it, so active state never flickers between
      // adjacent planes.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    for (const item of items) {
      const plane = document.getElementById(item.id);
      if (plane) observer.observe(plane);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Facility strata"
      className={cn(
        "fixed top-1/2 right-(--space-2xs) z-(--z-overlay) -translate-y-1/2 md:right-(--space-md)",
        // The rail appears after boot completes (homepage-experience §7):
        // BootSequence holds [data-boot-pending] on <html> until settle;
        // removal fades the rail in over --motion-deliberate. No JS, no
        // attribute, no suppression — the static document keeps its nav.
        "opacity-100 transition-opacity duration-(--motion-deliberate) ease-(--ease-out-facility)",
        "[[data-boot-pending]_&]:pointer-events-none [[data-boot-pending]_&]:opacity-0"
      )}
    >
      <ul className="flex flex-col">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-label={`${item.depth} · ${item.label}`}
                aria-current={active ? "true" : undefined}
                className="group flex min-h-11 items-center justify-end gap-(--space-xs) px-(--space-2xs)"
              >
                <span
                  aria-hidden
                  className={cn(
                    "hidden md:inline",
                    "[font-family:var(--font-machine)] [font-weight:var(--weight-medium)]",
                    "text-(length:--text-label) tracking-(--tracking-label) uppercase tabular-nums",
                    labelTransition,
                    // During the vault traverse the rail recedes to tick
                    // marks: VaultTrack raises [data-vault-traverse] on
                    // <html> while the pin is active — wide focused
                    // panels reach the rail's column, and wayfinding
                    // must lose that contest. Ticks and aria-labels
                    // remain; the words return on release.
                    "[[data-vault-traverse]_&]:opacity-0",
                    active
                      ? "text-(color:--nexus-text)"
                      : "text-(color:--nexus-muted) group-hover:text-(color:--nexus-text)"
                  )}
                >
                  {item.depth} · {item.label}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "h-px w-(--space-md) origin-right",
                    markerTransition,
                    active
                      ? "scale-x-100 bg-(--nexus-glow)"
                      : "scale-x-50 bg-(--nexus-hairline) group-hover:scale-x-75 group-hover:bg-(--nexus-muted)"
                  )}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
