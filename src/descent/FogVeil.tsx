"use client";

import { useEffect, useRef } from "react";

import { useDescent } from "@/descent/DescentProvider";

/**
 * FogVeil — G2, the single atmospheric element of the descent
 * (strata-spec §5, §10).
 *
 * One fixed div. Its background is --nexus-void at a soft radial
 * falloff — denser at the edges, thinner at center, so the path ahead
 * always reads as passable. Its opacity is written by the
 * DescentProvider as a pure function of scroll (fogAt): 0 inside focus
 * bands, peaking mid-corridor. The veil itself contains no behavior.
 *
 * Implementation reasoning:
 * - This is attenuation, not weather: light losing distance inside a
 *   structure. Hence a static gradient whose only animated property is
 *   opacity — no drifting textures, no noise, no layered wisps, no
 *   color (fog never carries color; beacons will shine through it,
 *   they are plane-owned).
 * - It sits at --z-fog, BETWEEN the future proxies (G1) and the active
 *   planes (G3): fog dims the void and the distance, never the chamber
 *   the visitor is in. Non-focus planes dim via their own phase opacity
 *   (depth dim, strata-spec §5) — no second fog element exists.
 * - Mobile: flat void overlay instead of the radial (strata-spec §12),
 *   done with a max-md background swap — zero JS, and the cheaper paint
 *   lands exactly where the cheaper device is.
 * - Static tier: never mounts. The reduced-motion model has no fog by
 *   spec, and the SSR document (tier resolves to "static" on the server)
 *   ships without this element at all.
 *
 * Performance reasoning:
 * - One element, one composited property (opacity), driven by a GSAP
 *   quickSetter outside React — zero re-renders, zero layout, zero paint
 *   after first composite.
 *
 * Blur-budget reasoning:
 * - No filter, no backdrop-filter — ever. The page's one live filter
 *   (B1) belongs to the approaching plane; the one backdrop-blur budget
 *   stays reserved for the L4 dossier overlay (strata-spec §8). The
 *   veil achieves atmosphere purely with an alpha gradient, leaving
 *   both budgets untouched.
 */
export function FogVeil() {
  const ref = useRef<HTMLDivElement>(null);
  const { tier, registerVeil } = useDescent();

  useEffect(() => {
    if (ref.current === null) return;
    return registerVeil(ref.current);
  }, [registerVeil, tier]);

  // The static tier has no fog veil — designed absence, not a disabled feature.
  if (tier === "static") return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className={[
        "pointer-events-none fixed inset-0 z-(--z-fog) opacity-0",
        // Radial attenuation: passable center, dense edges.
        "[background:radial-gradient(120%_120%_at_50%_50%,transparent_30%,var(--nexus-void)_85%)]",
        // Mobile: flat dim overlay (strata-spec §12).
        "max-md:[background:var(--nexus-void)]",
      ].join(" ")}
    />
  );
}
