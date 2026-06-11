/**
 * motion/tokens.ts — the JS mirror of tokens.css motion law
 * (implementation-architecture §7: "Motion tokens exist once, in
 * tokens.css; motion/tokens.ts reads/mirrors them so GSAP and Framer
 * consume identical values").
 *
 * Why mirror instead of reading CSS vars live: Framer variants are
 * plain objects resolved at module scope, and the server has no
 * computed styles — runtime reads would make variants async and SSR
 * forked. So the values are mirrored as typed constants, and
 * `assertMotionTokenParity()` reads the real CSS custom properties in
 * development and warns on any drift. The CSS remains the single
 * source of truth; this module is its checked copy, not a second
 * authority. A duration changed in tokens.css without updating this
 * file fails loudly on the next dev load.
 *
 * No spring constants exist here by design — the forbidden-wobble law
 * is structural: there is nothing to import.
 */

/** Durations in seconds (Framer's unit). Mirrors --motion-* in tokens.css. */
export const DURATION_S = {
  /** --motion-instant 120ms — hover feedback, state ticks. */
  instant: 0.12,
  /** --motion-swift 240ms — element transitions, reveals. */
  swift: 0.24,
  /** --motion-deliberate 480ms — panel entrances, section shifts. */
  deliberate: 0.48,
  /** --motion-cinematic 900ms — scene transitions, boot moments. */
  cinematic: 0.9,
} as const;

/** --motion-stagger 70ms — reveal cascade step; groups cap at 6. */
export const STAGGER_S = 0.07;

/** --motion-threshold 300ms — hold beat on chamber arrival. */
export const THRESHOLD_BEAT_MS = 300;

/** --ease-out-facility — decisive start, soft landing. The default. */
export const EASE_OUT_FACILITY: [number, number, number, number] = [
  0.16, 1, 0.3, 1,
];

/** --ease-inout-cinematic — scene-level transitions only. */
export const EASE_INOUT_CINEMATIC: [number, number, number, number] = [
  0.65, 0, 0.35, 1,
];

/* ----------------------------------------------------------------
   DEV PARITY GATE — the "reads" half of read/mirror
   ---------------------------------------------------------------- */

const CSS_MIRROR_MS: Record<string, number> = {
  "--motion-instant": DURATION_S.instant * 1000,
  "--motion-swift": DURATION_S.swift * 1000,
  "--motion-deliberate": DURATION_S.deliberate * 1000,
  "--motion-cinematic": DURATION_S.cinematic * 1000,
  "--motion-stagger": STAGGER_S * 1000,
  "--motion-threshold": THRESHOLD_BEAT_MS,
};

const parseMs = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed.endsWith("ms")) return parseFloat(trimmed);
  if (trimmed.endsWith("s")) return parseFloat(trimmed) * 1000;
  return null;
};

/**
 * Development-only: read the live CSS custom properties and warn if
 * this mirror has drifted from tokens.css. Skipped under
 * prefers-reduced-motion, where the CSS legitimately collapses
 * durations to the swift token.
 */
export function assertMotionTokenParity(): void {
  if (process.env.NODE_ENV !== "development") return;
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const styles = getComputedStyle(document.documentElement);
  for (const [name, expected] of Object.entries(CSS_MIRROR_MS)) {
    const actual = parseMs(styles.getPropertyValue(name));
    if (actual !== null && actual !== expected) {
      console.warn(
        `[motion/tokens] ${name} drifted: tokens.css has ${actual}ms, JS mirror has ${expected}ms. Update src/motion/tokens.ts.`
      );
    }
  }
}
