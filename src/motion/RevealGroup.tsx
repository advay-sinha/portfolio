"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { m } from "framer-motion";

import { useThresholdReveal } from "@/hooks/useThresholdReveal";
import { useRevealSet } from "@/motion/MotionBoundary";
import type { RevealVariantSet } from "@/motion/reveal";

/**
 * Reveal primitives — how a chamber composes its arrival.
 *
 * Usage shape (one composed operation, not independent widgets):
 *   <RevealGroup>            ← owns the threshold trigger + beat
 *     <Reveal kind="mono"  step={0}>…  ← label resolves first
 *     <Reveal kind="panel" step={1}>…  ← structure rises
 *     <Reveal kind="mono"  step={3}>…  ← readouts follow, consecutive steps
 *   </RevealGroup>
 * One group per chamber; steps are the entire choreography. Chambers
 * pass kind + step only — never transition objects, never easings
 * (the ownership gate greps for exactly that).
 *
 * Document-first lifecycle (the part that keeps no-JS coherent):
 * until the group is armed, `animate` is undefined — Framer resolves
 * no variant and serializes no inline styles, so the server HTML is
 * the plain settled document (JS-disabled visitors read a finished
 * page). Keeping the un-armed state style-free is also what makes
 * hydration deterministic: variant resolution depends on the
 * reduced-motion preference, which the server cannot know — so
 * neither side resolves anything until after mount. The pre-paint
 * layout effect then arms the group to "hidden" (hidden variants
 * carry duration:0 — a reset, not an animation), and the threshold
 * trigger fires it to operational once, with the beat. Fire-once
 * means scroll-up never re-performs (pacing law); the group never
 * returns to hidden after firing.
 *
 * Ownership: these m.div wrappers are content nodes INSIDE the
 * StrataPlane wrapper. Framer writes opacity/y here; GSAP writes the
 * plane above; CSS handles hover below. No shared targets exist.
 */

export interface RevealGroupProps {
  children: ReactNode;
  className?: string;
}

export function RevealGroup({ children, className }: RevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const fired = useThresholdReveal(ref);

  // Pre-paint arming: must commit before the first client paint so
  // JS-capable visitors never glimpse settled content ahead of the
  // reveal. (Server HTML stays operational for everyone else.)
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional pre-paint state gate; arming after paint would flash the settled chamber
    setArmed(true);
  }, []);

  // undefined until armed: no variant resolution, no SSR inline
  // styles, no hydration drift between the full and reduced sets.
  const state = armed ? (fired ? "operational" : "hidden") : undefined;

  return (
    <m.div ref={ref} initial={false} animate={state} className={className}>
      {children}
    </m.div>
  );
}

export interface RevealProps {
  /** Which named variant from the reveal vocabulary. */
  kind?: keyof RevealVariantSet;
  /** Position in the chamber's sequence; delay = step × --motion-stagger. */
  step?: number;
  className?: string;
  children: ReactNode;
}

export function Reveal({
  kind = "mono",
  step = 0,
  className,
  children,
}: RevealProps) {
  const set = useRevealSet();
  return (
    <m.div variants={set[kind]} custom={step} className={className}>
      {children}
    </m.div>
  );
}
