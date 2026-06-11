/**
 * capability.ts — degradation-ladder tier detection
 * (implementation-architecture §13 ladder; strata-spec §14).
 *
 * Feature + environment checks only. No UA sniffing, no benchmark
 * theater: a synthetic FPS test on load would burn the boot-sequence
 * budget measuring hardware instead of using it, and would still
 * misclassify thermally-throttled devices. The honest signals are the
 * ones the platform already exposes — preference media queries,
 * pointer/viewport class, and feature support — plus the future
 * passive jank tripwire (below).
 *
 * Tier semantics (each rung is a designed experience, not a downgrade):
 * - "full"    — phases with the B1 blur ramp, fog falloff, drift.
 * - "no-blur" — phases via opacity + scale only; flat fog; no drift
 *               (mobile default — strata-spec §12).
 * - "static"  — the server-rendered document. No Lenis, no GSAP, no
 *               veil; GSAP/Lenis bundles are never even fetched
 *               (DescentProvider imports them behind the tier check).
 *
 * Thresholds:
 * - prefers-reduced-motion → "static". Absolute; also honored live
 *   mid-session via onReducedMotionChange.
 * - no CSS filter support → "no-blur" (the B1 ramp is the only thing
 *   blur buys; everything else degrades by data, not by feature).
 * - coarse pointer AND viewport < 768px → "no-blur". Mobile-class
 *   device by behavior, not by UA string. A desktop touchscreen
 *   (coarse but wide) keeps "full"; a narrow desktop window with a
 *   mouse keeps "full" — both can afford the blur ramp.
 *
 * Determinism: same environment, same answer. Safe to call repeatedly.
 *
 * Future demotion integration (NOT implemented here, by design):
 * DescentProvider will sample requestAnimationFrame deltas passively
 * inside its existing ticks during the first two corridor transits
 * (implementation-architecture §11). Sustained drops below ~50fps call
 * demote(tier) — one rung, permanent for the session, applied only
 * between chambers, never announced. This module stays the single
 * authority on what the rungs are; the tripwire only decides when to
 * step down.
 */

import { MOBILE_BREAKPOINT_PX } from "./scroll-map";

export type MotionTier = "full" | "no-blur" | "static";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

function supportsLiveBlur(): boolean {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("filter", "blur(4px)")
  );
}

function isMobileClassViewport(): boolean {
  return (
    window.matchMedia("(pointer: coarse)").matches &&
    window.innerWidth < MOBILE_BREAKPOINT_PX
  );
}

/**
 * Resolve the rendering tier for this session. Server-side it answers
 * "static" — which is exactly what the server renders, so SSR and the
 * pre-hydration client are the same experience by construction.
 */
export function detectTier(): MotionTier {
  if (typeof window === "undefined") return "static";
  if (prefersReducedMotion()) return "static";
  if (!supportsLiveBlur()) return "no-blur";
  if (isMobileClassViewport()) return "no-blur";
  return "full";
}

/** One rung down the ladder. Idempotent at the bottom. */
export function demote(tier: MotionTier): MotionTier {
  return tier === "full" ? "no-blur" : "static";
}

/**
 * Live preference honoring (strata-spec §13): switching reduced-motion
 * mid-session moves the tier without reload. Returns an unsubscribe.
 */
export function onReducedMotionChange(
  callback: (reduced: boolean) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  const handler = (event: MediaQueryListEvent) => callback(event.matches);
  query.addEventListener("change", handler);
  return () => query.removeEventListener("change", handler);
}
