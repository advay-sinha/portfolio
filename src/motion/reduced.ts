/**
 * motion/reduced.ts — the reduced-motion variant set
 * (implementation-architecture §12; design-system §8).
 *
 * Designed, not disabled: under prefers-reduced-motion every reveal
 * kind becomes the same quiet event — opacity only, --motion-swift,
 * zero delay (the stagger token collapses to 0 in CSS; this set
 * matches it). No y-offsets: the 8px panel rise carries no information
 * that opacity doesn't, so it is dropped rather than shrunk. No
 * sequencing: a chamber resolves as one unit, which is exactly how the
 * static document already reads.
 *
 * The swap happens once, at the MotionBoundary — chambers never branch
 * on the preference themselves.
 */

import type { Variants } from "framer-motion";

import type { RevealVariantSet } from "@/motion/reveal";
import { DURATION_S, EASE_OUT_FACILITY } from "@/motion/tokens";

const quietResolve: Variants = {
  hidden: { opacity: 0, transition: { duration: 0 } },
  operational: {
    opacity: 1,
    transition: { duration: DURATION_S.swift, ease: EASE_OUT_FACILITY },
  },
};

export const REDUCED_REVEALS: RevealVariantSet = {
  mono: quietResolve,
  panel: quietResolve,
  resolve: quietResolve,
};
