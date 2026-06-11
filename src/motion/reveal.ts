/**
 * motion/reveal.ts — the reveal vocabulary, defined once
 * (implementation-architecture §7: chambers never define ad-hoc
 * transition values; new motion = new named variant, reviewed against
 * the Prime Directive).
 *
 * Two variant states, named for what they mean in the facility:
 *   "hidden"      — the element exists but has not come online.
 *   "operational" — resolved, settled, in service.
 * Reveals are systems becoming operational, not UI animating in.
 *
 * Sequencing model — deterministic by construction:
 * every variant accepts a `step` (Framer `custom`); its delay is
 * exactly `step × --motion-stagger`. A chamber composes its arrival by
 * assigning step numbers — same numbers, same choreography, every
 * load, both scroll directions, no randomness anywhere. Stagger groups
 * are consecutive steps; the 6-item cap is enforced by content
 * discipline (capability lists hold ≤6 entries).
 *
 * The hidden state carries `duration: 0`: entering hidden is a state
 * reset (pre-paint arming, never visible), only entering operational
 * is motion. All curves are the token cubic-beziers — no springs
 * exist in this vocabulary.
 */

import type { Variants } from "framer-motion";

import { DURATION_S, EASE_OUT_FACILITY, STAGGER_S } from "@/motion/tokens";

const delayFor = (step: number) => step * STAGGER_S;

/**
 * Mono-line resolve — labels, readouts, status lines. The facility's
 * voice arrives as a swift opacity resolve: machine output appears,
 * it does not travel.
 */
export const monoResolve: Variants = {
  hidden: { opacity: 0, transition: { duration: 0 } },
  operational: (step: number = 0) => ({
    opacity: 1,
    transition: {
      duration: DURATION_S.swift,
      ease: EASE_OUT_FACILITY,
      delay: delayFor(step),
    },
  }),
};

/**
 * Panel rise — structure coming into service: 8px rise + resolve at
 * --motion-deliberate (homepage-experience §4.1). The transform lives
 * on a content node inside the plane; the StrataPlane wrapper is
 * GSAP's and is never a Framer target (firewall, §4.3).
 */
export const panelRise: Variants = {
  hidden: { opacity: 0, y: 8, transition: { duration: 0 } },
  operational: (step: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_S.deliberate,
      ease: EASE_OUT_FACILITY,
      delay: delayFor(step),
    },
  }),
};

/**
 * Slow resolve — diagrams and environmental elements. Opacity only at
 * --motion-cinematic: a schematic developing, deliberately slower than
 * the text around it so it reads as depth, not decoration.
 */
export const slowResolve: Variants = {
  hidden: { opacity: 0, transition: { duration: 0 } },
  operational: (step: number = 0) => ({
    opacity: 1,
    transition: {
      duration: DURATION_S.cinematic,
      ease: EASE_OUT_FACILITY,
      delay: delayFor(step),
    },
  }),
};

/** The full-motion variant set, keyed by reveal kind. */
export interface RevealVariantSet {
  mono: Variants;
  panel: Variants;
  resolve: Variants;
}

export const REVEALS: RevealVariantSet = {
  mono: monoResolve,
  panel: panelRise,
  resolve: slowResolve,
};
